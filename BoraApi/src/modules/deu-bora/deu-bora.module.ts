import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountGuardsModule } from '../business/guards/account-guards.module';
import { ChatModule } from '../chat/chat.module';
import { EventParticipation } from '../events/entities/event-participation.entity';
import { UsersModule } from '../users/users.module';
import { DeuBoraController } from './deu-bora.controller';
import { DeuBoraService } from './deu-bora.service';
import { DeuBoraInterest } from './entities/deu-bora-interest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeuBoraInterest, EventParticipation]),
    ChatModule,
    UsersModule,
    AccountGuardsModule,
  ],
  controllers: [DeuBoraController],
  providers: [DeuBoraService],
  exports: [DeuBoraService],
})
export class DeuBoraModule {}
