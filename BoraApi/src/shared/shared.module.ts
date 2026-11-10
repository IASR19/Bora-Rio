import { Module } from '@nestjs/common';

import { BoraScoreService } from './services/bora-score.service';
import { MailService } from './services/mail.service';

@Module({
  providers: [BoraScoreService, MailService],
  exports: [BoraScoreService, MailService],
})
export class SharedModule {}
