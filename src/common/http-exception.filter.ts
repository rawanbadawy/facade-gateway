import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

type StdError =
  | 'UserInput'
  | 'AuthError'
  | 'QuotaExceeded'
  | 'TransientError'
  | 'ServerError';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const res = ctx.getResponse();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = ctx.getRequest();

    let status = 500;
    let type: StdError = 'ServerError';
    let message = 'Unexpected error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const resp = exception.getResponse() as any;

      if (status === 400) type = 'UserInput';
      else if (status === 401) type = 'AuthError';
      else if (status === 403) type = 'AuthError';
      else if (status === 429) type = 'QuotaExceeded';
      else if (status >= 500 && status < 600) type = 'TransientError';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message =
        typeof resp === 'string'
          ? resp
          : resp &&
              typeof resp === 'object' &&
              'message' in resp &&
              typeof (resp as { message?: unknown }).message !== 'undefined'
            ? Array.isArray((resp as { message?: unknown }).message)
              ? ((resp as { message?: unknown }).message as string[]).join('; ')
              : ((resp as { message?: unknown }).message as string)
            : message;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    } else if (typeof exception?.message === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      message = exception.message;
      // Heuristic—treat “TransientError: ...” as 503
      if (/TransientError/i.test(message)) {
        status = 503;
        type = 'TransientError';
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.status(status).json({
      error: { type, message },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      requestId: req.id,
      statusCode: status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      path: req.originalUrl,
    });
  }
}
