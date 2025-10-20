import { Injectable } from '@nestjs/common';
import { ProviderAdapter } from './types';
import { EchoAdapter } from './echo.adapter';
import { SendgridAdapter } from './sendgrid.adapter';
import { FakeAdapter } from './fake.adapter';

@Injectable()
export class AdapterRegistry {
  private readonly adapters: Map<string, ProviderAdapter>;

  constructor() {
    this.adapters = new Map<string, ProviderAdapter>([
      ['echo', new EchoAdapter()],
      ['sendgrid', new SendgridAdapter()],
      ['fake', new FakeAdapter()],
    ]);
  }

  get(provider: string): ProviderAdapter {
    const a = this.adapters.get(provider);
    if (!a) throw new Error(`Unknown provider: ${provider}`);
    return a;
  }
}
