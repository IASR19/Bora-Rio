import { IsString } from 'class-validator';

export class SubmitIdentityDto {
  @IsString()
  cpf: string;

  @IsString()
  selfieUrl: string;
}
