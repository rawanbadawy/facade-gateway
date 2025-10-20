import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get('recent')
  async recent(@Query('limit') limit?: string) {
    const l = Math.max(1, Math.min(Number(limit ?? 20), 100));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const items = await this.audit.recent(l);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { items };
  }
}
