import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { distanceKm } from '../../shared/helpers/geo.helper';
import { BoraScoreService } from '../../shared/services/bora-score.service';
import { UserPreferences } from '../preferences/entities/user-preferences.entity';
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

  async search(query: QueryVenuesDto, preferences: UserPreferences | null): Promise<VenueWithScore[]> {
    const qb = this.venuesRepository.createQueryBuilder('venue');

    if (query.category) qb.andWhere('venue.category = :category', { category: query.category });
    if (query.priceRange) qb.andWhere('venue.priceRange = :priceRange', { priceRange: query.priceRange });
    if (query.city) qb.andWhere('venue.city = :city', { city: query.city });
    if (query.music) qb.andWhere('venue.musicGenres LIKE :music', { music: `%${query.music}%` });

    const venues = await qb.getMany();

    return venues
      .map((venue) => {
        const distance =
          query.lat != null && query.lng != null ? distanceKm(query.lat, query.lng, venue.latitude, venue.longitude) : null;

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
