import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

import { CurrentUserService } from './services/current-user.service';
import { BaseEntitySubscriber } from './subscribers/base-entity.subscriber';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
  providers: [CurrentUserService, BaseEntitySubscriber],
  exports: [CurrentUserService],
})
export class CommonModule {}
