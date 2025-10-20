import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  getAll() {
    return {
      service: 'facade-gateway',
      ts: new Date().toISOString(),
      counters: this.metrics.all(),
    };
  }
}
