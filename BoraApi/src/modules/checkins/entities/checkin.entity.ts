import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

@Entity('checkins')
export class CheckIn extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Index()
  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ name: 'qr_nonce', type: 'varchar' })
  qrNonce: string;

  @Column({ name: 'checked_in_at', type: 'timestamptz' })
  checkedInAt: Date;

  @Column({ name: 'device_id', type: 'varchar', nullable: true })
  deviceId: string | null;
}
