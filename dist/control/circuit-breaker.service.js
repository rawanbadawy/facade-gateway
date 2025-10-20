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
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
function envInt(name, def) {
    const v = process.env[name];
    if (!v)
        return def;
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
}
let CircuitBreakerService = class CircuitBreakerService {
    redis;
    threshold = envInt('CB_FAILURE_THRESHOLD', 5);
    openMs = envInt('CB_OPEN_TIME_SEC', 60) * 1000;
    constructor(redis) {
        this.redis = redis;
    }
    key(id) {
        return `cb:${id}`;
    }
    async ensureCanPass(id) {
        const k = this.key(id);
        const state = (await this.redis.hget(k, 'state'));
        if (state === 'open') {
            const ttl = await this.redis.pttl(k);
            if (typeof ttl === 'number' && ttl > 0) {
                throw new common_1.ServiceUnavailableException('Circuit open (TransientError)');
            }
            await this.redis.hset(k, 'state', 'half');
            return;
        }
    }
    async onSuccess(id) {
        const k = this.key(id);
        await this.redis.del(k);
        await this.redis.del(`${k}:fail`);
    }
    async onFailure(id) {
        const k = this.key(id);
        const fails = await this.redis.incr(`${k}:fail`);
        if (fails >= this.threshold) {
            await this.redis.hset(k, 'state', 'open');
            await this.redis.pexpire(k, this.openMs);
            await this.redis.pexpire(`${k}:fail`, this.openMs);
        }
        else {
            await this.redis.hset(k, 'state', 'closed');
        }
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [Object])
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map