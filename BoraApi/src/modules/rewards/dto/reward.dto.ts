import { PartialType } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Length, Matches, Max, MaxLength, Min } from 'class-validator';

import { REWARD_KINDS, RewardKind } from '../entities/reward.entity';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIME_MESSAGE = 'Use o formato HH:MM';

/** Promoção do evento. As regras que dependem do tipo (preço, % e quantidade) são conferidas
 * no RewardsService, sobre o resultado final, para valer também na edição parcial. */
export class CreateRewardDto {
  @IsIn(REWARD_KINDS)
  kind: RewardKind;

  @IsString()
  @Length(2, 160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  /** Obrigatório para `fixed_price`, em centavos. */
  @IsOptional()
  @IsInt()
  @Min(1)
  priceCents?: number | null;

  /** Obrigatório para `percent_off`, de 1 a 100. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  percentOff?: number | null;

  @Matches(TIME_PATTERN, { message: TIME_MESSAGE })
  validFrom: string;

  @Matches(TIME_PATTERN, { message: TIME_MESSAGE })
  validUntil: string;

  /** Só para `gift`. Vazio = sem limite. */
  @IsOptional()
  @IsInt()
  @Min(1)
  quantityTotal?: number | null;
}

export class UpdateRewardDto extends PartialType(CreateRewardDto) {}
