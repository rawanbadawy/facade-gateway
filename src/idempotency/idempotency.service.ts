// src/idempotency/idempotency.service.ts
import {
  Inject,
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type Redis from 'ioredis';
import { createHash } from 'crypto';
import { MetricsService } from '../metrics/metrics.service';

type Stored<T> = { result: T; bodyHash: string; requestId?: string };
type IdemResult<T> = Stored<T> & { cached: boolean };

function envInt(name: string, def: number): number {
  const v = process.env[name];
  if (!v) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

@Injectable()
export class IdempotencyService {
  private readonly ttlSec = envInt('IDEM_TTL_SEC', 3600);

  constructor(
    @Inject('REDIS') private readonly redis: Pick<Redis, 'get' | 'set'>,
    private readonly metrics: MetricsService,
  ) {}

  private key(id: string): string {
    return `idem:${id}`;
  }

  private hashBody(body: unknown): string {
    return createHash('sha256')
      .update(JSON.stringify(body ?? {}))
      .digest('hex');
  }

  async getOrSet<T>(
    idempotencyKey: string,
    body: unknown,
    runner: () => Promise<T>,
    requestId?: string,
  ): Promise<IdemResult<T>> {
    if (!idempotencyKey)
      throw new BadRequestException('Missing Idempotency-Key');

    const k = this.key(idempotencyKey);
    const incomingHash = this.hashBody(body);

    const cachedRaw = await this.redis.get(k);
    if (cachedRaw) {
      const stored = JSON.parse(cachedRaw) as Stored<T>;
      if (stored.bodyHash !== incomingHash) {
        this.metrics.inc('idem.conflict');
        throw new ConflictException(
          'Idempotency key re-used with different payload',
        );
      }
      this.metrics.inc('idem.hit');
      return { ...stored, cached: true };
    }

    const result = await runner();
    const toStore: Stored<T> = { result, bodyHash: incomingHash, requestId };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await (this.redis as any).set(
      k,
      JSON.stringify(toStore),
      'EX',
      this.ttlSec,
    );
    this.metrics.inc('idem.miss');
    return { ...toStore, cached: false };
  }
}
