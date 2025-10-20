export declare class SecretsService {
    get(name: string, fallback?: string): string | undefined;
    require(name: string): string;
}
