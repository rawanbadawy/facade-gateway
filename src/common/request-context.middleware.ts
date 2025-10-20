// src/common/request-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type RequestCtx = {
  requestId: string;
  tenantId: string;
  userId: string;
  ip: string;
};

declare module 'http' {
  interface IncomingMessage {
    ctx?: RequestCtx;
    id?: string;
  }
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const requestId = req.id || randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ip =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.headers['cf-connecting-ip'] ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.headers['x-forwarded-for'] ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.ip ||
      'unknown';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const tenantId = (req.headers['x-tenant-id'] as string) || 'public';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (req.headers['x-user-id'] as string) || 'system';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    req.id = requestId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    req.ctx = { requestId, tenantId, userId, ip: String(ip) };
    next();
  }
}
