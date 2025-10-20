export type AdapterCallResult = {
    ok: true;
    data: any;
} | {
    ok: false;
    error: string;
    status?: number;
    data?: any;
};
export interface ProviderAdapter {
    toProvider(input: any): any;
    call(action: string, payload: any): Promise<AdapterCallResult>;
    fromProvider(resp: any): any;
}
