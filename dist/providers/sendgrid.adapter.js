"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendgridAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
class SendgridAdapter {
    toProvider(input) {
        const from = process.env.SENDGRID_FROM || 'no-reply@example.com';
        const payload = {
            personalizations: [
                {
                    to: input.to,
                    cc: input.cc,
                    bcc: input.bcc,
                    headers: input.headers,
                    subject: input.subject,
                },
            ],
            from: parseFrom(from),
            reply_to: input.replyTo,
            content: buildContent(input),
            attachments: input.attachments?.map((a) => ({
                filename: a.filename,
                content: a.content,
                type: a.type,
                disposition: a.disposition ?? 'attachment',
            })) ?? undefined,
        };
        const sgSandbox = String(process.env.SENDGRID_SANDBOX || '').toLowerCase() === 'true';
        if (sgSandbox) {
            payload.mail_settings = { sandbox_mode: { enable: true } };
        }
        return payload;
        function parseFrom(f) {
            const m = f.match(/^(.*)<(.+@.+)>$/);
            if (m) {
                return {
                    name: m[1].trim().replace(/(^"|"$)/g, ''),
                    email: m[2].trim(),
                };
            }
            return { email: f.trim() };
        }
        function buildContent(i) {
            const blocks = [];
            if (i.text)
                blocks.push({ type: 'text/plain', value: i.text });
            if (i.html)
                blocks.push({ type: 'text/html', value: i.html });
            if (blocks.length === 0)
                blocks.push({ type: 'text/plain', value: '' });
            return blocks;
        }
    }
    async call(action, payload) {
        if (action !== 'send') {
            return { ok: false, error: `Unsupported action: ${action}` };
        }
        const localSandbox = String(process.env.SENDGRID_SANDBOX || '').toLowerCase() === 'true';
        if (localSandbox) {
            return { ok: true, data: { status: 200, sandbox: true } };
        }
        const key = process.env.SENDGRID_API_KEY;
        if (!key)
            return { ok: false, error: 'Missing SENDGRID_API_KEY' };
        try {
            const res = await axios_1.default.post('https://api.sendgrid.com/v3/mail/send', payload, {
                headers: {
                    Authorization: `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10_000,
                validateStatus: () => true,
            });
            if (res.status >= 200 && res.status < 300) {
                return { ok: true, data: { status: res.status } };
            }
            return {
                ok: false,
                error: `SendGrid ${res.status}: ${JSON.stringify(res.data)}`,
            };
        }
        catch (err) {
            if (axios_1.default.isAxiosError(err)) {
                const ae = err;
                const status = ae.response?.status;
                const data = ae.response?.data;
                return {
                    ok: false,
                    error: `Axios ${status ?? 'ERR'}: ${JSON.stringify(data ?? ae.message)}`,
                };
            }
            if (err instanceof Error)
                return { ok: false, error: err.message };
            return { ok: false, error: 'Unknown error' };
        }
    }
    fromProvider(resp) {
        if (resp?.sandbox)
            return { delivered: true, sandbox: true };
        const status = resp?.status;
        return { delivered: status === 202 || status === 200 };
    }
}
exports.SendgridAdapter = SendgridAdapter;
//# sourceMappingURL=sendgrid.adapter.js.map