import { Injectable } from '@nestjs/common';

/**
 * Simple env-backed secrets (swappable later).
 * Supports namespacing via prefix (e.g., 'SENDGRID_API_KEY').
 */
@Injectable()
export class SecretsService {
  get(name: string, fallback?: string): string | undefined {
    return process.env[name] ?? fallback;
  }

  require(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing secret: ${name}`);
    return v;
  }
}
