import type { ApiAuditLog } from '../types';
import { requestWithDemo } from './apiClient';
import { readLocalAudit } from './demoStore';

export interface AuditFilters {
  actor?: string;
  action?: string;
  correlationId?: string;
  limit?: number;
}

export function getAuditLogs(filters: AuditFilters = {}, signal?: AbortSignal) {
  return requestWithDemo<ApiAuditLog[]>(
    '/api/v1/audit/logs',
    {
      query: {
        actor: filters.actor,
        action: filters.action,
        correlation_id: filters.correlationId,
        limit: filters.limit ?? 100,
      },
      signal,
    },
    () => {
      const logs = readLocalAudit();
      return filters.action ? logs.filter(log => log.action === filters.action) : logs;
    },
  );
}
