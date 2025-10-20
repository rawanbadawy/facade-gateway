import { Controller, Get } from '@nestjs/common';
import { MetricsService } from '../metrics/metrics.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get('summary')
  summary() {
    const c = this.metrics.all();
    const total = c['responses.total'] || 0;
    const ok200 = c['responses.status.200'] || 0;
    const hits = c['idem.hit'] || 0;
    const misses = c['idem.miss'] || 0;

    const successRate = total ? +((ok200 / total) * 100).toFixed(2) : 0;
    const idemTotal = hits + misses;
    const idemHitRate = idemTotal ? +((hits / idemTotal) * 100).toFixed(2) : 0;

    const lat50 = c['latency.lt50'] || 0;
    const lat250 = c['latency.lt250'] || 0;
    const latOther = total - lat50 - lat250;
    const dominantLatency = (() => {
      const entries: [string, number][] = [
        ['<50ms', lat50],
        ['<250ms', lat250],
        ['>=250ms', Math.max(0, latOther)],
      ];
      entries.sort((a, b) => b[1] - a[1]);
      return entries[0][0];
    })();

    return {
      window: 'since startup',
      requests: total,
      successRatePct: successRate,
      idem: {
        hits,
        misses,
        hitRatePct: idemHitRate,
      },
      latency: {
        dominantBucket: dominantLatency,
        lt50: lat50,
        lt250: lat250,
        ge250: Math.max(0, latOther),
      },
    };
  }
}
