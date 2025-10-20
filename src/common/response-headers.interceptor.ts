import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ResponseHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = ctx.getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const res = ctx.getResponse();

    // propagate per-request id set by RequestContextMiddleware
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req?.id) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      res.setHeader('X-Request-Id', req.id);
    }

    // safer defaults for APIs
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.setHeader('Cache-Control', 'no-store');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // (optional) hook point if you want to observe timings here too
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        // if you want, record server timing:
        const ms = Date.now() - start;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        res.setHeader('Server-Timing', `app;dur=${ms}`);
      }),
    );
  }
}
