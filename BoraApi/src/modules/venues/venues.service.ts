import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { distanceKm, isWithinRadius } from '../../shared/helpers/geo.helper';
import { BoraScoreService } from '../../shared/services/bora-score.service';
import { UserPreferences } from '../preferences/entities/user-preferences.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { QueryVenuesDto } from './dto/query-venues.dto';
import { Venue } from './entities/venue.entity';

export interface VenueWithScore extends Venue {
  boraScore: number;
  distanceKm: number | null;
}

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue) private readonly venuesRepository: Repository<Venue>,
    private readonly scoreService: BoraScoreService,
  ) {}

  async findById(id: string): Promise<Venue> {
    const venue = await this.venuesRepository.findOne({ where: { id } });
    if (!venue) throw new ResourceNotFoundException('Venue', id);
    return venue;
  }

  /** Local cadastrado por um usuário ao criar um evento — nasce não verificado
   * (ver escopo.md sobre validação de veracidade de evento). */
  createFromUser(dto: CreateVenueDto): Promise<Venue> {
    const venue = this.venuesRepository.create({
      name: dto.name,
      category: dto.category as Venue['category'],
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
      city: dto.city ?? null,
      description: dto.description ?? null,
      priceRange: (dto.priceRange ?? 'medio') as Venue['priceRange'],
      musicGenres: [],
      vibes: [],
      verified: false,
    });
    return this.venuesRepository.save(venue);
  }

  /** Local da conta de comércio, criado no cadastro dela (ver AuthService.registerBusiness).
   * Nasce `verified=false` (invisível nas buscas) até o admin aprovar o comércio. Recebe o
   * `manager` pra entrar na mesma transação que cria a conta. */
  createForBusiness(
    dto: CreateVenueDto,
    owner: { ownerUserId: string; cnpj: string },
    manager: EntityManager = this.venuesRepository.manager,
  ): Promise<Venue> {
    const venue = manager.create(Venue, {
      name: dto.name,
      category: dto.category as Venue['category'],
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
      city: dto.city ?? null,
      description: dto.description ?? null,
      priceRange: (dto.priceRange ?? 'medio') as Venue['priceRange'],
      musicGenres: [],
      vibes: [],
      verified: false,
      cnpj: owner.cnpj,
      ownerUserId: owner.ownerUserId,
    });
    return manager.save(venue);
  }

  async search(query: QueryVenuesDto, preferences: UserPreferences | null): Promise<VenueWithScore[]> {
    const qb = this.venuesRepository.createQueryBuilder('venue');

    // Locais não verificados (cadastrados por usuário ao criar um evento) não entram
    // nas listagens gerais — evitam poluir o catálogo antes de qualquer evento neles
    // ganhar confiança (ver escopo.md sobre validação de veracidade de evento).
    qb.andWhere('venue.verified = :verified', { verified: true });

    if (query.category) qb.andWhere('venue.category = :category', { category: query.category });
    if (query.priceRange) qb.andWhere('venue.priceRange = :priceRange', { priceRange: query.priceRange });
    if (query.city) qb.andWhere('venue.city = :city', { city: query.city });
    if (query.music) qb.andWhere('venue.musicGenres LIKE :music', { music: `%${query.music}%` });
    if (query.q) qb.andWhere('venue.name ILIKE :q', { q: `%${query.q}%` });

    const venues = await qb.getMany();
    const maxDistanceKm = query.maxDistanceKm ?? preferences?.maxDistanceKm ?? null;

    return venues
      .map((venue) => ({
        venue,
        distance:
          query.lat != null && query.lng != null
            ? distanceKm(query.lat, query.lng, venue.latitude, venue.longitude)
            : null,
      }))
      .filter(({ distance }) => isWithinRadius(distance, maxDistanceKm))
      .map(({ venue, distance }) => {

        const boraScore = this.scoreService.calculate({
          userMusicGenres: preferences?.musicGenres ?? [],
          venueMusicGenres: venue.musicGenres,
          userVibes: preferences?.venueVibes ?? [],
          venueVibes: venue.vibes,
          userAgeMin: preferences?.ageInterestMin ?? null,
          userAgeMax: preferences?.ageInterestMax ?? null,
          venueTargetAge: null,
          userMaxDistanceKm: query.maxDistanceKm ?? preferences?.maxDistanceKm ?? 10,
          distanceKm: distance ?? 0,
          userPriceRanges: preferences?.priceRanges ?? [],
          venuePriceRange: venue.priceRange,
          userIntentions: preferences?.intentions ?? [],
          venueIntentions: [],
        });

        return { ...venue, boraScore, distanceKm: distance };
      })
      .sort((a, b) => b.boraScore - a.boraScore);
  }
}
