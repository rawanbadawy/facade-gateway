import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import axios from 'axios';

export type OAuthConfig = {
  provider: string; // logical name, used as cache key
  tokenUrl: string; // OAuth token endpoint
  clientId: string;
  clientSecret: string;
  scope?: string;
  audience?: string;
  refreshToken?: string; // optional: if present, we try refresh_flow
  grantType?: 'client_credentials' | 'refresh_token';
};

type TokenRecord = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  obtained_at: number; // epoch seconds when cached
};

@Injectable()
export class OAuthService {
  constructor(
    @Inject('REDIS') private readonly redis: Pick<Redis, 'get' | 'set' | 'del'>,
  ) {}

  private key(p: string) {
    return `oauth:${p}`;
  }

  async getToken(cfg: OAuthConfig): Promise<string> {
    // 1) try cache
    const cached = await this.redis.get(this.key(cfg.provider));
    if (cached) {
      const rec = JSON.parse(cached) as TokenRecord;
      const now = Math.floor(Date.now() / 1000);
      const ttl = rec.expires_in ?? 3600;
      // refresh 60s early
      if (now - rec.obtained_at < ttl - 60) {
        return rec.access_token;
      }
    }

    // 2) fetch
    const form = new URLSearchParams();
    if (cfg.grantType === 'refresh_token' && cfg.refreshToken) {
      form.set('grant_type', 'refresh_token');
      form.set('refresh_token', cfg.refreshToken);
      form.set('client_id', cfg.clientId);
      form.set('client_secret', cfg.clientSecret);
    } else {
      form.set('grant_type', 'client_credentials');
      form.set('client_id', cfg.clientId);
      form.set('client_secret', cfg.clientSecret);
      if (cfg.scope) form.set('scope', cfg.scope);
      if (cfg.audience) form.set('audience', cfg.audience);
    }

    const resp = await axios.post(cfg.tokenUrl, form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10_000,
      validateStatus: () => true,
    });

    if (resp.status < 200 || resp.status >= 300) {
      throw new Error(
        `OAuth token error ${resp.status}: ${JSON.stringify(resp.data)}`,
      );
    }

    const data = resp.data as TokenRecord & {
      access_token: string;
      expires_in?: number;
    };
    const record: TokenRecord = {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in ?? 3600,
      scope: data.scope,
      obtained_at: Math.floor(Date.now() / 1000),
    };

    await this.redis.set(this.key(cfg.provider), JSON.stringify(record));
    return record.access_token;
  }

  async clear(provider: string): Promise<void> {
    await this.redis.del(this.key(provider));
  }
}
