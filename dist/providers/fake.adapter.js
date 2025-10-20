"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeAdapter = void 0;
class FakeAdapter {
    toProvider(body) {
        return body;
    }
    async call(action, payload) {
        void payload;
        if (action === 'fail') {
            return { ok: false, error: 'Simulated provider failure' };
        }
        return { ok: true, data: { ok: true, action, provider: 'fake' } };
    }
    fromProvider(data) {
        return data;
    }
}
exports.FakeAdapter = FakeAdapter;
//# sourceMappingURL=fake.adapter.js.map