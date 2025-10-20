import { AdapterRegistry } from '../providers/registry.service';
import { IdempotencyService } from '../idempotency/idempotency.service';
import { RateLimitService } from '../control/rate-limit.service';
import { CircuitBreakerService } from '../control/circuit-breaker.service';
import { MetricsService } from '../metrics/metrics.service';
import { ApprovalsService } from '../approvals/approvals.service';
import { AuditService } from '../audit/audit.service';
export declare class FacadeController {
    private readonly reg;
    private readonly idem;
    private readonly rl;
    private readonly cb;
    private readonly metrics;
    private readonly approvals;
    private readonly audit;
    constructor(reg: AdapterRegistry, idem: IdempotencyService, rl: RateLimitService, cb: CircuitBreakerService, metrics: MetricsService, approvals: ApprovalsService, audit: AuditService);
    handle(provider: string, action: string, body: any, idemKey: string, headers: Record<string, string>, req: any): Promise<{
        result: any;
        bodyHash: string;
        cached: boolean;
    }>;
}
