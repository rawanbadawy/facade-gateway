/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/webhooks/webhook.controller.ts
import {
  Controller,
  Post,
  Param,
  Headers,
  Req,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

@Controller('webhooks')
export class WebhookController {
  private hmacHex(raw: Buffer): string {
    const secret = process.env.WEBHOOK_SECRET || '';
    return createHmac('sha256', secret).update(raw).digest('hex');
  }

  @Post(':provider')
  @HttpCode(200) // webhooks should generally return 200 on success
  receive(
    @Param('provider') provider: string,
    @Headers('x-signature') sig: string | undefined,
    @Req() req: any,
  ) {
    // Prefer exact captured bytes if present; otherwise re-encode JSON body
    const raw: Buffer =
      req?.rawBody instanceof Buffer
        ? req.rawBody
        : Buffer.from(JSON.stringify(req?.body ?? {}), 'utf8');

    const computedHex = this.hmacHex(raw);

    // Decode both signatures as raw bytes for constant-time compare
    const providedHex = (sig ?? '').trim();
    const computedBuf = Buffer.from(computedHex, 'hex');
    const providedBuf = Buffer.from(providedHex, 'hex');

    // Reject if missing or length differs (avoids timingSafeEqual throw)
    if (!providedHex || providedBuf.length !== computedBuf.length) {
      throw new UnauthorizedException('Bad signature');
    }

    // Constant-time compare
    if (!timingSafeEqual(providedBuf, computedBuf)) {
      throw new UnauthorizedException('Bad signature');
    }

    // Best-effort parse for a friendlier response
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw.toString('utf8'));
    } catch {
      // non-JSON payloads are fine; leave parsed as {}
    }

    return {
      received: true,
      provider,
      event: parsed?.type ?? 'unknown',
    };
  }
}
