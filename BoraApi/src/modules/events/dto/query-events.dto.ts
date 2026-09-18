import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

import { MUSIC_GENRES, VENUE_CATEGORIES } from '../../../shared/constants/domain.constants';

export class QueryEventsDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  q?: string; // busca por nome do evento ou do local (escopo.md #37)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

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
