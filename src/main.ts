// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './common/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseHeadersInterceptor } from './common/response-headers.interceptor';
import * as express from 'express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Raw body ONLY for webhooks (exact HMAC bytes)
  app.use('/v1/webhooks', express.raw({ type: '*/*' }));

  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new ResponseHeadersInterceptor());

  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('Facade Gateway')
    .setDescription(
      'A façade layer that normalizes requests to multiple providers (idempotent, rate-limited, validated).',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'bearer',
    )
    .addApiKey(
      { type: 'apiKey', in: 'header', name: 'Idempotency-Key' },
      'idempotency',
    )
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/docs', app, doc, {
    swaggerOptions: { displayRequestDuration: true },
    customSiteTitle: 'Facade Gateway Docs',
  });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
  console.log(`Docs:  http://localhost:${process.env.PORT || 3001}/v1/docs`);
  console.log(`Health: http://localhost:${process.env.PORT || 3001}/v1/health`);
}
void bootstrap();
