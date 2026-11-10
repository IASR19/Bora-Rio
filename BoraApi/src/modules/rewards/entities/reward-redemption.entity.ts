import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Reward } from './reward.entity';

/** Como o brinde foi resgatado: pelo app depois do check-in, ou lendo o QR impresso da promoção. */
export const REDEMPTION_SOURCES = ['checkin', 'qr'] as const;
export type RedemptionSource = (typeof REDEMPTION_SOURCES)[number];

/** Proof of "used the benefit" — distinct from CheckIn, which proves "arrived". See escopo.md #26. */
@Entity('reward_redemptions')
export class RewardRedemption extends BaseEntity {
  @ManyToOne(() => Reward, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reward_id' })
  reward: Reward;

  @Index()
  @Column({ name: 'reward_id', type: 'uuid' })
  rewardId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'redeemed_at', type: 'timestamptz' })
  redeemedAt: Date;

  @Column({ type: 'varchar', length: 16, default: 'checkin' })
  source: RedemptionSource;

  /** Prazo para retirar no balcão (resgate pelo QR). Vazio = sem prazo (resgates via check-in). */
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  /** Quando o comércio deu baixa pelo código da pessoa (brinde entregue). */
  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;
}
