import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Reward } from '../../rewards/entities/reward.entity';

/** Uma leitura do QR impresso de uma promoção (com ou sem login), para o painel do comércio. */
@Entity('promo_scans')
export class PromoScan extends BaseEntity {
  @ManyToOne(() => Reward, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reward_id' })
  reward: Reward;

  @Index()
  @Column({ name: 'reward_id', type: 'uuid' })
  rewardId: string;

  /** Vazio quando a pessoa leu sem estar logada. */
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  /** Identificador do aparelho gerado pelo app (conta pessoas distintas mesmo sem login). */
  @Column({ name: 'device_id', type: 'varchar', length: 64, nullable: true })
  deviceId: string | null;

  /** A pessoa já tinha conta (estava logada) quando leu. */
  @Column({ name: 'existing_user', type: 'boolean', default: false })
  existingUser: boolean;
}
