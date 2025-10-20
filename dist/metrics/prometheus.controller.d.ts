import { MetricsService } from './metrics.service';
export declare class PrometheusController {
    private readonly metrics;
    constructor(metrics: MetricsService);
    getProm(): string;
}
