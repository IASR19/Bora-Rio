import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Event } from '../../events/entities/event.entity';

/** Tipos de promoção do evento:
 * - `gift`: brinde por check-in, o usuário resgata no app (quantidade opcional);
 * - `fixed_price`: preço fixo ("chope a R$10"), só aviso;
 * - `percent_off`: % de desconto ("caipirinha 30% off"), só aviso. */
export const REWARD_KINDS = ['gift', 'fixed_price', 'percent_off'] as const;
export type RewardKind = (typeof REWARD_KINDS)[number];

@Entity('rewards')
export class Reward extends BaseEntity {
  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ type: 'varchar', length: 16, default: 'gift' })
  kind: RewardKind;

  @Column({ length: 160 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Preço em centavos, só para `fixed_price`. */
  @Column({ name: 'price_cents', type: 'int', nullable: true })
  priceCents: number | null;

  /** 1 a 100, só para `percent_off`. */
  @Column({ name: 'percent_off', type: 'int', nullable: true })
  percentOff: number | null;

  @Column({ name: 'valid_from', type: 'time' })
  validFrom: string;

  @Column({ name: 'valid_until', type: 'time' })
  validUntil: string;

  /** Só faz sentido para `gift`. Vazio = sem limite. */
  @Column({ name: 'quantity_total', type: 'int', nullable: true })
  quantityTotal: number | null;

  @Column({ name: 'quantity_redeemed', type: 'int', default: 0 })
  quantityRedeemed: number;
}
