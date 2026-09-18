import { Module } from '@nestjs/common';

import { BoraScoreService } from './services/bora-score.service';

@Module({
  providers: [BoraScoreService],
  exports: [BoraScoreService],
})
export class SharedModule {}
