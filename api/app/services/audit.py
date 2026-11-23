"""Auditoría central del backend Fase 4.

Mantiene la firma `add_audit(request, action, detail)` de Fases 1-3 y añade
contexto de actor/rol/tenant/estado. Sigue usando storage.py: Supabase REST si
hay credenciales, memoria DEMO en caso contrario.
"""

from __future__ import annotations

import threading
import uuid
from typing import Any

from fastapi import Request

from app.schemas import AuditLog, utc_now
from app.services.storage import insert as storage_insert

_lock = threading.Lock()


def _context(request: Request | None, actor: Any | None) -> dict[str, Any]:
    cached = getattr(getattr(request, "state", None), "actor", None) if request else None
    source = actor or cached
    name = getattr(source, "name", None) or (request.headers.get("X-Actor") if request else None) or "demo-user"
    role = getattr(source, "role", None)
    role_value = getattr(role, "value", role) or (request.headers.get("X-Role") if request else None) or "estudiante"
    tenant = getattr(source, "tenantId", None) or "demo-tenant"
    return {
        "actor": name,
        "actor_id": getattr(source, "id", None) or name,
        "role": str(role_value),
        "tenant_id": tenant,
    }


def add_audit(
    request: Request | None,
    action: str,
    detail: dict[str, Any],
    *,
    actor: Any | None = None,
    status: str = "success",
    correlation_id: str | None = None,
) -> AuditLog:
    context = _context(request, actor)
    correlation = correlation_id or (
        getattr(getattr(request, "state", None), "correlation_id", None) if request else None
    ) or "unknown"

    entry = AuditLog(
        id=f"AUD-{uuid.uuid4().hex[:10]}",
        correlation_id=correlation,
        action=action,
        actor=context["actor"],
        detail=dict(detail),
        timestamp=utc_now(),
        role=context["role"],
        actor_id=context["actor_id"],
        tenant_id=context["tenant_id"],
        method=request.method if request else None,
        path=request.url.path if request else None,
        ip_address=request.client.host if request and request.client else None,
        status=status if status in {"success", "denied"} else "success",
    )
    with _lock:
        stored = storage_insert("audit_logs", [entry.model_dump()])
    return AuditLog(**(stored[0] if stored else entry.model_dump()))


def audit_denied(
    request: Request | None,
    actor: Any,
    permission: str,
    reason: str | None = None,
) -> AuditLog:
    detail: dict[str, Any] = {"permission": permission}
    if reason:
        detail["reason"] = reason
    return add_audit(
        request,
        "auth.access_denied",
        detail,
        actor=actor,
        status="denied",
    )
