import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { QueryEventsDto } from './dto/query-events.dto';
import { Event } from './entities/event.entity';
import { EventParticipation } from './entities/event-participation.entity';

const BORA_AGORA_WINDOW_HOURS = 6;

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventParticipation)
    private readonly participationRepository: Repository<EventParticipation>,
  ) {}

  async findById(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id }, relations: ['venue'] });
    if (!event) throw new ResourceNotFoundException('Event', id);
    return event;
  }

  async search(query: QueryEventsDto): Promise<Event[]> {
    const qb = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .where('event.startsAt >= :now', { now: new Date() });

    if (query.city) qb.andWhere('venue.city = :city', { city: query.city });
    if (query.venueId) qb.andWhere('event.venueId = :venueId', { venueId: query.venueId });

    if (query.now) {
      const limit = new Date(Date.now() + BORA_AGORA_WINDOW_HOURS * 60 * 60 * 1000);
      qb.andWhere('event.startsAt <= :limit', { limit });
    }

    return qb.orderBy('event.startsAt', 'ASC').getMany();
  }

  private async getOrCreateParticipation(userId: string, eventId: string): Promise<EventParticipation> {
    const existing = await this.participationRepository.findOne({ where: { userId, eventId } });
    if (existing) return existing;
    return this.participationRepository.save(this.participationRepository.create({ userId, eventId }));
  }

  async markViewed(userId: string, eventId: string): Promise<EventParticipation> {
    const participation = await this.getOrCreateParticipation(userId, eventId);
    participation.viewed = true;
    return this.participationRepository.save(participation);
  }

  async markInterested(userId: string, eventId: string): Promise<EventParticipation> {
    const participation = await this.getOrCreateParticipation(userId, eventId);
    participation.viewed = true;
    participation.interested = true;
    return this.participationRepository.save(participation);
  }

  async markConfirmed(userId: string, eventId: string): Promise<EventParticipation> {
    const participation = await this.getOrCreateParticipation(userId, eventId);
    participation.viewed = true;
    participation.interested = true;
    participation.confirmed = true;
    return this.participationRepository.save(participation);
  }

  async getParticipants(eventId: string) {
    const participations = await this.participationRepository.find({
      where: { eventId },
      relations: ['user'],
    });

    const visible = participations.filter((p) => p.user.showInWhoIsGoing);

    return {
      interested: visible.filter((p) => p.interested && !p.confirmed).map((p) => this.toPublicParticipant(p)),
      confirmed: visible.filter((p) => p.confirmed).map((p) => this.toPublicParticipant(p)),
      checkedIn: visible.filter((p) => p.checkedIn).map((p) => this.toPublicParticipant(p)),
    };
  }

  async getMyEvents(userId: string) {
    const participations = await this.participationRepository.find({
      where: { userId },
      relations: ['event', 'event.venue'],
    });

    const now = Date.now();
    return {
      interested: participations.filter((p) => p.interested && !p.confirmed).map((p) => p.event),
      confirmed: participations
        .filter((p) => p.confirmed && p.event.startsAt.getTime() >= now)
        .map((p) => p.event),
      past: participations.filter((p) => p.event.startsAt.getTime() < now).map((p) => p.event),
    };
  }

  private toPublicParticipant(participation: EventParticipation) {
    return {
      id: participation.user.id,
      name: participation.user.name.split(' ')[0],
      avatarUrl: participation.user.avatarUrl,
    };
  }
}
