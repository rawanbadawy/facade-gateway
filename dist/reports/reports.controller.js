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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("../metrics/metrics.service");
let ReportsController = class ReportsController {
    metrics;
    constructor(metrics) {
        this.metrics = metrics;
    }
    summary() {
        const c = this.metrics.all();
        const total = c['responses.total'] || 0;
        const ok200 = c['responses.status.200'] || 0;
        const hits = c['idem.hit'] || 0;
        const misses = c['idem.miss'] || 0;
        const successRate = total ? +((ok200 / total) * 100).toFixed(2) : 0;
        const idemTotal = hits + misses;
        const idemHitRate = idemTotal ? +((hits / idemTotal) * 100).toFixed(2) : 0;
        const lat50 = c['latency.lt50'] || 0;
        const lat250 = c['latency.lt250'] || 0;
        const latOther = total - lat50 - lat250;
        const dominantLatency = (() => {
            const entries = [
                ['<50ms', lat50],
                ['<250ms', lat250],
                ['>=250ms', Math.max(0, latOther)],
            ];
            entries.sort((a, b) => b[1] - a[1]);
            return entries[0][0];
        })();
        return {
            window: 'since startup',
            requests: total,
            successRatePct: successRate,
            idem: {
                hits,
                misses,
                hitRatePct: idemHitRate,
            },
            latency: {
                dominantBucket: dominantLatency,
                lt50: lat50,
                lt250: lat250,
                ge250: Math.max(0, latOther),
            },
        };
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "summary", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map