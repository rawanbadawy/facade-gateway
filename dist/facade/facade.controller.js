"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacadeController = void 0;
const common_1 = require("@nestjs/common");
const registry_service_1 = require("../providers/registry.service");
const idempotency_service_1 = require("../idempotency/idempotency.service");
const rate_limit_service_1 = require("../control/rate-limit.service");
const circuit_breaker_service_1 = require("../control/circuit-breaker.service");
const metrics_service_1 = require("../metrics/metrics.service");
const approvals_service_1 = require("../approvals/approvals.service");
const audit_service_1 = require("../audit/audit.service");
const email_schema_1 = require("./email.schema");
const validate_1 = require("./validate");
let FacadeController = class FacadeController {
    reg;
    idem;
    rl;
    cb;
    metrics;
    approvals;
    audit;
    constructor(reg, idem, rl, cb, metrics, approvals, audit) {
        this.reg = reg;
        this.idem = idem;
        this.rl = rl;
        this.cb = cb;
        this.metrics = metrics;
        this.approvals = approvals;
        this.audit = audit;
    }
    async handle(provider, action, body, idemKey, headers, req) {
        const actor = headers['x-actor'] || req?.ctx?.ip || req.ip || 'anonymous';
        const tenantId = req?.ctx?.tenantId || 'public';
        const ip = req?.ctx?.ip || req.ip || 'unknown';
        this.approvals.check(provider, action, headers);
        await this.rl.consume(`tenant:${tenantId}:ip:${ip}`);
        await this.rl.consume(`tenant:${tenantId}:provider:${provider}`);
        const circuitId = `${provider}:${action}`;
        await this.cb.ensureCanPass(circuitId);
        this.metrics.inc(`adapter.calls.${provider}.${action}`);
        if (provider === 'sendgrid' && action === 'send') {
            (0, validate_1.assertValid)(email_schema_1.canonicalEmailSchema, body);
        }
        try {
            const { result, bodyHash, cached } = await this.idem.getOrSet(idemKey, body, async () => {
                const adapter = this.reg.get(provider);
                const payload = adapter.toProvider(body);
                let lastErr;
                for (let i = 0; i < 3; i++) {
                    try {
                        const resp = await adapter.call(action, payload);
                        if (resp.ok) {
                            await this.cb.onSuccess(circuitId);
                            return adapter.fromProvider(resp.data);
                        }
                        lastErr = resp.error;
                    }
                    catch (e) {
                        lastErr = e?.message;
                    }
                    await this.rl.backoff(i);
                }
                await this.cb.onFailure(circuitId);
                throw new Error(`TransientError: ${lastErr ?? 'unknown'}`);
            }, req?.ctx?.requestId ?? req.id);
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
        }
        catch (e) {
            void this.audit.record({
                ts: Date.now(),
                requestId: req?.ctx?.requestId ?? req.id,
                actor,
                provider,
                action,
                status: 'error',
                message: e?.message,
            });
            throw e;
        }
    }
};
exports.FacadeController = FacadeController;
__decorate([
    (0, common_1.Post)('adapter/:provider/:action'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Param)('action')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('idempotency-key')),
    __param(4, (0, common_1.Headers)()),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FacadeController.prototype, "handle", null);
exports.FacadeController = FacadeController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [registry_service_1.AdapterRegistry,
        idempotency_service_1.IdempotencyService,
        rate_limit_service_1.RateLimitService,
        circuit_breaker_service_1.CircuitBreakerService,
        metrics_service_1.MetricsService,
        approvals_service_1.ApprovalsService,
        audit_service_1.AuditService])
], FacadeController);
//# sourceMappingURL=facade.controller.js.map