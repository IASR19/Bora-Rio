import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from './common/common.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ClsUserInterceptor } from './common/interceptors/cls-user.interceptor';
import { createBaseDbOptions } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { BlocksModule } from './modules/blocks/blocks.module';
import { ChatModule } from './modules/chat/chat.module';
import { CheckinsModule } from './modules/checkins/checkins.module';
import { DeuBoraModule } from './modules/deu-bora/deu-bora.module';
import { EventsModule } from './modules/events/events.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { FollowsModule } from './modules/follows/follows.module';
import { HealthModule } from './modules/health/health.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { UsersModule } from './modules/users/users.module';
import { VenuesModule } from './modules/venues/venues.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => createBaseDbOptions(configService),
    }),
    CommonModule,
    SharedModule,
    HealthModule,
    AuthModule,
    UsersModule,
    PreferencesModule,
    VenuesModule,
    EventsModule,
    CheckinsModule,
    RewardsModule,
    FavoritesModule,
    ReportsModule,
    FollowsModule,
    BlocksModule,
    ChatModule,
    DeuBoraModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ClsUserInterceptor },
  ],
})
export class AppModule {}
