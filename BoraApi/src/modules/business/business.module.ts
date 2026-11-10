import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckIn } from '../checkins/entities/checkin.entity';
import { Event } from '../events/entities/event.entity';
import { EventParticipation } from '../events/entities/event-participation.entity';
import { RewardRedemption } from '../rewards/entities/reward-redemption.entity';
import { User } from '../users/entities/user.entity';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { AccountGuardsModule } from './guards/account-guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event, EventParticipation, CheckIn, RewardRedemption]),
    AccountGuardsModule,
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [AccountGuardsModule],
})
export class BusinessModule {}
