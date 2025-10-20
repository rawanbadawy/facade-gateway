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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
let AuditService = class AuditService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    stream() {
        return 'audit';
    }
    async record(entry) {
        const s = this.stream();
        const id = await this.redis.xadd(s, '*', 'ts', String(entry.ts), 'requestId', entry.requestId, 'actor', entry.actor, 'provider', entry.provider, 'action', entry.action, 'status', entry.status, 'message', entry.message ?? '');
        if (id === null) {
            throw new Error('Failed to record audit entry: Redis returned null');
        }
        return id;
    }
    async recent(limit = 20) {
        const rows = await this.redis.xrevrange(this.stream(), '+', '-', 'COUNT', limit);
        return rows.map(([id, kv]) => {
            const obj = {};
            for (let i = 0; i < kv.length; i += 2)
                obj[kv[i]] = kv[i + 1];
            return {
                ts: Number(obj.ts),
                requestId: obj.requestId,
                actor: obj.actor,
                provider: obj.provider,
                action: obj.action,
                status: obj.status,
                message: obj.message || undefined,
                _id: id,
            };
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [Object])
], AuditService);
//# sourceMappingURL=audit.service.js.map