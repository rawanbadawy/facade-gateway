"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/http-exception.filter");
const swagger_1 = require("@nestjs/swagger");
const response_headers_interceptor_1 = require("./common/response-headers.interceptor");
const express = __importStar(require("express"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use('/v1/webhooks', express.raw({ type: '*/*' }));
    app.useGlobalFilters(new http_exception_filter_1.HttpErrorFilter());
    app.useGlobalInterceptors(new response_headers_interceptor_1.ResponseHeadersInterceptor());
    app.setGlobalPrefix('v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Facade Gateway')
        .setDescription('A façade layer that normalizes requests to multiple providers (idempotent, rate-limited, validated).')
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'bearer')
        .addApiKey({ type: 'apiKey', in: 'header', name: 'Idempotency-Key' }, 'idempotency')
        .build();
    const doc = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('v1/docs', app, doc, {
        swaggerOptions: { displayRequestDuration: true },
        customSiteTitle: 'Facade Gateway Docs',
    });
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
    console.log(`Docs:  http://localhost:${process.env.PORT || 3001}/v1/docs`);
    console.log(`Health: http://localhost:${process.env.PORT || 3001}/v1/health`);
}
void bootstrap();
//# sourceMappingURL=main.js.map