import { ProviderAdapter } from './types';
export declare class AdapterRegistry {
    private readonly adapters;
    constructor();
    get(provider: string): ProviderAdapter;
}
