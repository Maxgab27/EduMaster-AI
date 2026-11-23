import { getBaseUrl, newCorrelationId, request } from './apiClient';
import { appendLocalAudit } from './demoStore';

export interface AuditEventInput {
  action: string;
  detail?: Record<string, unknown>;
  correlationId?: string;
  /** true: el backend ya audita esta acción; en modo API no se duplica. */
  onlyDemo?: boolean;
}

/**
 * Escribe auditoría desde cualquier módulo.
 * Con API configurada usa POST /api/v1/audit/logs; si falla, deja constancia local.
 */
export async function writeAudit(input: AuditEventInput): Promise<string> {
  const correlationId = input.correlationId || newCorrelationId();

  if (input.onlyDemo && getBaseUrl()) {
    return correlationId;
  }

  if (getBaseUrl()) {
    try {
      await request('/api/v1/audit/logs', {
        method: 'POST',
        body: JSON.stringify({
          action: input.action,
          actor: 'demo-user',
          detail: input.detail ?? {},
          correlation_id: correlationId,
        }),
      });
      return correlationId;
    } catch {
      // Fallback controlado: no romper el módulo por un error de auditoría.
    }
  }

  appendLocalAudit({
    action: input.action,
    actor: 'demo-user',
    detail: input.detail ?? {},
    correlation_id: correlationId,
  });
  return correlationId;
}
