import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('rewards')
export class Reward extends BaseEntity {
  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ length: 160 })
  title: string;

  @Column({ name: 'valid_from', type: 'time' })
  validFrom: string;

  @Column({ name: 'valid_until', type: 'time' })
  validUntil: string;

  @Column({ name: 'quantity_total', type: 'int' })
  quantityTotal: number;

  @Column({ name: 'quantity_redeemed', type: 'int', default: 0 })
  quantityRedeemed: number;
}
