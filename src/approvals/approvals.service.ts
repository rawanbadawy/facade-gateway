import { ForbiddenException, Injectable } from '@nestjs/common';

/**
 * Very simple approval policy:
 * - APPPROVAL_RULES (JSON) env var with array of { provider, action, require: true }
 * - Header 'X-Approve: yes' satisfies approval when required.
 */
type Rule = { provider: string; action: string; require: boolean };

@Injectable()
export class ApprovalsService {
  private rules: Rule[];

  constructor() {
    try {
      this.rules = JSON.parse(process.env.APPROVAL_RULES || '[]') as Rule[];
    } catch {
      this.rules = [];
    }
  }

  check(
    provider: string,
    action: string,
    headers: Record<string, string | undefined>,
  ): void {
    const need = this.rules.find(
      (r) =>
        r.require &&
        r.provider.toLowerCase() === provider.toLowerCase() &&
        r.action.toLowerCase() === action.toLowerCase(),
    );
    if (!need) return;

    const approve = (headers['x-approve'] || (headers['X-Approve'] as any)) as
      | string
      | undefined;
    if (approve?.toLowerCase() === 'yes') return;

    throw new ForbiddenException(
      'Approval required (send header X-Approve: yes)',
    );
  }
}
