import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CheckIn } from '../checkins/entities/checkin.entity';
import { Event, EventStatus } from '../events/entities/event.entity';
import { EventParticipation } from '../events/entities/event-participation.entity';
import { RewardRedemption } from '../rewards/entities/reward-redemption.entity';
import { User } from '../users/entities/user.entity';
import { findOwnedVenue, getOwnedVenue } from './business-ownership';

const TIME_ZONE = 'America/Sao_Paulo';
const DEFAULT_DAYS = 30;
const EVENTS_TABLE_LIMIT = 50;

type EventCounts = { interested: number; confirmed: number; checkins: number; giftRedemptions: number };

/** 'YYYY-MM-DD' no fuso de São Paulo (en-CA formata exatamente assim). */
function saoPauloDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date);
}

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventParticipation)
    private readonly participationRepository: Repository<EventParticipation>,
    @InjectRepository(CheckIn) private readonly checkinsRepository: Repository<CheckIn>,
    @InjectRepository(RewardRedemption)
    private readonly redemptionsRepository: Repository<RewardRedemption>,
  ) {}

  /** Situação do cadastro comercial (qualquer status), usada pela tela "Em análise". */
  async me(userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (user?.accountType !== 'business') {
      throw new ForbiddenException('Disponível apenas para contas de estabelecimento.');
    }
    return {
      status: user.businessVerificationStatus,
      note: user.businessVerificationNote,
      venue: await findOwnedVenue(this.eventsRepository.manager, userId),
    };
  }

  async events(userId: string): Promise<Event[]> {
    const venue = await getOwnedVenue(this.eventsRepository.manager, userId);
    return this.eventsRepository.find({
      where: { venueId: venue.id },
      relations: ['venue'],
      order: { startsAt: 'DESC' },
    });
  }

  async dashboard(userId: string, days = DEFAULT_DAYS) {
    const venue = await getOwnedVenue(this.eventsRepository.manager, userId);
    const events = await this.eventsRepository.find({
      where: { venueId: venue.id },
      order: { startsAt: 'DESC' },
    });

    // Os `days` dias da janela (do mais antigo até hoje), já no calendário de São Paulo.
    const labels = Array.from({ length: days }, (_, index) =>
      saoPauloDate(new Date(Date.now() - (days - 1 - index) * 24 * 60 * 60 * 1000)),
    );

    const [participations, checkins, redemptions, byDay] = await Promise.all([
      this.participationRepository
        .createQueryBuilder('p')
        .innerJoin('p.event', 'e')
        .select('p.eventId', 'eventId')
        .addSelect('(COUNT(*) FILTER (WHERE p.interested))::int', 'interested')
        .addSelect('(COUNT(*) FILTER (WHERE p.confirmed))::int', 'confirmed')
        .where('e.venueId = :venueId', { venueId: venue.id })
        .groupBy('p.eventId')
        .getRawMany<{ eventId: string; interested: number; confirmed: number }>(),
      this.checkinsRepository
        .createQueryBuilder('c')
        .innerJoin('c.event', 'e')
        .select('c.eventId', 'eventId')
        .addSelect('COUNT(*)::int', 'count')
        .where('e.venueId = :venueId', { venueId: venue.id })
        .groupBy('c.eventId')
        .getRawMany<{ eventId: string; count: number }>(),
      this.redemptionsRepository
        .createQueryBuilder('rr')
        .innerJoin('rr.reward', 'r')
        .innerJoin('r.event', 'e')
        .select('r.eventId', 'eventId')
        .addSelect('COUNT(*)::int', 'count')
        .where('e.venueId = :venueId', { venueId: venue.id })
        .andWhere("r.kind = 'gift'")
        .groupBy('r.eventId')
        .getRawMany<{ eventId: string; count: number }>(),
      this.checkinsRepository
        .createQueryBuilder('c')
        .innerJoin('c.event', 'e')
        .select(`to_char(c.checked_in_at AT TIME ZONE '${TIME_ZONE}', 'YYYY-MM-DD')`, 'label')
        .addSelect('COUNT(*)::int', 'count')
        .where('e.venueId = :venueId', { venueId: venue.id })
        .andWhere(`(c.checked_in_at AT TIME ZONE '${TIME_ZONE}')::date >= CAST(:start AS date)`, {
          start: labels[0],
        })
        .groupBy('label')
        .getRawMany<{ label: string; count: number }>(),
    ]);

    const counts = new Map<string, EventCounts>();
    const countsOf = (eventId: string): EventCounts => {
      let entry = counts.get(eventId);
      if (!entry) {
        entry = { interested: 0, confirmed: 0, checkins: 0, giftRedemptions: 0 };
        counts.set(eventId, entry);
      }
      return entry;
    };
    for (const row of participations) {
      // "interessados" conta todo mundo que marcou interesse (inclui quem depois confirmou): é o topo do funil.
      countsOf(row.eventId).interested = Number(row.interested);
      countsOf(row.eventId).confirmed = Number(row.confirmed);
    }
    for (const row of checkins) countsOf(row.eventId).checkins = Number(row.count);
    for (const row of redemptions) countsOf(row.eventId).giftRedemptions = Number(row.count);

    const totals = {
      events: events.length,
      upcomingEvents: 0,
      interested: 0,
      confirmed: 0,
      checkins: 0,
      giftRedemptions: 0,
    };
    const now = Date.now();
    for (const event of events) {
      if (event.startsAt.getTime() >= now && event.status !== EventStatus.REJECTED)
        totals.upcomingEvents += 1;
    }
    for (const entry of counts.values()) {
      totals.interested += entry.interested;
      totals.confirmed += entry.confirmed;
      totals.checkins += entry.checkins;
      totals.giftRedemptions += entry.giftRedemptions;
    }

    // Dias sem check-in entram com zero, para o gráfico não "pular" datas.
    const perDay = new Map(byDay.map((row) => [row.label, Number(row.count)]));
    const checkinsByDay = labels.map((date) => ({ date, count: perDay.get(date) ?? 0 }));

    return {
      venue,
      totals,
      checkinsByDay,
      events: events.slice(0, EVENTS_TABLE_LIMIT).map((event) => ({
        id: event.id,
        name: event.name,
        startsAt: event.startsAt,
        status: event.status,
        ...(counts.get(event.id) ?? { interested: 0, confirmed: 0, checkins: 0, giftRedemptions: 0 }),
      })),
    };
  }
}
