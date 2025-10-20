"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValid = assertValid;
const common_1 = require("@nestjs/common");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const ajv = (0, ajv_formats_1.default)(new ajv_1.default({ allErrors: true }), ['email', 'uri']);
function assertValid(schema, data) {
    const validate = ajv.compile(schema);
    if (!validate(data)) {
        const msg = validate.errors
            ?.map((e) => `${e.instancePath || '/'} ${e.message}`)
            .join('; ') || 'Invalid payload';
        throw new common_1.BadRequestException(msg);
    }
}
//# sourceMappingURL=validate.js.map