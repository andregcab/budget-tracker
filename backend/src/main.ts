import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function getCorsOrigin(): boolean | string | string[] {
  const cors = process.env.CORS_ORIGIN?.trim();
  if (!cors) return true; // allow all
  return cors
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  if (
    isProd &&
    (!process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'dev-secret-change-in-production')
  ) {
    throw new Error(
      'JWT_SECRET must be set in production. Generate with: openssl rand -base64 32',
    );
  }

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: getCorsOrigin(), credentials: true });
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
