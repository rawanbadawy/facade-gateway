import { MetricsService } from './metrics.service';
export declare class MetricsController {
    private readonly metrics;
    constructor(metrics: MetricsService);
    getAll(): {
        service: string;
        ts: string;
        counters: {
            [x: string]: number;
        };
    };
}
