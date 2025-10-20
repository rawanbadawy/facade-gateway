import { AdapterCallResult, ProviderAdapter } from './types';
export declare class FakeAdapter implements ProviderAdapter {
    toProvider(body: any): any;
    call(action: string, payload: any): Promise<AdapterCallResult>;
    fromProvider(data: any): any;
}
