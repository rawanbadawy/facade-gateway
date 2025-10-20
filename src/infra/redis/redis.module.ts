// src/infra/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as IORedis, RedisOptions } from 'ioredis';

export type RedisLike = IORedis;

function buildOptions(urlStr: string, prefix?: string): RedisOptions {
  const u = new URL(urlStr);

  const isTls = u.protocol === 'rediss:';
  const rejectUnauthorized =
    (process.env.REDIS_TLS_REJECT_UNAUTHORIZED ?? 'true').toLowerCase() !==
    'false';

  const opts: RedisOptions = {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    keyPrefix: prefix ? `${prefix}:` : undefined,
    connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? 15000),
  };

  if (isTls) {
    // Explicit TLS options for Redis Cloud / proxies that need SNI
    opts.tls = {
      servername: u.hostname, // SNI
      rejectUnauthorized, // set REDIS_TLS_REJECT_UNAUTHORIZED=false for dev
    };
  }

  return opts;
}

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS',
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService): Promise<RedisLike> => {
        const url = (cfg.get<string>('REDIS_URL') || '').trim();
        if (!url) {
          throw new Error(
            'REDIS_URL is not set. Provide a valid Redis connection URL.',
          );
        }

        const prefix = (cfg.get<string>('REDIS_KEY_PREFIX') || '').trim();
        const options = buildOptions(url, prefix);

        const client = new Redis(url, options);

        client.on('error', (e) => {
          // eslint-disable-next-line no-console
          console.error('[Redis] error:', e?.message || e);
        });

        await client.connect();

        // simple sanity check; will throw if TLS/allowlist fails
        const pong = await client.ping();
        // eslint-disable-next-line no-console
        console.log(
          `[Redis] connected (${url.startsWith('rediss://') ? 'TLS' : 'plain'}), PING=${pong}`,
        );

        return client;
      },
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}
