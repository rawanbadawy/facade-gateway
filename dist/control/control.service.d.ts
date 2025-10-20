import type Redis from 'ioredis';
export declare class ControlService {
    private limiter;
    constructor(redis: Redis);
    consume(key: string): Promise<void>;
    backoff(attempt: number): Promise<void>;
}
