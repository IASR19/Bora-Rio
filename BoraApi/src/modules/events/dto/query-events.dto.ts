import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryEventsDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsUUID()
  venueId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  now?: boolean; // "BORA Agora" — eventos nas próximas horas
}
