// Shared adapter types & interface

export type AdapterCallResult =
  | { ok: true; data: any }
  | { ok: false; error: string; status?: number; data?: any };

// Canonical adapter contract used by the registry/facade
export interface ProviderAdapter {
  toProvider(input: any): any;
  call(action: string, payload: any): Promise<AdapterCallResult>;
  fromProvider(resp: any): any;
}
