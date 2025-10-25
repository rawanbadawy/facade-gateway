// src/webhooks/webhook.controller.ts
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  @HttpCode(200)
  receive(
    @Param('provider') provider: string,
    @Headers('x-signature') sig: string | undefined,
    @Req() req: any,
  ) {
    // Use exact raw bytes when express.raw() is applied in main.ts
    const raw: Buffer = Buffer.isBuffer(req?.body)
      ? (req.body as Buffer)
      : req?.rawBody instanceof Buffer
        ? (req.rawBody as Buffer)
        : Buffer.from(
            typeof req?.body === 'string'
              ? (req.body as string)
              : JSON.stringify(req?.body ?? {}),
            'utf8',
          );

    const computedHex = this.hmacHex(raw);
    const providedHex = (sig ?? '').trim();
    const computedBuf = Buffer.from(computedHex, 'hex');
    const providedBuf = Buffer.from(providedHex, 'hex');

    if (!providedHex || providedBuf.length !== computedBuf.length) {
      throw new UnauthorizedException('Bad signature');
    }
    if (!timingSafeEqual(providedBuf, computedBuf)) {
      throw new UnauthorizedException('Bad signature');
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(raw.toString('utf8'));
    } catch {
      // non-JSON payloads are fine
    }

    return {
      received: true,
      provider,
      event: parsed?.type ?? 'unknown',
    };
  }
}
