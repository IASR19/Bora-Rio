import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

import { Gender } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsPhoneNumber('BR')
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RequestVerificationDto {
  @IsPhoneNumber('BR')
  phone: string;
}

export class ConfirmVerificationDto {
  @IsPhoneNumber('BR')
  phone: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class GoogleLoginDto {
  /** ID token (JWT) retornado pelo Google Identity Services no front. */
  @IsString()
  idToken: string;
}
