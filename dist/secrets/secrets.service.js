"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsService = void 0;
const common_1 = require("@nestjs/common");
let SecretsService = class SecretsService {
    get(name, fallback) {
        return process.env[name] ?? fallback;
    }
    require(name) {
        const v = process.env[name];
        if (!v)
            throw new Error(`Missing secret: ${name}`);
        return v;
    }
};
exports.SecretsService = SecretsService;
exports.SecretsService = SecretsService = __decorate([
    (0, common_1.Injectable)()
], SecretsService);
//# sourceMappingURL=secrets.service.js.map