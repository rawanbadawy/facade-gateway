import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics/prom')
export class PrometheusController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  getProm(): string {
    const lines: string[] = [];
    const c = this.metrics.all();

    // Optional HELP/TYPE headers for a few well-known metrics
    lines.push('# HELP requests_total Total HTTP requests');
    lines.push('# TYPE requests_total counter');
    lines.push(`# HELP responses_total Total HTTP responses`);
    lines.push('# TYPE responses_total counter');

    for (const [k, v] of Object.entries(c)) {
      const name = k
        .replace(/\./g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();

      // Map some counters to canonical names
      if (k === 'requests.total') lines.push(`requests_total ${v}`);
      else if (k === 'responses.total') lines.push(`responses_total ${v}`);
      else lines.push(`${name} ${v}`);
    }

    return lines.join('\n') + '\n';
  }
}
