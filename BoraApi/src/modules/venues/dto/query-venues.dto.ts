import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

import { PRICE_RANGES, VENUE_CATEGORIES } from '../../../shared/constants/domain.constants';

export class QueryVenuesDto {
  @IsOptional()
  @IsIn(VENUE_CATEGORIES)
  category?: string;

  @IsOptional()
  @IsString()
  music?: string;

  @IsOptional()
  @IsIn(PRICE_RANGES)
  priceRange?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDistanceKm?: number;

  @IsOptional()
  @IsString()
  city?: string;
}
