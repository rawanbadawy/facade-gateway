import { NestMiddleware } from '@nestjs/common';
import { MetricsService } from './metrics.service';
export declare class RequestMetricsMiddleware implements NestMiddleware {
    private readonly metrics;
    constructor(metrics: MetricsService);
    use(req: any, res: any, next: () => void): void;
}
