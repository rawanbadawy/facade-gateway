"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EchoAdapter = void 0;
class EchoAdapter {
    name = 'echo';
    toProvider(input) {
        return input;
    }
    async call(action, payload) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return { ok: true, data: { action, echoed: payload } };
    }
    fromProvider(resp) {
        return resp;
    }
}
exports.EchoAdapter = EchoAdapter;
//# sourceMappingURL=echo.adapter.js.map