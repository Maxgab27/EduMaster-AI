"""Notificaciones DEMO: estado en memoria, sin WebSocket y sin datos institucionales."""

from __future__ import annotations

import threading

from app.schemas import Notification, NotificationPreferences, utc_now

_lock = threading.Lock()
_notifications: dict[str, dict[str, object]] = {}
_preferences = NotificationPreferences()


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
        record["createdAt"] = utc_now()
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


def get_preferences() -> NotificationPreferences:
    with _lock:
        return NotificationPreferences(**_preferences.model_dump())


def update_preferences(payload: NotificationPreferences) -> NotificationPreferences:
    global _preferences
    with _lock:
        _preferences = NotificationPreferences(**payload.model_dump())
        return NotificationPreferences(**_preferences.model_dump())
