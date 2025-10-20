"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
function buildOptions(urlStr, prefix) {
    const u = new URL(urlStr);
    const isTls = u.protocol === 'rediss:';
    const rejectUnauthorized = (process.env.REDIS_TLS_REJECT_UNAUTHORIZED ?? 'true').toLowerCase() !==
        'false';
    const opts = {
        lazyConnect: true,
        maxRetriesPerRequest: null,
        keyPrefix: prefix ? `${prefix}:` : undefined,
        connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? 15000),
    };
    if (isTls) {
        opts.tls = {
            servername: u.hostname,
            rejectUnauthorized,
        };
    }
    return opts;
}
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: 'REDIS',
                inject: [config_1.ConfigService],
                useFactory: async (cfg) => {
                    const url = (cfg.get('REDIS_URL') || '').trim();
                    if (!url) {
                        throw new Error('REDIS_URL is not set. Provide a valid Redis connection URL.');
                    }
                    const prefix = (cfg.get('REDIS_KEY_PREFIX') || '').trim();
                    const options = buildOptions(url, prefix);
                    const client = new ioredis_1.default(url, options);
                    client.on('error', (e) => {
                        console.error('[Redis] error:', e?.message || e);
                    });
                    await client.connect();
                    const pong = await client.ping();
                    console.log(`[Redis] connected (${url.startsWith('rediss://') ? 'TLS' : 'plain'}), PING=${pong}`);
                    return client;
                },
            },
        ],
        exports: ['REDIS'],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map