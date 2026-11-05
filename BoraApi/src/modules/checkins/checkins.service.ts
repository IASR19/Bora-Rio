import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Not, Repository } from 'typeorm';

import { BusinessException } from '../../common/exceptions/business.exception';
import { EventParticipation } from '../events/entities/event-participation.entity';
import { EventsService } from '../events/events.service';
import { ConfirmCheckinDto } from './dto/confirm-checkin.dto';
import { CheckIn } from './entities/checkin.entity';

const QR_TOKEN_TTL_SECONDS = 30;

@Injectable()
export class CheckinsService {
  constructor(
    @InjectRepository(CheckIn) private readonly checkinsRepository: Repository<CheckIn>,
    private readonly eventsService: EventsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Simulates the establishment's dynamic QR display (see escopo.md #24).
   * In production this is rendered on a screen/tablet at the venue, not in the guest's app.
   */
  countByUser(userId: string): Promise<number> {
    return this.checkinsRepository.count({ where: { userId } });
  }

  async generateQrToken(eventId: string): Promise<{ qrToken: string; expiresInSeconds: number }> {
    await this.eventsService.findParticipatingById(eventId);
    const qrToken = this.jwtService.sign(
      { eventId, nonce: randomUUID() },
      { secret: this.configService.get<string>('CHECKIN_QR_SECRET'), expiresIn: `${QR_TOKEN_TTL_SECONDS}s` },
    );
    return { qrToken, expiresInSeconds: QR_TOKEN_TTL_SECONDS };
  }

  async confirm(userId: string, dto: ConfirmCheckinDto): Promise<CheckIn> {
    let payload: { eventId: string; nonce: string };
    try {
      payload = this.jwtService.verify(dto.qrToken, {
        secret: this.configService.get<string>('CHECKIN_QR_SECRET'),
      });
    } catch {
      throw new BusinessException('QR code inválido ou expirado');
    }

    if (payload.eventId !== dto.eventId) {
      throw new BusinessException('QR code não pertence a este evento');
    }

    return this.eventsService.withParticipatingEvent(dto.eventId, async (event, manager) => {
      const checkinsRepository = manager.getRepository(CheckIn);
      const participationRepository = manager.getRepository(EventParticipation);

      const existing = await checkinsRepository.findOne({ where: { userId, eventId: dto.eventId } });
      if (existing) {
        throw new BusinessException('Check-in já realizado para este evento');
      }

      const checkin = await checkinsRepository.save(
        checkinsRepository.create({
          userId,
          eventId: event.id,
          qrNonce: payload.nonce,
          checkedInAt: new Date(),
          deviceId: dto.deviceId,
        }),
      );

      let participation = await participationRepository.findOne({ where: { userId, eventId: event.id } });
      if (!participation) {
        participation = participationRepository.create({ userId, eventId: event.id });
      }
      participation.viewed = true;
      participation.checkedIn = true;
      await participationRepository.save(participation);

      // "3 pessoas diferentes, fora o criador" (ver EventsService.publishIfTrusted) —
      // o check-in do próprio criador não conta como prova social.
      const checkinCount = await checkinsRepository.count({
        where: { eventId: event.id, ...(event.createdBy ? { userId: Not(event.createdBy) } : {}) },
      });
      await this.eventsService.publishIfTrusted(event.id, checkinCount, manager);

      return checkin;
    });
  }
}
