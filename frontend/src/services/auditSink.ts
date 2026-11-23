import { getBaseUrl, getDemoActor, newCorrelationId, request } from './apiClient';
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
 * El actor y el rol se derivan del usuario DEMO activo (X-Actor/X-Role).
 */
export async function writeAudit(input: AuditEventInput): Promise<string> {
  const correlationId = input.correlationId || newCorrelationId();
  const demoActor = getDemoActor();
  const detail = { ...(input.detail ?? {}), role: demoActor.role };

  if (input.onlyDemo && getBaseUrl()) {
    return correlationId;
  }

  if (getBaseUrl()) {
    try {
      await request('/api/v1/audit/logs', {
        method: 'POST',
        body: JSON.stringify({
          action: input.action,
          actor: demoActor.name,
          detail,
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
    actor: demoActor.name,
    role: demoActor.role,
    detail,
    correlation_id: correlationId,
  });
  return correlationId;
}
