import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Reward } from './reward.entity';

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
}
