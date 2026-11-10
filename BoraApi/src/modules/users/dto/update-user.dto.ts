import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

import { IsMinAge } from '../../../shared/validators/min-age.validator';
import { MIN_AGE } from '../../auth/auth.constants';
import { Gender } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(['pt', 'es', 'en'])
  language?: 'pt' | 'es' | 'en';

  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsPhoneNumber('BR')
  phone?: string;

  @IsOptional()
  @IsDateString()
  @IsMinAge(MIN_AGE)
  birthDate?: string;

  @IsOptional()
  @IsBoolean()
  showInWhoIsGoing?: boolean;

  /** Só pra quem ainda não tem CPF (login com Google ou conta antiga): informado uma vez,
   * validado e único; depois não muda (ver UsersService.update). */
  @IsOptional()
  @IsString()
  cpf?: string;
}
