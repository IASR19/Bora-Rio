import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { IsMinAge } from '../../../shared/validators/min-age.validator';
import { Gender } from '../../users/entities/user.entity';
import { CreateVenueDto } from '../../venues/dto/create-venue.dto';
import { MIN_AGE } from '../auth.constants';

export class RegisterDto {
  @IsOptional()
  @IsEnum(['pt', 'es', 'en'])
  language?: 'pt' | 'es' | 'en';

  @IsString()
  @Length(2, 120)
  name: string;

  @IsDateString()
  @IsMinAge(MIN_AGE)
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

  /** Obrigatório e único (uma conta de usuário por CPF); dígito verificador conferido no service. */
  @IsString()
  cpf: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

/** Cadastro de conta de comércio: dados de acesso do responsável + CNPJ + contrato social +
 * local. Sem nascimento, gênero nem CPF (a conta é do estabelecimento). */
export class RegisterBusinessDto {
  @IsOptional()
  @IsEnum(['pt', 'es', 'en'])
  language?: 'pt' | 'es' | 'en';

  /** Nome do responsável pela conta. */
  @IsString()
  @Length(2, 120)
  name: string;

  /** Cadastro pelo Google: substitui e-mail e senha (o e-mail vem do token verificado). */
  @IsOptional()
  @IsString()
  googleIdToken?: string;

  @ValidateIf((dto: RegisterBusinessDto) => !dto.googleIdToken)
  @IsEmail()
  email?: string;

  @ValidateIf((dto: RegisterBusinessDto) => !dto.googleIdToken)
  @IsString()
  @MinLength(8)
  password?: string;

  @IsPhoneNumber('BR')
  phone: string;

  @IsString()
  cnpj: string;

  /** Contrato social como data URL base64 (PDF ou imagem); validado no service. */
  @IsString()
  @Matches(/^data:[\w/+.-]+;base64,/, { message: 'Arquivo do contrato social inválido' })
  contractFile: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateVenueDto)
  venue: CreateVenueDto;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class ConfirmEmailVerificationDto {
  @Matches(/^\d{6}$/, { message: 'O código tem 6 dígitos' })
  code: string;
}

export class GoogleLoginDto {
  @IsOptional()
  @IsEnum(['pt', 'es', 'en'])
  language?: 'pt' | 'es' | 'en';

  /** ID token (JWT) retornado pelo Google Identity Services no front. */
  @IsString()
  idToken: string;

  /** `false`: não cria conta se o Google ainda não tiver cadastro (o app pergunta o tipo de conta
   * antes). Omitido mantém o comportamento antigo (cria conta de usuário), para versões do app em cache. */
  @IsOptional()
  @IsBoolean()
  createAccount?: boolean;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
