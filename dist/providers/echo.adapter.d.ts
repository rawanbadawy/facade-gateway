import { AdapterCallResult, ProviderAdapter } from './types';
export declare class EchoAdapter implements ProviderAdapter {
    name: string;
    toProvider<T>(input: T): T;
    call(action: string, payload: unknown): Promise<AdapterCallResult>;
    fromProvider<T>(resp: T): T;
}
