import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

export enum ConversationType {
  EVENT_ROOM = 'event_room',
  DIRECT = 'direct',
}

/** Bora Room (por evento, ver escopo.md #21) e conversa direta pós Deu Bora
 * (#27) compartilham a mesma estrutura de mensagens — só muda a regra de
 * acesso, resolvida no ChatService. */
@Entity('conversations')
export class Conversation extends BaseEntity {
  @Column({ type: 'enum', enum: ConversationType })
  type: ConversationType;

  /** Só em event_room. Único quando presente — um room por evento; NULLs não
   * conflitam entre si em índice único no Postgres, então conversas diretas
   * (eventId null) não são afetadas. */
  @Index({ unique: true })
  @Column({ name: 'event_id', type: 'uuid', nullable: true })
  eventId: string | null;

  /** Só em direct. Sempre normalizado (userAId < userBId) pelo ChatService. */
  @Column({ name: 'user_a_id', type: 'uuid', nullable: true })
  userAId: string | null;

  @Column({ name: 'user_b_id', type: 'uuid', nullable: true })
  userBId: string | null;
}
