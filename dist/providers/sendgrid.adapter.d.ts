import { AdapterCallResult, ProviderAdapter } from './types';
type CanonicalEmail = {
    to: Array<{
        email: string;
        name?: string;
    }>;
    cc?: Array<{
        email: string;
        name?: string;
    }>;
    bcc?: Array<{
        email: string;
        name?: string;
    }>;
    subject: string;
    text?: string;
    html?: string;
    headers?: Record<string, string>;
    replyTo?: {
        email: string;
        name?: string;
    };
    attachments?: Array<{
        filename: string;
        content: string;
        type?: string;
        disposition?: 'attachment' | 'inline';
    }>;
};
export declare class SendgridAdapter implements ProviderAdapter {
    toProvider(input: CanonicalEmail): any;
    call(action: string, payload: unknown): Promise<AdapterCallResult>;
    fromProvider(resp: {
        status?: number;
        sandbox?: boolean;
    } | undefined): {
        delivered: boolean;
        sandbox: boolean;
    } | {
        delivered: boolean;
        sandbox?: undefined;
    };
}
export {};
