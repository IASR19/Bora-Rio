import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

/** Código de 6 dígitos enviado ao e-mail da conta. Só o mais recente não consumido vale. */
@Entity('email_verifications')
export class EmailVerification extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  /** Tentativas erradas; no limite o código é invalidado (evita adivinhar os 6 dígitos). */
  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'boolean', default: false })
  consumed: boolean;
}
