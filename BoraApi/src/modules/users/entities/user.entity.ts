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

/** Tipo de conta, escolhido no cadastro: `user` usa o app (explorar, check-in, chat...);
 * `business` só administra o próprio estabelecimento (painel, eventos, promoções, QR). */
export const ACCOUNT_TYPES = ['user', 'business'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 16, default: 'user' })
  role: 'user' | 'admin';

  /** Login com Google e contas antigas ficam como `user` (default). */
  @Column({ name: 'account_type', type: 'varchar', length: 16, default: 'user' })
  accountType: AccountType;

  @Column({ type: 'varchar', length: 5, default: 'pt' })
  language: 'pt' | 'es' | 'en';

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ length: 120 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 160 })
  email: string;

  /** `select: false`: nunca sai em respostas (GET /users/me, login, cadastro). Só o fluxo de
   * senha lê, via UsersService.findByEmailWithPassword / findByIdWithPassword. */
  @Column({ name: 'password_hash', type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  /** Pode se repetir entre contas (ex.: a conta de comércio e a pessoal do mesmo dono).
   * Índice comum só pra busca; quem identifica a conta é o CPF ou o CNPJ. */
  @Index()
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  /** Confirmado pelo código enviado por e-mail (ou pelo Google). Obrigatório para usar o app. */
  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

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
   * Federal. Único: uma conta de usuário por CPF. Obrigatório no cadastro por
   * e-mail; quem entrou pelo Google informa depois (PATCH /users/me). */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 11, nullable: true })
  cpf: string | null;

  @Column({ name: 'selfie_url', type: 'varchar', nullable: true })
  selfieUrl: string | null;

  /** CNPJ da conta de comércio, informado no cadastro (ver AuthService.registerBusiness).
   * Único entre contas não excluídas: uma conta por CNPJ. Volta a null quando o admin rejeita o
   * cadastro, pra liberar o CNPJ ao dono de verdade (ver applyBusinessReview). */
  @Index({ unique: true, where: '"deleted_at" IS NULL' })
  @Column({ name: 'business_cnpj', type: 'varchar', length: 14, nullable: true })
  businessCnpj: string | null;

  /** Razão social segundo a consulta pública do CNPJ. */
  @Column({ name: 'business_name', type: 'varchar', nullable: true })
  businessName: string | null;

  @Column({ name: 'business_verification_status', type: 'enum', enum: BusinessVerificationStatus, nullable: true })
  businessVerificationStatus: BusinessVerificationStatus | null;

  /** Mensagem mostrada ao comércio: aviso de "em análise" ou o motivo da decisão do admin. */
  @Column({ name: 'business_verification_note', type: 'text', nullable: true })
  businessVerificationNote: string | null;

  /** Parecer consultivo da IA (Receita + contrato social), só pra quem revisa no painel admin.
   * `select: false`: nunca vai pro comércio avaliado (GET /users/me, /business/me). */
  @Column({ name: 'business_ai_note', type: 'text', nullable: true, select: false })
  businessAiNote: string | null;

  /** Contrato social enviado (data URL base64), guardado pra revisão manual. `select: false`:
   * documento sensível e pesado, nunca vai junto no GET /users/me. */
  @Column({ name: 'business_contract_file', type: 'text', nullable: true, select: false })
  businessContractFile: string | null;

  @Column({ name: 'business_verified_at', type: 'timestamptz', nullable: true })
  businessVerifiedAt: Date | null;

  /** Código de identificação da pessoa (`BORA-XXXXX`), fixo e único. Gerado em toda criação de
   * conta pelo UserPublicCodeSubscriber; o comércio digita ele ao entregar o brinde do QR. */
  @Index({ unique: true })
  @Column({ name: 'public_code', type: 'varchar', length: 10 })
  publicCode: string;

  /** Promoção (QR impresso) que trouxe a pessoa ao cadastro. Só para as estatísticas do comércio. */
  @Column({ name: 'signup_reward_id', type: 'uuid', nullable: true, select: false })
  signupRewardId: string | null;

  @OneToOne(() => UserPreferences, (preferences) => preferences.user)
  preferences: UserPreferences;
}
