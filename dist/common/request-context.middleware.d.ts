import { NestMiddleware } from '@nestjs/common';
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
export declare class RequestContextMiddleware implements NestMiddleware {
    use(req: any, _res: any, next: () => void): void;
}
