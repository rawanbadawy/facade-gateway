import type Redis from 'ioredis';
export declare class CircuitBreakerService {
    private readonly redis;
    private readonly threshold;
    private readonly openMs;
    constructor(redis: Pick<Redis, 'hget' | 'hset' | 'pttl' | 'pexpire' | 'incr' | 'del'>);
    private key;
    ensureCanPass(id: string): Promise<void>;
    onSuccess(id: string): Promise<void>;
    onFailure(id: string): Promise<void>;
}
