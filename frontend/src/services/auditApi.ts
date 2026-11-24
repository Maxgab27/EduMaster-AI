import type { ApiAuditLog } from '../types';
import { requestCoreWithDemo } from './apiClient';
import { readLocalAudit } from './demoStore';

export interface AuditFilters {
  actor?: string;
  action?: string;
  correlationId?: string;
  limit?: number;
}

export function getAuditLogs(filters: AuditFilters = {}, signal?: AbortSignal) {
  return requestCoreWithDemo<ApiAuditLog[]>(
    '/api/v1/compat/audit/logs',
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
      let logs = readLocalAudit();
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.actor) {
        logs = logs.filter(log => log.actor === filters.actor);
      }
      if (filters.correlationId) {
        logs = logs.filter(log => log.correlation_id === filters.correlationId);
      }
      const limit = Math.max(1, Math.min(filters.limit ?? 100, 200));
      return logs.slice(0, limit);
    },
  );
}
