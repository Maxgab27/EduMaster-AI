import { getCoreBaseUrl, getDemoActor, newCorrelationId, requestCore } from './apiClient';
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
 * Con el núcleo real configurado usa POST /api/v1/compat/audit/logs; si falla, deja constancia local.
 * El actor y el rol se derivan del usuario DEMO activo (X-Actor/X-Role).
 */
export async function writeAudit(input: AuditEventInput): Promise<string> {
  const correlationId = input.correlationId || newCorrelationId();
  const demoActor = getDemoActor();
  const detail = { ...(input.detail ?? {}), role: demoActor.role };

  if (input.onlyDemo && getCoreBaseUrl()) {
    return correlationId;
  }

  if (getCoreBaseUrl()) {
    try {
      await requestCore('/api/v1/compat/audit/logs', {
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
