import { Module } from '@nestjs/common';

import { BoraScoreService } from './services/bora-score.service';
import { EventTrustService } from './services/event-trust.service';

@Module({
  providers: [BoraScoreService, EventTrustService],
  exports: [BoraScoreService, EventTrustService],
})
export class SharedModule {}
