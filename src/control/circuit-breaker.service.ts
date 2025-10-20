// src/control/circuit-breaker.service.ts
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type Redis from 'ioredis';

type State = 'closed' | 'open' | 'half';

function envInt(name: string, def: number): number {
  const v = process.env[name];
  if (!v) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

@Injectable()
export class CircuitBreakerService {
  private readonly threshold = envInt('CB_FAILURE_THRESHOLD', 5);
  private readonly openMs = envInt('CB_OPEN_TIME_SEC', 60) * 1000;

  constructor(
    @Inject('REDIS')
    private readonly redis: Pick<
      Redis,
      'hget' | 'hset' | 'pttl' | 'pexpire' | 'incr' | 'del'
    >,
  ) {}

  private key(id: string) {
    return `cb:${id}`;
  }

  /**
   * Throws when circuit is OPEN and cool-down not elapsed. If cool-down elapsed,
   * flips to HALF and allows exactly one probe (enforced by caller).
   */
  async ensureCanPass(id: string): Promise<void> {
    const k = this.key(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const state = (await (this.redis as any).hget(k, 'state')) as State | null;

    if (state === 'open') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const ttl = await (this.redis as any).pttl(k);
      if (typeof ttl === 'number' && ttl > 0) {
        throw new ServiceUnavailableException('Circuit open (TransientError)');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (this.redis as any).hset(k, 'state', 'half');
      return;
    }
  }

  async onSuccess(id: string): Promise<void> {
    const k = this.key(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await (this.redis as any).del(k);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await (this.redis as any).del(`${k}:fail`);
  }

  async onFailure(id: string): Promise<void> {
    const k = this.key(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const fails = await (this.redis as any).incr(`${k}:fail`);
    if (fails >= this.threshold) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (this.redis as any).hset(k, 'state', 'open');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (this.redis as any).pexpire(k, this.openMs);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (this.redis as any).pexpire(`${k}:fail`, this.openMs);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (this.redis as any).hset(k, 'state', 'closed');
    }
  }
}
