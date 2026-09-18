import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';

import { MUSIC_GENRES } from '../../../shared/constants/domain.constants';
import { CreateVenueDto } from '../../venues/dto/create-venue.dto';

export class CreateEventDto {
  @IsOptional()
  @IsUUID()
  venueId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateVenueDto)
  newVenue?: CreateVenueDto;

  @IsString()
  @Length(2, 160)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsIn(MUSIC_GENRES, { each: true })
  musicGenres: string[];

  @IsDateString()
  startsAt: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsInt()
  targetAge?: number;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
