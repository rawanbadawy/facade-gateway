// src/providers/sendgrid.adapter.ts
import axios, { AxiosError } from 'axios';
import { AdapterCallResult, ProviderAdapter } from './types';

type CanonicalEmail = {
  to: Array<{ email: string; name?: string }>;
  cc?: Array<{ email: string; name?: string }>;
  bcc?: Array<{ email: string; name?: string }>;
  subject: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  replyTo?: { email: string; name?: string };
  attachments?: Array<{
    filename: string;
    content: string; // base64
    type?: string;
    disposition?: 'attachment' | 'inline';
  }>;
};

export class SendgridAdapter implements ProviderAdapter {
  toProvider(input: CanonicalEmail) {
    const from = process.env.SENDGRID_FROM || 'no-reply@example.com';

    const payload: any = {
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
      attachments:
        input.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content, // base64
          type: a.type,
          disposition: a.disposition ?? 'attachment',
        })) ?? undefined,
    };

    // Keep the official SendGrid sandbox flag on the payload as well (harmless if we short-circuit)
    const sgSandbox =
      String(process.env.SENDGRID_SANDBOX || '').toLowerCase() === 'true';
    if (sgSandbox) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      payload.mail_settings = { sandbox_mode: { enable: true } };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return payload;

    function parseFrom(f: string) {
      const m = f.match(/^(.*)<(.+@.+)>$/);
      if (m) {
        return {
          name: m[1].trim().replace(/(^"|"$)/g, ''),
          email: m[2].trim(),
        };
      }
      return { email: f.trim() };
    }

    function buildContent(i: CanonicalEmail) {
      const blocks: Array<{ type: 'text/plain' | 'text/html'; value: string }> =
        [];
      if (i.text) blocks.push({ type: 'text/plain', value: i.text });
      if (i.html) blocks.push({ type: 'text/html', value: i.html });
      if (blocks.length === 0) blocks.push({ type: 'text/plain', value: '' });
      return blocks;
    }
  }

  async call(action: string, payload: unknown): Promise<AdapterCallResult> {
    if (action !== 'send') {
      return { ok: false, error: `Unsupported action: ${action}` };
    }

    // Local SANDBOX: do not call SendGrid at all — always succeed for demos.
    const localSandbox =
      String(process.env.SENDGRID_SANDBOX || '').toLowerCase() === 'true';
    if (localSandbox) {
      return { ok: true, data: { status: 200, sandbox: true } };
    }

    const key = process.env.SENDGRID_API_KEY;
    if (!key) return { ok: false, error: 'Missing SENDGRID_API_KEY' };

    try {
      const res = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        payload,
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          timeout: 10_000,
          validateStatus: () => true,
        },
      );

      if (res.status >= 200 && res.status < 300) {
        // SendGrid typically 202 Accepted
        return { ok: true, data: { status: res.status } };
      }

      return {
        ok: false,
        error: `SendGrid ${res.status}: ${JSON.stringify(res.data)}`,
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const ae = err as AxiosError<unknown>;
        const status = ae.response?.status;
        const data = ae.response?.data;
        return {
          ok: false,
          error: `Axios ${status ?? 'ERR'}: ${JSON.stringify(data ?? ae.message)}`,
        };
      }
      if (err instanceof Error) return { ok: false, error: err.message };
      return { ok: false, error: 'Unknown error' };
    }
  }

  fromProvider(resp: { status?: number; sandbox?: boolean } | undefined) {
    // If we short-circuited locally, sandbox:true is present
    if (resp?.sandbox) return { delivered: true, sandbox: true };
    const status = resp?.status;
    return { delivered: status === 202 || status === 200 };
  }
}
