import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Venue } from '../venues/entities/venue.entity';
import { BusinessVerificationService } from './business-verification.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Venue])],
  controllers: [UsersController],
  providers: [UsersService, BusinessVerificationService],
  exports: [UsersService, BusinessVerificationService],
})
export class UsersModule {}
