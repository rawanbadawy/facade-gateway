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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let OAuthService = class OAuthService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    key(p) {
        return `oauth:${p}`;
    }
    async getToken(cfg) {
        const cached = await this.redis.get(this.key(cfg.provider));
        if (cached) {
            const rec = JSON.parse(cached);
            const now = Math.floor(Date.now() / 1000);
            const ttl = rec.expires_in ?? 3600;
            if (now - rec.obtained_at < ttl - 60) {
                return rec.access_token;
            }
        }
        const form = new URLSearchParams();
        if (cfg.grantType === 'refresh_token' && cfg.refreshToken) {
            form.set('grant_type', 'refresh_token');
            form.set('refresh_token', cfg.refreshToken);
            form.set('client_id', cfg.clientId);
            form.set('client_secret', cfg.clientSecret);
        }
        else {
            form.set('grant_type', 'client_credentials');
            form.set('client_id', cfg.clientId);
            form.set('client_secret', cfg.clientSecret);
            if (cfg.scope)
                form.set('scope', cfg.scope);
            if (cfg.audience)
                form.set('audience', cfg.audience);
        }
        const resp = await axios_1.default.post(cfg.tokenUrl, form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10_000,
            validateStatus: () => true,
        });
        if (resp.status < 200 || resp.status >= 300) {
            throw new Error(`OAuth token error ${resp.status}: ${JSON.stringify(resp.data)}`);
        }
        const data = resp.data;
        const record = {
            access_token: data.access_token,
            token_type: data.token_type,
            expires_in: data.expires_in ?? 3600,
            scope: data.scope,
            obtained_at: Math.floor(Date.now() / 1000),
        };
        await this.redis.set(this.key(cfg.provider), JSON.stringify(record));
        return record.access_token;
    }
    async clear(provider) {
        await this.redis.del(this.key(provider));
    }
};
exports.OAuthService = OAuthService;
exports.OAuthService = OAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [Object])
], OAuthService);
//# sourceMappingURL=oauth.service.js.map