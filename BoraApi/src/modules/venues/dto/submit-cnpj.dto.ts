import { IsString } from 'class-validator';

export class SubmitCnpjDto {
  @IsString()
  cnpj: string;
}
