import type Redis from 'ioredis';
import { MetricsService } from '../metrics/metrics.service';
type Stored<T> = {
    result: T;
    bodyHash: string;
    requestId?: string;
};
type IdemResult<T> = Stored<T> & {
    cached: boolean;
};
export declare class IdempotencyService {
    private readonly redis;
    private readonly metrics;
    private readonly ttlSec;
    constructor(redis: Pick<Redis, 'get' | 'set'>, metrics: MetricsService);
    private key;
    private hashBody;
    getOrSet<T>(idempotencyKey: string, body: unknown, runner: () => Promise<T>, requestId?: string): Promise<IdemResult<T>>;
}
export {};
