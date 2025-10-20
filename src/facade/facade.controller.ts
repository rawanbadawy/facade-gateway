/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/facade/facade.controller.ts
import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AdapterRegistry } from '../providers/registry.service';
import { IdempotencyService } from '../idempotency/idempotency.service';
import { RateLimitService } from '../control/rate-limit.service';
import { CircuitBreakerService } from '../control/circuit-breaker.service';
import { MetricsService } from '../metrics/metrics.service';
import { ApprovalsService } from '../approvals/approvals.service';
import { AuditService } from '../audit/audit.service';
import { canonicalEmailSchema } from './email.schema';
import { assertValid } from './validate';

@Controller()
export class FacadeController {
  constructor(
    private readonly reg: AdapterRegistry,
    private readonly idem: IdempotencyService,
    private readonly rl: RateLimitService,
    private readonly cb: CircuitBreakerService,
    private readonly metrics: MetricsService,
    private readonly approvals: ApprovalsService,
    private readonly audit: AuditService,
  ) {}

  @Post('adapter/:provider/:action')
  @HttpCode(200)
  async handle(
    @Param('provider') provider: string,
    @Param('action') action: string,
    @Body() body: any,
    @Headers('idempotency-key') idemKey: string,
    @Headers() headers: Record<string, string>,
    @Req() req: any,
  ) {
    const actor = headers['x-actor'] || req?.ctx?.ip || req.ip || 'anonymous';
    const tenantId = req?.ctx?.tenantId || 'public';
    const ip = req?.ctx?.ip || req.ip || 'unknown';

    // policy gate (approval)
    this.approvals.check(provider, action, headers);

    // rate limits (tenant-aware)
    await this.rl.consume(`tenant:${tenantId}:ip:${ip}`);
    await this.rl.consume(`tenant:${tenantId}:provider:${provider}`);

    // circuit breaker
    const circuitId = `${provider}:${action}`;
    await this.cb.ensureCanPass(circuitId);

    this.metrics.inc(`adapter.calls.${provider}.${action}`);

    if (provider === 'sendgrid' && action === 'send') {
      assertValid<typeof body>(canonicalEmailSchema, body);
    }

    try {
      const { result, bodyHash, cached } = await this.idem.getOrSet(
        idemKey,
        body,
        async () => {
          const adapter = this.reg.get(provider);
          const payload = adapter.toProvider(body);

          let lastErr: string | undefined;
          for (let i = 0; i < 3; i++) {
            try {
              const resp = await adapter.call(action, payload);
              if (resp.ok) {
                await this.cb.onSuccess(circuitId);
                return adapter.fromProvider(resp.data);
              }
              lastErr = resp.error;
            } catch (e: any) {
              lastErr = e?.message;
            }
            await this.rl.backoff(i);
          }
          await this.cb.onFailure(circuitId);
          throw new Error(`TransientError: ${lastErr ?? 'unknown'}`);
        },
        req?.ctx?.requestId ?? req.id,
      );

      void this.audit.record({
        ts: Date.now(),
        requestId: req?.ctx?.requestId ?? req.id,
        actor,
        provider,
        action,
        status: 'success',
      });

      this.metrics.inc(`adapter.success.${provider}.${action}`);
      return { result, bodyHash, cached };
    } catch (e: any) {
      void this.audit.record({
        ts: Date.now(),
        requestId: req?.ctx?.requestId ?? req.id,
        actor,
        provider,
        action,
        status: 'error',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: e?.message,
      });
      throw e;
    }
  }
}
