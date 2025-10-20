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
exports.AdapterRegistry = void 0;
const common_1 = require("@nestjs/common");
const echo_adapter_1 = require("./echo.adapter");
const sendgrid_adapter_1 = require("./sendgrid.adapter");
const fake_adapter_1 = require("./fake.adapter");
let AdapterRegistry = class AdapterRegistry {
    adapters;
    constructor() {
        this.adapters = new Map([
            ['echo', new echo_adapter_1.EchoAdapter()],
            ['sendgrid', new sendgrid_adapter_1.SendgridAdapter()],
            ['fake', new fake_adapter_1.FakeAdapter()],
        ]);
    }
    get(provider) {
        const a = this.adapters.get(provider);
        if (!a)
            throw new Error(`Unknown provider: ${provider}`);
        return a;
    }
};
exports.AdapterRegistry = AdapterRegistry;
exports.AdapterRegistry = AdapterRegistry = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AdapterRegistry);
//# sourceMappingURL=registry.service.js.map