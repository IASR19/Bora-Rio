import { IsString, Matches } from 'class-validator';

export class SubmitBusinessVerificationDto {
  @IsString()
  cnpj: string;

  /** Contrato social como data URL base64 (PDF ou imagem); validado no service. */
  @IsString()
  @Matches(/^data:[\w/+.-]+;base64,/, { message: 'Arquivo do contrato social inválido' })
  contractFile: string;
}
