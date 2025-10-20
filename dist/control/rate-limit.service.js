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
exports.RateLimitService = void 0;
const common_1 = require("@nestjs/common");
const LUA_TOKEN_BUCKET = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill   = tonumber(ARGV[2])
local now      = tonumber(ARGV[3])
local ttl      = tonumber(ARGV[4])

local current_tokens = tonumber(redis.call('HGET', key, 'tokens') or capacity)
local last_ts        = tonumber(redis.call('HGET', key, 'ts') or now)

if last_ts > now then last_ts = now end

local delta = now - last_ts
local filled = current_tokens + (delta * refill)
if filled > capacity then filled = capacity end

local allowed = 0
if filled >= 1 then
  filled = filled - 1
  allowed = 1
end

redis.call('HSET', key, 'tokens', filled, 'ts', now)
redis.call('EXPIRE', key, ttl)
return { allowed, filled }
`;
function envInt(name, def) {
    const v = process.env[name];
    if (!v)
        return def;
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
}
let RateLimitService = class RateLimitService {
    redis;
    dryRun = String(process.env.RATE_LIMIT_DRY_RUN || '').toLowerCase() === 'true';
    defaultCapacityPerMin = envInt('RATE_LIMIT_CAPACITY_PER_MIN', 60);
    constructor(redis) {
        this.redis = redis;
    }
    async consume(bucketId, capacityPerMin) {
        const capacity = capacityPerMin ?? this.defaultCapacityPerMin;
        const refillPerSec = capacity / 60;
        const key = `rl:${bucketId}`;
        const nowSec = await this.nowSeconds();
        const ttl = Math.max(120, 2 * Math.ceil(capacity / Math.max(refillPerSec, 0.1)));
        const res = (await this.redis.eval(LUA_TOKEN_BUCKET, 1, key, capacity, refillPerSec, nowSec, ttl));
        const allowed = !!res && res[0] === 1;
        if (!allowed && !this.dryRun) {
            throw new common_1.HttpException('Too Many Requests', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
    }
    async backoff(attempt, baseMs = 100) {
        const jitter = Math.random() * baseMs;
        const delay = Math.min(2000, baseMs * Math.pow(2, attempt)) + jitter;
        await new Promise((r) => setTimeout(r, delay));
    }
    async nowSeconds() {
        const t = (await this.redis.time());
        return Number(t[0]);
    }
};
exports.RateLimitService = RateLimitService;
exports.RateLimitService = RateLimitService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [Object])
], RateLimitService);
//# sourceMappingURL=rate-limit.service.js.map