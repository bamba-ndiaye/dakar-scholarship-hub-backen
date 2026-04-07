import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

function buildAllowedOrigins(appUrl?: string) {
  const defaults = [
    'http://localhost:5173',
    'https://dakar-scholarship-hub-mains.vercel.app',
    'https://dakar-scholarship-hub-front.vercel.app',
  ];

  const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, '');

  const configured = (appUrl ?? '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  return Array.from(new Set([...defaults.map(normalizeOrigin), ...configured]));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get<string>('app.apiPrefix', 'api/v1'));
  app.use(helmet());
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const allowedOrigins = buildAllowedOrigins(configService.get<string>('app.appUrl'));

  app.enableCors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin?.replace(/\/+$/, '');

      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dakar Scholarship Hub API')
    .setDescription('API REST securisee pour la gestion des bourses de Dakar')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>('app.port', 4000);
  await app.listen(port);
}

void bootstrap();
