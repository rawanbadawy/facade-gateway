import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly audit;
    constructor(audit: AuditService);
    recent(limit?: string): Promise<{
        items: import("./audit.service").AuditEntry[];
    }>;
}
