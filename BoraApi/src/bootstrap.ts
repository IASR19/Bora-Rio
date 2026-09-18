import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';

/**
 * Monta a aplicação Nest com toda a configuração compartilhada (prefixo, segurança,
 * CORS, validação, Swagger). Usado tanto pelo `main.ts` (dev local, `app.listen`)
 * quanto pela function serverless da Vercel (`api/index.ts`, sem `app.listen`).
 */
export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  app.use(helmet());
  app.use(cookieParser());

  const allowlist = configService.get<string>('CORS_ALLOWLIST', '').split(',').filter(Boolean);
  app.enableCors({ origin: allowlist, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (configService.get<string>('SWAGGER_ENABLED') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('BORA API')
      .setDescription('Onde ir. Com quem ir.')
      .setVersion('0.1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  return app;
}
