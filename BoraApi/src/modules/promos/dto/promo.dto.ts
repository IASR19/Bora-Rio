import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class RecordScanDto {
  /** Identificador do aparelho gerado pelo app (`crypto.randomUUID()`), para contar leituras
   * distintas mesmo sem login. */
  @IsOptional()
  @IsUUID()
  deviceId?: string;
}

export class DeliverRewardDto {
  /** Código da pessoa, com ou sem o prefixo `BORA-` (ex.: `BORA-7K3P9` ou `7k3p9`). */
  @IsString()
  @Length(1, 20)
  publicCode: string;
}
