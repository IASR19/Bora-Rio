import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function createBaseDbOptions(configService: ConfigService): TypeOrmModuleOptions {
  const ssl = configService.get<string>('DATABASE_SSL') === 'true';

  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USER', 'postgres'),
    password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
    database: configService.get<string>('DATABASE_NAME', 'bora-local'),
    autoLoadEntities: true,
    synchronize: false,
    logging: configService.get<string>('NODE_ENV') === 'development',
    ssl: ssl ? { rejectUnauthorized: false } : false,
    // Pool pequeno: cada instância de function serverless mantém sua própria conexão.
    extra: { max: configService.get<number>('DATABASE_POOL_MAX', 5) },
  };
}
