import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';

export type AuditEntry = {
  ts: number;
  requestId: string;
  actor: string; // user/ip/header
  provider: string;
  action: string;
  status: 'success' | 'error';
  message?: string;
};

@Injectable()
export class AuditService {
  constructor(
    @Inject('REDIS') private readonly redis: Pick<Redis, 'xadd' | 'xrevrange'>,
  ) {}

  private stream() {
    return 'audit';
  }

  async record(entry: AuditEntry): Promise<string> {
    const s = this.stream();
    const id = await this.redis.xadd(
      s,
      '*',
      'ts',
      String(entry.ts),
      'requestId',
      entry.requestId,
      'actor',
      entry.actor,
      'provider',
      entry.provider,
      'action',
      entry.action,
      'status',
      entry.status,
      'message',
      entry.message ?? '',
    );
    if (id === null) {
      throw new Error('Failed to record audit entry: Redis returned null');
    }
    return id;
  }

  async recent(limit = 20): Promise<AuditEntry[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const rows = await (this.redis as any).xrevrange(
      this.stream(),
      '+',
      '-',
      'COUNT',
      limit,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return rows.map(([id, kv]: [string, string[]]) => {
      const obj: any = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      for (let i = 0; i < kv.length; i += 2) obj[kv[i]] = kv[i + 1];
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ts: Number(obj.ts),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        requestId: obj.requestId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        actor: obj.actor,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        provider: obj.provider,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        action: obj.action,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        status: obj.status as 'success' | 'error',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: obj.message || undefined,
        _id: id,
      };
    });
  }
}
