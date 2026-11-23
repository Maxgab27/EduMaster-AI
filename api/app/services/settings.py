"""Configuración institucional persistida con el patrón storage.py (Fase 4)."""

from __future__ import annotations

import os
import threading

from app.schemas import AppSettings, AppSettingsUpdate, utc_now
from app.services.storage import insert as storage_insert
from app.services.storage import seed_memory as storage_seed
from app.services.storage import select as storage_select
from app.services.storage import update as storage_update

_TABLE = "settings"
_DEFAULT_TENANT_ID = os.getenv("TENANT_ID", "org-ute-peru-2026")
_lock = threading.RLock()


def _default_row(tenant_id: str) -> dict[str, object]:
    return {
        "id": tenant_id,
        "tenantId": tenant_id,
        "theme": "monochrome",
        "organization": "Universidad Tecnológica Enterprise",
        "rlsEnabled": False,
        "retentionDays": 730,
        "minorsProtection": True,
        "consentOnFirstLogin": True,
        "arcoPortal": True,
        "updatedAt": utc_now(),
        "updatedBy": "sistema-demo",
    }


def _seed(tenant_id: str) -> None:
    storage_seed(_TABLE, [_default_row(tenant_id)])


def get_settings(tenant_id: str | None = None) -> AppSettings:
    tenant = tenant_id or _DEFAULT_TENANT_ID
    with _lock:
        _seed(tenant)
        rows = storage_select(_TABLE, filters={"tenantId": tenant}, limit=1)
    if rows:
        return AppSettings(**{key: value for key, value in rows[0].items() if key != "id"})
    return AppSettings(**{key: value for key, value in _default_row(tenant).items() if key != "id"})


def update_settings(payload: AppSettingsUpdate, updated_by: str, tenant_id: str | None = None) -> AppSettings:
    tenant = tenant_id or _DEFAULT_TENANT_ID
    row = {
        **payload.model_dump(),
        "id": tenant,
        "tenantId": tenant,
        "updatedAt": utc_now(),
        "updatedBy": updated_by,
    }
    with _lock:
        _seed(tenant)
        stored = storage_update(_TABLE, tenant, row)
        if stored is None:
            stored_rows = storage_insert(_TABLE, [row])
            stored = stored_rows[0] if stored_rows else row
    return AppSettings(**{key: value for key, value in stored.items() if key != "id"})
