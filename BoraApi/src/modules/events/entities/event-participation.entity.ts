import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Event } from './event.entity';

/**
 * Independent state flags per escopo.md #39 — never collapse into a single enum.
 * A user can be `interested` without being `confirmed`, and `confirmed` without `checkedIn`.
 */
@Entity('event_participations')
@Unique(['userId', 'eventId'])
export class EventParticipation extends BaseEntity {
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

  @Column({ type: 'boolean', default: false })
  viewed: boolean;

  @Column({ type: 'boolean', default: false })
  interested: boolean;

  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @Column({ name: 'checked_in', type: 'boolean', default: false })
  checkedIn: boolean;
}
