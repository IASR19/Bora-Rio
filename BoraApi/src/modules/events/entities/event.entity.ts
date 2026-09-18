import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('events')
export class Event extends BaseEntity {
  @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ name: 'venue_id', type: 'uuid' })
  venueId: string;

  @Column({ length: 160 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'music_genres', type: 'simple-array', default: '' })
  musicGenres: string[];

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @Column({ name: 'target_age', type: 'int', nullable: true })
  targetAge: number | null;

  @Column({ name: 'cover_image_url', type: 'varchar', nullable: true })
  coverImageUrl: string | null;

  @Column({ name: 'ticket_url', type: 'varchar', nullable: true })
  ticketUrl: string | null;
}
