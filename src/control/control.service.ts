import { Injectable, Inject } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import type Redis from 'ioredis';

@Injectable()
export class ControlService {
  private limiter: RateLimiterRedis;
  constructor(@Inject('REDIS') redis: Redis) {
    this.limiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'rl',
      points: 10,
      duration: 1,
    });
  }
  async consume(key: string) {
    await this.limiter.consume(key);
  }
  async backoff(attempt: number) {
    const base = Math.min(200 * 2 ** attempt, 4000);
    await new Promise((r) => setTimeout(r, Math.random() * base));
  }
}
