import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../users/entities/user.entity';
import { BusinessAccountGuard } from './business-account.guard';
import { UserAccountGuard } from './user-account.guard';

/**
 * Módulo leve só com os guards de tipo de conta. Quem usa `@UseGuards(...)` com eles importa
 * este módulo: ele exporta o repositório de User que os guards precisam, sem puxar o
 * BusinessModule inteiro (e sem risco de import circular com events/rewards/checkins).
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [BusinessAccountGuard, UserAccountGuard],
  exports: [TypeOrmModule, BusinessAccountGuard, UserAccountGuard],
})
export class AccountGuardsModule {}
