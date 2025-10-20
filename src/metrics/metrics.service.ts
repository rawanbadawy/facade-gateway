import { Injectable } from '@nestjs/common';

type CounterMap = Record<string, number>;

@Injectable()
export class MetricsService {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  private counters: CounterMap = Object.create(null);

  inc(name: string, by = 1): void {
    this.counters[name] = (this.counters[name] ?? 0) + by;
  }

  set(name: string, value: number): void {
    this.counters[name] = value;
  }

  get(name: string): number {
    return this.counters[name] ?? 0;
  }

  all(): CounterMap {
    // return a shallow copy to avoid external mutation
    return { ...this.counters };
  }
}
