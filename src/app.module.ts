// src/app.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './infra/redis/redis.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { ControlModule } from './control/control.module';
import { AdapterModule } from './providers/adapter.module';
import { WebhookModule } from './webhooks/webhook.module';
import { MetricsModule } from './metrics/metrics.module';
import { OAuthModule } from './oauth/oauth.module';
import { AuditModule } from './audit/audit.module';
import { SecretsModule } from './secrets/secrets.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { FacadeController } from './facade/facade.controller';
import { AppController } from './app.controller';
import { ReportsModule } from './reports/reports.module';
import { RequestContextMiddleware } from './common/request-context.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    IdempotencyModule,
    ControlModule,
    AdapterModule,
    WebhookModule,
    MetricsModule,
    OAuthModule,
    AuditModule,
    SecretsModule,
    ApprovalsModule,
    ReportsModule,
  ],
  controllers: [AppController, FacadeController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
