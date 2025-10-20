import type Redis from 'ioredis';
export declare class RateLimitService {
    private readonly redis;
    private readonly dryRun;
    private readonly defaultCapacityPerMin;
    constructor(redis: Pick<Redis, 'eval' | 'time'>);
    consume(bucketId: string, capacityPerMin?: number): Promise<void>;
    backoff(attempt: number, baseMs?: number): Promise<void>;
    private nowSeconds;
}
