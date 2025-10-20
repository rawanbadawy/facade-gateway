/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/control/rate-limit.service.ts
import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import type Redis from 'ioredis';

const LUA_TOKEN_BUCKET = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill   = tonumber(ARGV[2])
local now      = tonumber(ARGV[3])
local ttl      = tonumber(ARGV[4])

local current_tokens = tonumber(redis.call('HGET', key, 'tokens') or capacity)
local last_ts        = tonumber(redis.call('HGET', key, 'ts') or now)

if last_ts > now then last_ts = now end

local delta = now - last_ts
local filled = current_tokens + (delta * refill)
if filled > capacity then filled = capacity end

local allowed = 0
if filled >= 1 then
  filled = filled - 1
  allowed = 1
end

redis.call('HSET', key, 'tokens', filled, 'ts', now)
redis.call('EXPIRE', key, ttl)
return { allowed, filled }
`;

function envInt(name: string, def: number): number {
  const v = process.env[name];
  if (!v) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

@Injectable()
export class RateLimitService {
  private readonly dryRun =
    String(process.env.RATE_LIMIT_DRY_RUN || '').toLowerCase() === 'true';
  private readonly defaultCapacityPerMin = envInt(
    'RATE_LIMIT_CAPACITY_PER_MIN',
    60,
  );

  constructor(
    @Inject('REDIS') private readonly redis: Pick<Redis, 'eval' | 'time'>,
  ) {}

  async consume(bucketId: string, capacityPerMin?: number): Promise<void> {
    const capacity = capacityPerMin ?? this.defaultCapacityPerMin;
    const refillPerSec = capacity / 60;

    const key = `rl:${bucketId}`;
    const nowSec = await this.nowSeconds();
    const ttl = Math.max(
      120,
      2 * Math.ceil(capacity / Math.max(refillPerSec, 0.1)),
    );

    const res = (await (this.redis as any).eval(
      LUA_TOKEN_BUCKET,
      1,
      key,
      capacity,
      refillPerSec,
      nowSec,
      ttl,
    )) as [number, number] | null;

    const allowed = !!res && res[0] === 1;
    if (!allowed && !this.dryRun) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async backoff(attempt: number, baseMs = 100): Promise<void> {
    const jitter = Math.random() * baseMs;
    const delay = Math.min(2000, baseMs * Math.pow(2, attempt)) + jitter;
    await new Promise((r) => setTimeout(r, delay));
  }

  private async nowSeconds(): Promise<number> {
    const t = (await (this.redis as any).time()) as [string, string];
    return Number(t[0]);
  }
}
