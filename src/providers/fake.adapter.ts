import { AdapterCallResult, ProviderAdapter } from './types';

export class FakeAdapter implements ProviderAdapter {
  toProvider(body: any): any {
    return body;
  }

  // MUST be async to satisfy ProviderAdapter
  // eslint-disable-next-line @typescript-eslint/require-await
  async call(action: string, payload: any): Promise<AdapterCallResult> {
    // touch payload so eslint doesn't complain about unused vars
    void payload;

    if (action === 'fail') {
      return { ok: false, error: 'Simulated provider failure' };
    }
    return { ok: true, data: { ok: true, action, provider: 'fake' } };
  }

  fromProvider(data: any): any {
    return data;
  }
}
