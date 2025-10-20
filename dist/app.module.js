"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_module_1 = require("./infra/redis/redis.module");
const idempotency_module_1 = require("./idempotency/idempotency.module");
const control_module_1 = require("./control/control.module");
const adapter_module_1 = require("./providers/adapter.module");
const webhook_module_1 = require("./webhooks/webhook.module");
const metrics_module_1 = require("./metrics/metrics.module");
const oauth_module_1 = require("./oauth/oauth.module");
const audit_module_1 = require("./audit/audit.module");
const secrets_module_1 = require("./secrets/secrets.module");
const approvals_module_1 = require("./approvals/approvals.module");
const facade_controller_1 = require("./facade/facade.controller");
const app_controller_1 = require("./app.controller");
const reports_module_1 = require("./reports/reports.module");
const request_context_middleware_1 = require("./common/request-context.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_context_middleware_1.RequestContextMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            redis_module_1.RedisModule,
            idempotency_module_1.IdempotencyModule,
            control_module_1.ControlModule,
            adapter_module_1.AdapterModule,
            webhook_module_1.WebhookModule,
            metrics_module_1.MetricsModule,
            oauth_module_1.OAuthModule,
            audit_module_1.AuditModule,
            secrets_module_1.SecretsModule,
            approvals_module_1.ApprovalsModule,
            reports_module_1.ReportsModule,
        ],
        controllers: [app_controller_1.AppController, facade_controller_1.FacadeController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map