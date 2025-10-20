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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestMetricsMiddleware = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("./metrics.service");
let RequestMetricsMiddleware = class RequestMetricsMiddleware {
    metrics;
    constructor(metrics) {
        this.metrics = metrics;
    }
    use(req, res, next) {
        this.metrics.inc('requests.total');
        this.metrics.inc(`requests.method.${(req.method || 'GET').toUpperCase()}`);
        const start = Date.now();
        res.on('finish', () => {
            const code = res.statusCode || 0;
            this.metrics.inc(`responses.status.${code}`);
            this.metrics.inc('responses.total');
            const ms = Date.now() - start;
            const bucket = ms < 50
                ? 'lt50'
                : ms < 100
                    ? 'lt100'
                    : ms < 250
                        ? 'lt250'
                        : ms < 500
                            ? 'lt500'
                            : 'gte500';
            this.metrics.inc(`latency.${bucket}`);
        });
        next();
    }
};
exports.RequestMetricsMiddleware = RequestMetricsMiddleware;
exports.RequestMetricsMiddleware = RequestMetricsMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], RequestMetricsMiddleware);
//# sourceMappingURL=request-metrics.middleware.js.map