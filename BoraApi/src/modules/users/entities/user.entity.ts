import { Column, Entity, Index, OneToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { UserPreferences } from '../../preferences/entities/user-preferences.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNDISCLOSED = 'undisclosed',
}

export enum SubscriptionStatus {
  FREE = 'free',
  ACTIVE = 'active',
  CANCELED = 'canceled',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 160 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Index({ unique: true })
  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'phone_verified', type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.UNDISCLOSED })
  gender: Gender;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'city', type: 'varchar', nullable: true })
  city: string | null;

  @Column({ name: 'show_in_who_is_going', type: 'boolean', default: true })
  showInWhoIsGoing: boolean;

  @Column({ name: 'subscription_status', type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.FREE })
  subscriptionStatus: SubscriptionStatus;

  @OneToOne(() => UserPreferences, (preferences) => preferences.user)
  preferences: UserPreferences;
}
