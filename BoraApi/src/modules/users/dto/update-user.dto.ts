import { IsBoolean, IsDateString, IsLatitude, IsLongitude, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

import { IsMinAge } from '../../../shared/validators/min-age.validator';
import { MIN_AGE } from '../../auth/auth.constants';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

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
}
