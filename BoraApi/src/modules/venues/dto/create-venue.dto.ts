import { IsIn, IsLatitude, IsLongitude, IsOptional, IsString, Length } from 'class-validator';

import { PRICE_RANGES, VENUE_CATEGORIES } from '../../../shared/constants/domain.constants';

export class CreateVenueDto {
  @IsString()
  @Length(2, 160)
  name: string;

  @IsIn(VENUE_CATEGORIES)
  category: string;

  @IsString()
  address: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(PRICE_RANGES)
  priceRange?: string;
}
