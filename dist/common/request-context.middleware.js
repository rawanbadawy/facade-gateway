"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let RequestContextMiddleware = class RequestContextMiddleware {
    use(req, _res, next) {
        const requestId = req.id || (0, crypto_1.randomUUID)();
        const ip = req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for'] ||
            req.ip ||
            'unknown';
        const tenantId = req.headers['x-tenant-id'] || 'public';
        const userId = req.headers['x-user-id'] || 'system';
        req.id = requestId;
        req.ctx = { requestId, tenantId, userId, ip: String(ip) };
        next();
    }
};
exports.RequestContextMiddleware = RequestContextMiddleware;
exports.RequestContextMiddleware = RequestContextMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestContextMiddleware);
//# sourceMappingURL=request-context.middleware.js.map