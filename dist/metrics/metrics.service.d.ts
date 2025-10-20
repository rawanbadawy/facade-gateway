type CounterMap = Record<string, number>;
export declare class MetricsService {
    private counters;
    inc(name: string, by?: number): void;
    set(name: string, value: number): void;
    get(name: string): number;
    all(): CounterMap;
}
export {};
