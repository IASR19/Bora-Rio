import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { BlockedUser } from './entities/blocked-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedUser])],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}
