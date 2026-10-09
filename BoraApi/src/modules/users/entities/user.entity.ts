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

/** Validação do "ponto comercial": feita uma vez por usuário (contrato social analisado por IA).
 * PENDING também cobre "a IA não teve certeza" — fica pra revisão manual. */
export enum BusinessVerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 160 })
  email: string;

  /** `select: false`: nunca sai em respostas (GET /users/me, login, cadastro). Só o fluxo de
   * senha lê, via UsersService.findByEmailWithPassword / findByIdWithPassword. */
  @Column({ name: 'password_hash', type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'phone_verified', type: 'boolean', default: false })
  phoneVerified: boolean;

  @Index({ unique: true })
  @Column({ name: 'google_id', type: 'varchar', nullable: true })
  googleId: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string | null;

  @Column({ type: 'enum', enum: Gender, default: Gender.UNDISCLOSED })
  gender: Gender;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'city', type: 'varchar', nullable: true })
  city: string | null;

  @Column({ name: 'latitude', type: 'double precision', nullable: true })
  latitude: number | null;

  @Column({ name: 'longitude', type: 'double precision', nullable: true })
  longitude: number | null;

  @Column({ name: 'show_in_who_is_going', type: 'boolean', default: true })
  showInWhoIsGoing: boolean;

  @Column({ name: 'subscription_status', type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.FREE })
  subscriptionStatus: SubscriptionStatus;

  /** Só dígito verificador validado — não confirma posse nem consulta Receita
   * Federal. Junto com telefone verificado e selfie, libera publicar evento
   * na hora (ver EventsService.create). */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 11, nullable: true })
  cpf: string | null;

  @Column({ name: 'selfie_url', type: 'varchar', nullable: true })
  selfieUrl: string | null;

  /** CNPJ informado na primeira vez que o usuário criou evento como ponto comercial;
   * reaproveitado nas próximas (ver BusinessVerificationService). */
  @Column({ name: 'business_cnpj', type: 'varchar', length: 14, nullable: true })
  businessCnpj: string | null;

  /** Razão social segundo a consulta pública do CNPJ. */
  @Column({ name: 'business_name', type: 'varchar', nullable: true })
  businessName: string | null;

  @Column({ name: 'business_verification_status', type: 'enum', enum: BusinessVerificationStatus, nullable: true })
  businessVerificationStatus: BusinessVerificationStatus | null;

  /** Motivo da decisão (IA ou revisão manual), mostrado ao usuário quando fica em análise. */
  @Column({ name: 'business_verification_note', type: 'text', nullable: true })
  businessVerificationNote: string | null;

  /** Contrato social enviado (data URL base64), guardado pra revisão manual. `select: false`:
   * documento sensível e pesado, nunca vai junto no GET /users/me. */
  @Column({ name: 'business_contract_file', type: 'text', nullable: true, select: false })
  businessContractFile: string | null;

  @Column({ name: 'business_verified_at', type: 'timestamptz', nullable: true })
  businessVerifiedAt: Date | null;

  @OneToOne(() => UserPreferences, (preferences) => preferences.user)
  preferences: UserPreferences;
}
