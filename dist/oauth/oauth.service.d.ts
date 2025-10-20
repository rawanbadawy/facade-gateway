import type Redis from 'ioredis';
export type OAuthConfig = {
    provider: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    scope?: string;
    audience?: string;
    refreshToken?: string;
    grantType?: 'client_credentials' | 'refresh_token';
};
export declare class OAuthService {
    private readonly redis;
    constructor(redis: Pick<Redis, 'get' | 'set' | 'del'>);
    private key;
    getToken(cfg: OAuthConfig): Promise<string>;
    clear(provider: string): Promise<void>;
}
