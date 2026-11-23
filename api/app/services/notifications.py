"""Notificaciones DEMO: eventos en memoria y preferencias persistidas (Fase 4)."""

from __future__ import annotations

import threading

from app.schemas import Notification, NotificationPreferences
from app.services.storage import insert as storage_insert
from app.services.storage import seed_memory as storage_seed
from app.services.storage import select as storage_select
from app.services.storage import update as storage_update

_lock = threading.Lock()
_notifications: dict[str, dict[str, object]] = {}
_PREFS_TABLE = "notification_preferences"


def _seed() -> None:
    if _notifications:
        return
    seeds = [
        {
            "id": "ntf-1",
            "title": "Evaluación completada",
            "message": "Cohorte DEMO registró entregas validadas por rúbrica; no es un dato institucional.",
            "category": "evaluacion",
        },
        {
            "id": "ntf-2",
            "title": "Artefacto actualizado",
            "message": "El inspector cargó evaluation.json; la decisión sigue siendo no publicar.",
            "category": "mlops",
        },
        {
            "id": "ntf-3",
            "title": "Certificado verificado",
            "message": "Se validó un folio sintético con hash y QR generados en entorno DEMO.",
            "category": "certificados",
        },
    ]
    for item in seeds:
        record = dict(item)
        record["createdAt"] = "2026-11-22T00:00:00Z"
        record["read"] = False
        record["actor"] = "sistema-demo"
        _notifications[str(record["id"])] = record


def list_notifications() -> list[Notification]:
    with _lock:
        _seed()
        return [
            Notification(**item)
            for item in sorted(
                _notifications.values(),
                key=lambda value: str(value["createdAt"]),
                reverse=True,
            )
        ]


def mark_read(notification_id: str, read: bool = True) -> Notification | None:
    with _lock:
        _seed()
        record = _notifications.get(notification_id)
        if not record:
            return None
        record["read"] = read
        return Notification(**record)


def _default_preferences_row(actor_id: str) -> dict[str, object]:
    return {
        "id": actor_id,
        "actor": actor_id,
        "email": False,
        "inApp": True,
        "digest": "diario",
        "categories": ["evaluacion", "mlops", "certificados"],
    }


def get_preferences(actor_id: str = "demo-user") -> NotificationPreferences:
    with _lock:
        storage_seed(_PREFS_TABLE, [_default_preferences_row(actor_id)])
        rows = storage_select(_PREFS_TABLE, filters={"actor": actor_id}, limit=1)
    if rows:
        return NotificationPreferences(**{key: value for key, value in rows[0].items() if key != "id"})
    return NotificationPreferences(**{
        key: value for key, value in _default_preferences_row(actor_id).items() if key != "id"
    })


def update_preferences(
    payload: NotificationPreferences,
    actor_id: str = "demo-user",
) -> NotificationPreferences:
    row = {**payload.model_dump(), "id": actor_id, "actor": actor_id}
    with _lock:
        storage_seed(_PREFS_TABLE, [_default_preferences_row(actor_id)])
        stored = storage_update(_PREFS_TABLE, actor_id, row)
        if stored is None:
            stored_rows = storage_insert(_PREFS_TABLE, [row])
            stored = stored_rows[0] if stored_rows else row
    return NotificationPreferences(**{key: value for key, value in stored.items() if key != "id"})
