import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../../shared/shared.module';
import { Event } from '../events/entities/event.entity';
import { PreferencesModule } from '../preferences/preferences.module';
import { Venue } from './entities/venue.entity';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';

@Module({
  imports: [TypeOrmModule.forFeature([Venue, Event]), PreferencesModule, SharedModule],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}
