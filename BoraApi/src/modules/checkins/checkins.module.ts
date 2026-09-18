import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventParticipation } from '../events/entities/event-participation.entity';
import { EventsModule } from '../events/events.module';
import { CheckinsController } from './checkins.controller';
import { CheckinsService } from './checkins.service';
import { CheckIn } from './entities/checkin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn, EventParticipation]), EventsModule, JwtModule.register({})],
  controllers: [CheckinsController],
  providers: [CheckinsService],
  exports: [CheckinsService],
})
export class CheckinsModule {}
