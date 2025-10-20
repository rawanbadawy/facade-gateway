import { Module, MiddlewareConsumer } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { RequestMetricsMiddleware } from './request-metrics.middleware';
import { MetricsController } from './metrics.controller';
import { PrometheusController } from './prometheus.controller';

@Module({
  providers: [MetricsService],
  controllers: [MetricsController, PrometheusController],
  exports: [MetricsService],
})
export class MetricsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMetricsMiddleware).forRoutes('*');
  }
}
