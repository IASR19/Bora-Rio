import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

/** "Quem você gostaria de encontrar novamente?" (escopo.md #27/#52) — quando o
 * interesse inverso já existe pro mesmo evento, é match (ver DeuBoraService). */
@Entity('deu_bora_interests')
@Index(['eventId', 'fromUserId', 'toUserId'], { unique: true })
export class DeuBoraInterest extends BaseEntity {
  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_user_id' })
  fromUser: User;

  @Column({ name: 'from_user_id', type: 'uuid' })
  fromUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_user_id' })
  toUser: User;

  @Column({ name: 'to_user_id', type: 'uuid' })
  toUserId: string;
}
