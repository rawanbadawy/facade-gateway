import { MetricsService } from '../metrics/metrics.service';
export declare class ReportsController {
    private readonly metrics;
    constructor(metrics: MetricsService);
    summary(): {
        window: string;
        requests: number;
        successRatePct: number;
        idem: {
            hits: number;
            misses: number;
            hitRatePct: number;
        };
        latency: {
            dominantBucket: string;
            lt50: number;
            lt250: number;
            ge250: number;
        };
    };
}
