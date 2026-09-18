import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

import { MUSIC_GENRES, VENUE_CATEGORIES } from '../../../shared/constants/domain.constants';

export class QueryEventsDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsUUID()
  venueId?: string;

  @IsOptional()
  @IsIn(VENUE_CATEGORIES)
  category?: string; // filtra pela categoria do estabelecimento (bar, festa, restaurante...)

  @IsOptional()
  @IsIn(MUSIC_GENRES)
  music?: string; // filtra por gênero musical (pagode, eletrônico, sertanejo...)

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  now?: boolean; // "BORA Agora" — eventos nas próximas horas
}
