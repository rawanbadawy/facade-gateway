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
exports.IdempotencyService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const metrics_service_1 = require("../metrics/metrics.service");
function envInt(name, def) {
    const v = process.env[name];
    if (!v)
        return def;
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
}
let IdempotencyService = class IdempotencyService {
    redis;
    metrics;
    ttlSec = envInt('IDEM_TTL_SEC', 3600);
    constructor(redis, metrics) {
        this.redis = redis;
        this.metrics = metrics;
    }
    key(id) {
        return `idem:${id}`;
    }
    hashBody(body) {
        return (0, crypto_1.createHash)('sha256')
            .update(JSON.stringify(body ?? {}))
            .digest('hex');
    }
    async getOrSet(idempotencyKey, body, runner, requestId) {
        if (!idempotencyKey)
            throw new common_1.BadRequestException('Missing Idempotency-Key');
        const k = this.key(idempotencyKey);
        const incomingHash = this.hashBody(body);
        const cachedRaw = await this.redis.get(k);
        if (cachedRaw) {
            const stored = JSON.parse(cachedRaw);
            if (stored.bodyHash !== incomingHash) {
                this.metrics.inc('idem.conflict');
                throw new common_1.ConflictException('Idempotency key re-used with different payload');
            }
            this.metrics.inc('idem.hit');
            return { ...stored, cached: true };
        }
        const result = await runner();
        const toStore = { result, bodyHash: incomingHash, requestId };
        await this.redis.set(k, JSON.stringify(toStore), 'EX', this.ttlSec);
        this.metrics.inc('idem.miss');
        return { ...toStore, cached: false };
    }
};
exports.IdempotencyService = IdempotencyService;
exports.IdempotencyService = IdempotencyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [Object, metrics_service_1.MetricsService])
], IdempotencyService);
//# sourceMappingURL=idempotency.service.js.map