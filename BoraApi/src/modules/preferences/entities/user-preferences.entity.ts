import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_preferences')
export class UserPreferences extends BaseEntity {
  @OneToOne(() => User, (user) => user.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'simple-array', default: '' })
  intentions: string[];

  @Column({ name: 'music_genres', type: 'simple-array', default: '' })
  musicGenres: string[];

  @Column({ name: 'venue_vibes', type: 'simple-array', default: '' })
  venueVibes: string[];

  @Column({ name: 'age_interest_min', type: 'int', nullable: true })
  ageInterestMin: number | null;

  @Column({ name: 'age_interest_max', type: 'int', nullable: true })
  ageInterestMax: number | null;

  @Column({ name: 'max_distance_km', type: 'int', default: 10 })
  maxDistanceKm: number;

  @Column({ name: 'price_ranges', type: 'simple-array', default: '' })
  priceRanges: string[];
}
