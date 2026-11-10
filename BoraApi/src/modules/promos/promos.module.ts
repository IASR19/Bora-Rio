import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountGuardsModule } from '../business/guards/account-guards.module';
import { Reward } from '../rewards/entities/reward.entity';
import { RewardsModule } from '../rewards/rewards.module';
import { BusinessPromosController } from './business-promos.controller';
import { PromoScan } from './entities/promo-scan.entity';
import { PromosController } from './promos.controller';
import { PromosService } from './promos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reward, PromoScan]), RewardsModule, AccountGuardsModule],
  controllers: [PromosController, BusinessPromosController],
  providers: [PromosService],
})
export class PromosModule {}
