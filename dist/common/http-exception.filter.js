"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpErrorFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpErrorFilter = class HttpErrorFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        let status = 500;
        let type = 'ServerError';
        let message = 'Unexpected error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const resp = exception.getResponse();
            if (status === 400)
                type = 'UserInput';
            else if (status === 401)
                type = 'AuthError';
            else if (status === 403)
                type = 'AuthError';
            else if (status === 429)
                type = 'QuotaExceeded';
            else if (status >= 500 && status < 600)
                type = 'TransientError';
            message =
                typeof resp === 'string'
                    ? resp
                    : resp &&
                        typeof resp === 'object' &&
                        'message' in resp &&
                        typeof resp.message !== 'undefined'
                        ? Array.isArray(resp.message)
                            ? resp.message.join('; ')
                            : resp.message
                        : message;
        }
        else if (typeof exception?.message === 'string') {
            message = exception.message;
            if (/TransientError/i.test(message)) {
                status = 503;
                type = 'TransientError';
            }
        }
        res.status(status).json({
            error: { type, message },
            requestId: req.id,
            statusCode: status,
            path: req.originalUrl,
        });
    }
};
exports.HttpErrorFilter = HttpErrorFilter;
exports.HttpErrorFilter = HttpErrorFilter = __decorate([
    (0, common_1.Catch)()
], HttpErrorFilter);
//# sourceMappingURL=http-exception.filter.js.map