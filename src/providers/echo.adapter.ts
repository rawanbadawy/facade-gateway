import { AdapterCallResult, ProviderAdapter } from './types';

export class EchoAdapter implements ProviderAdapter {
  name = 'echo';

  // Type-safe passthrough to avoid "any" warnings
  toProvider<T>(input: T): T {
    return input;
  }

  async call(action: string, payload: unknown): Promise<AdapterCallResult> {
    await new Promise<void>((resolve) => setTimeout(resolve, 80));
    return { ok: true, data: { action, echoed: payload } };
  }

  fromProvider<T>(resp: T): T {
    return resp;
  }
}
