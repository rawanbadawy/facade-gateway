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
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
let ApprovalsService = class ApprovalsService {
    rules;
    constructor() {
        try {
            this.rules = JSON.parse(process.env.APPROVAL_RULES || '[]');
        }
        catch {
            this.rules = [];
        }
    }
    check(provider, action, headers) {
        const need = this.rules.find((r) => r.require &&
            r.provider.toLowerCase() === provider.toLowerCase() &&
            r.action.toLowerCase() === action.toLowerCase());
        if (!need)
            return;
        const approve = (headers['x-approve'] || headers['X-Approve']);
        if (approve?.toLowerCase() === 'yes')
            return;
        throw new common_1.ForbiddenException('Approval required (send header X-Approve: yes)');
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map