import { IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, Length } from 'class-validator';

import { MUSIC_GENRES } from '../../../shared/constants/domain.constants';

/** Evento criado por conta de comércio aprovada: o local é sempre o do próprio comércio
 * (venues.owner_user_id), por isso não vem no pedido. */
export class CreateEventDto {
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
