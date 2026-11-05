import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckIn } from '../checkins/entities/checkin.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Venue } from '../venues/entities/venue.entity';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { AdminAudit } from './entities/admin-audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Event, Venue, CheckIn, AdminAudit])],
  controllers: [AdminController],
  providers: [AdminGuard, AdminService],
})
export class AdminModule {}
