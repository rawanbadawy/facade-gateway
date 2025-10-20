import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [MetricsModule],
  controllers: [ReportsController],
})
export class ReportsModule {}
