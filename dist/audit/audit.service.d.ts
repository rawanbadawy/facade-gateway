import type Redis from 'ioredis';
export type AuditEntry = {
    ts: number;
    requestId: string;
    actor: string;
    provider: string;
    action: string;
    status: 'success' | 'error';
    message?: string;
};
export declare class AuditService {
    private readonly redis;
    constructor(redis: Pick<Redis, 'xadd' | 'xrevrange'>);
    private stream;
    record(entry: AuditEntry): Promise<string>;
    recent(limit?: number): Promise<AuditEntry[]>;
}
