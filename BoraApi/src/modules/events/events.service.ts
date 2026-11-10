import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BusinessException } from '../../common/exceptions/business.exception';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { distanceKm, isWithinRadius } from '../../shared/helpers/geo.helper';
import { BoraScoreService } from '../../shared/services/bora-score.service';
import { getOwnedVenue } from '../business/business-ownership';
import { UserPreferences } from '../preferences/entities/user-preferences.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { Event, EventStatus } from './entities/event.entity';
import { EventParticipation } from './entities/event-participation.entity';
import { assertEventAcceptsParticipation } from './event-access';

const BORA_AGORA_WINDOW_HOURS = 6;
const CHECKINS_TO_PUBLISH = 3;

export interface EventWithScore extends Event {
  boraScore: number;
  distanceKm: number | null;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventParticipation)
    private readonly participationRepository: Repository<EventParticipation>,
    private readonly scoreService: BoraScoreService,
  ) {}

  async findById(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id }, relations: ['venue'] });
    if (!event) throw new ResourceNotFoundException('Event', id);
    return event;
  }

  async findParticipatingById(id: string): Promise<Event> {
    const event = await this.findById(id);
    assertEventAcceptsParticipation(event);
    return event;
  }

  async withParticipatingEvent<T>(id: string, work: (event: Event, manager: EntityManager) => Promise<T>): Promise<T> {
    return this.eventsRepository.manager.transaction(async (manager) => {
      // The same row lock used by moderation keeps a rejection and a participation write ordered.
      const event = await manager.findOne(Event, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!event) throw new ResourceNotFoundException('Event', id);
      assertEventAcceptsParticipation(event);
      return work(event, manager);
    });
  }

  async search(query: QueryEventsDto, preferences: UserPreferences | null): Promise<EventWithScore[]> {
    const qb = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .where('event.startsAt >= :now', { now: new Date() });

    if (query.city) qb.andWhere('venue.city = :city', { city: query.city });
    if (query.venueId) qb.andWhere('event.venueId = :venueId', { venueId: query.venueId });
    if (query.category) qb.andWhere('venue.category = :category', { category: query.category });
    if (query.music) qb.andWhere('event.musicGenres LIKE :music', { music: `%${query.music}%` });
    if (query.q) {
      qb.andWhere('(event.name ILIKE :q OR venue.name ILIKE :q)', { q: `%${query.q}%` });
    }

    // Buscas gerais (Home/Explorar) só mostram eventos publicados. Uma busca por
    // venueId específico (ex.: VenueDetail via link direto) traz mesmo os
    // pending_review — é o "link direto" do modelo de confiança do escopo.md.
    if (!query.venueId) {
      qb.andWhere('event.status = :status', { status: EventStatus.PUBLISHED });
    } else {
      qb.andWhere('event.status != :rejected', { rejected: EventStatus.REJECTED });
    }

    if (query.now) {
      const limit = new Date(Date.now() + BORA_AGORA_WINDOW_HOURS * 60 * 60 * 1000);
      qb.andWhere('event.startsAt <= :limit', { limit });
    }

    const events = await qb.orderBy('event.startsAt', 'ASC').getMany();
    const maxDistanceKm = query.maxDistanceKm ?? preferences?.maxDistanceKm ?? null;

    return (
      events
        .map((event) => ({
          event,
          distance:
            query.lat != null && query.lng != null
              ? distanceKm(query.lat, query.lng, event.venue.latitude, event.venue.longitude)
              : null,
        }))
        // Busca por venueId (página do local) não corta por distância.
        .filter(({ distance }) => query.venueId != null || isWithinRadius(distance, maxDistanceKm))
        .map(({ event, distance }) => {
          const boraScore = this.scoreService.calculate({
            userMusicGenres: preferences?.musicGenres ?? [],
            venueMusicGenres: event.musicGenres,
            userVibes: preferences?.venueVibes ?? [],
            venueVibes: event.venue.vibes,
            userAgeMin: preferences?.ageInterestMin ?? null,
            userAgeMax: preferences?.ageInterestMax ?? null,
            venueTargetAge: event.targetAge,
            userMaxDistanceKm: query.maxDistanceKm ?? preferences?.maxDistanceKm ?? 10,
            distanceKm: distance ?? 0,
            userPriceRanges: preferences?.priceRanges ?? [],
            venuePriceRange: event.venue.priceRange,
            userIntentions: preferences?.intentions ?? [],
            venueIntentions: [],
          });

          return { ...event, boraScore, distanceKm: distance };
        })
        .sort((a, b) => (query.now ? 0 : b.boraScore - a.boraScore))
    );
  }

  /** Só conta de comércio aprovada chega aqui (BusinessAccountGuard). O local é sempre o do
   * próprio comércio e, como ele já foi conferido pelo admin, o evento nasce publicado. */
  async create(userId: string, dto: CreateEventDto): Promise<Event> {
    const startsAt = new Date(dto.startsAt);
    if (startsAt.getTime() <= Date.now()) {
      throw new BusinessException('A data do evento precisa estar no futuro');
    }
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    if (endsAt && endsAt.getTime() <= startsAt.getTime()) {
      throw new BusinessException('O fim do evento precisa ser depois do início');
    }

    const venue = await getOwnedVenue(this.eventsRepository.manager, userId);

    const event = await this.eventsRepository.save(
      this.eventsRepository.create({
        createdBy: userId,
        venueId: venue.id,
        name: dto.name,
        description: dto.description ?? null,
        musicGenres: dto.musicGenres,
        startsAt,
        endsAt,
        targetAge: dto.targetAge ?? null,
        coverImageUrl: dto.coverImageUrl ?? null,
        status: EventStatus.PUBLISHED,
        createdAsBusiness: true,
      }),
    );

    event.venue = venue;
    return event;
  }

  getCreatedByMe(userId: string): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { createdBy: userId },
      relations: ['venue'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Prova social contínua (ver escopo.md): check-ins reais de gente diferente do
   * criador promovem um evento pending_review pra published, sem precisar de
   * revisão manual. */
  async publishIfTrusted(eventId: string, distinctCheckinCount: number, manager?: EntityManager): Promise<void> {
    if (distinctCheckinCount < CHECKINS_TO_PUBLISH) return;
    await (manager?.getRepository(Event) ?? this.eventsRepository).update(
      { id: eventId, status: EventStatus.PENDING_REVIEW },
      { status: EventStatus.PUBLISHED },
    );
  }

  /** Denúncias acumuladas derrubam o evento de volta pra revisão (ver ReportsService). */
  async sendBackToReview(eventId: string): Promise<void> {
    await this.eventsRepository.update(
      { id: eventId, status: EventStatus.PUBLISHED },
      { status: EventStatus.PENDING_REVIEW },
    );
  }

  private async updateParticipation(
    userId: string,
    eventId: string,
    changes: Partial<EventParticipation>,
  ): Promise<EventParticipation> {
    return this.withParticipatingEvent(eventId, async (_, manager) => {
      const repository = manager.getRepository(EventParticipation);
      const participation =
        (await repository.findOne({ where: { userId, eventId } })) ?? repository.create({ userId, eventId });
      Object.assign(participation, changes);
      return repository.save(participation);
    });
  }

  async markViewed(userId: string, eventId: string): Promise<EventParticipation> {
    return this.updateParticipation(userId, eventId, { viewed: true });
  }

  async markInterested(userId: string, eventId: string): Promise<EventParticipation> {
    return this.updateParticipation(userId, eventId, { viewed: true, interested: true });
  }

  async markConfirmed(userId: string, eventId: string): Promise<EventParticipation> {
    return this.updateParticipation(userId, eventId, { viewed: true, interested: true, confirmed: true });
  }

  async getParticipants(eventId: string) {
    await this.findParticipatingById(eventId);
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
      confirmed: participations.filter((p) => p.confirmed && p.event.startsAt.getTime() >= now).map((p) => p.event),
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
