import { Injectable, NestMiddleware } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Injectable()
export class RequestMetricsMiddleware implements NestMiddleware {
  constructor(private readonly metrics: MetricsService) {}

  use(req: any, res: any, next: () => void): void {
    this.metrics.inc('requests.total');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.metrics.inc(`requests.method.${(req.method || 'GET').toUpperCase()}`);

    const start = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.on('finish', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const code = res.statusCode || 0;
      this.metrics.inc(`responses.status.${code}`);
      this.metrics.inc('responses.total');

      const ms = Date.now() - start;
      // simple latency buckets
      const bucket =
        ms < 50
          ? 'lt50'
          : ms < 100
            ? 'lt100'
            : ms < 250
              ? 'lt250'
              : ms < 500
                ? 'lt500'
                : 'gte500';
      this.metrics.inc(`latency.${bucket}`);
    });

    next();
  }
}
