import { Module } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [MetricsModule], // <-- make MetricsService visible here
  providers: [IdempotencyService],
  exports: [IdempotencyService],
})
export class IdempotencyModule {}
