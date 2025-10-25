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
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let WebhookController = class WebhookController {
    hmacHex(raw) {
        const secret = process.env.WEBHOOK_SECRET || '';
        return (0, crypto_1.createHmac)('sha256', secret).update(raw).digest('hex');
    }
    receive(provider, sig, req) {
        const raw = Buffer.isBuffer(req?.body)
            ? req.body
            : req?.rawBody instanceof Buffer
                ? req.rawBody
                : Buffer.from(typeof req?.body === 'string'
                    ? req.body
                    : JSON.stringify(req?.body ?? {}), 'utf8');
        const computedHex = this.hmacHex(raw);
        const providedHex = (sig ?? '').trim();
        const computedBuf = Buffer.from(computedHex, 'hex');
        const providedBuf = Buffer.from(providedHex, 'hex');
        if (!providedHex || providedBuf.length !== computedBuf.length) {
            throw new common_1.UnauthorizedException('Bad signature');
        }
        if (!(0, crypto_1.timingSafeEqual)(providedBuf, computedBuf)) {
            throw new common_1.UnauthorizedException('Bad signature');
        }
        let parsed = {};
        try {
            parsed = JSON.parse(raw.toString('utf8'));
        }
        catch {
        }
        return {
            received: true,
            provider,
            event: parsed?.type ?? 'unknown',
        };
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)(':provider'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Headers)('x-signature')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WebhookController.prototype, "receive", null);
exports.WebhookController = WebhookController = __decorate([
    (0, common_1.Controller)('webhooks')
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map