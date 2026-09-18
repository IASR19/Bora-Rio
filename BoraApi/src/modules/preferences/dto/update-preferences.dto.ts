import { IsArray, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

import {
  DISTANCE_OPTIONS_KM,
  INTENTIONS,
  MUSIC_GENRES,
  PRICE_RANGES,
  VENUE_VIBES,
} from '../../../shared/constants/domain.constants';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsArray()
  @IsIn(INTENTIONS, { each: true })
  intentions?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(MUSIC_GENRES, { each: true })
  musicGenres?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(VENUE_VIBES, { each: true })
  venueVibes?: string[];

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  ageInterestMin?: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  ageInterestMax?: number;

  @IsOptional()
  @IsIn(DISTANCE_OPTIONS_KM)
  maxDistanceKm?: number;

  @IsOptional()
  @IsArray()
  @IsIn(PRICE_RANGES, { each: true })
  priceRanges?: string[];
}
