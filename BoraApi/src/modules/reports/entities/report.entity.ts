import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum ReportTargetType {
  EVENT = 'event',
  VENUE = 'venue',
  USER = 'user',
}

export enum ReportCategory {
  COMPORTAMENTO_INADEQUADO = 'comportamento_inadequado',
  PERFIL_FALSO = 'perfil_falso',
  ASSEDIO = 'assedio',
  SPAM = 'spam',
  FRAUDE = 'fraude',
  OUTRO = 'outro',
}

@Entity('reports')
@Index(['targetType', 'targetId'])
export class Report extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ name: 'reporter_id', type: 'uuid' })
  reporterId: string;

  @Column({ name: 'target_type', type: 'enum', enum: ReportTargetType })
  targetType: ReportTargetType;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({ type: 'enum', enum: ReportCategory })
  category: ReportCategory;

  @Column({ type: 'text', nullable: true })
  message: string | null;
}
