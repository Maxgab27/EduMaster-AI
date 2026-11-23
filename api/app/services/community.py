"""Comunidad DEMO: hilos, mensajes y moderación con estado en memoria."""

from __future__ import annotations

import threading
import uuid
from typing import Any

from app.schemas import (
    CommunityMessage,
    CommunityThread,
    ModerationRequest,
    NewCommunityMessage,
    NewCommunityThread,
    utc_now,
)

_lock = threading.Lock()
_threads: dict[str, dict[str, Any]] = {}
_messages: dict[str, dict[str, Any]] = {}


def _seed() -> None:
    if _threads:
        return
    now = utc_now()
    seeds = [
        {
            "id": "thr-1",
            "name": "deep-learning-transformers",
            "title": "FlashAttention-2 y costo O(N²)",
            "description": "Discusión sobre implementación de matrices de atención y reducción de complejidad cuadrática.",
            "members": 1420,
            "pinned": True,
        },
        {
            "id": "thr-2",
            "name": "mlops-pipeline-fastapi",
            "title": "Versionado de modelos y rollback",
            "description": "Buenas prácticas con MLflow, contenedores ligeros y promoción controlada en staging.",
            "members": 980,
            "pinned": False,
        },
    ]
    for item in seeds:
        record = dict(item)
        record["createdAt"] = now
        record["lastActivity"] = now
        _threads[record["id"]] = record

    initial = [
        ("thr-1", "Ana Torres", "docente", "¿Alguien ha comparado el consumo real de FlashAttention frente a la atención estándar en secuencias largas?"),
        ("thr-1", "Luis Paredes", "estudiante", "En nuestro experimenting demo bajó cerca de 30% el tiempo de epoch, pero todavía no es evidencia oficial."),
        ("thr-2", "Marta Ruiz", "mle", "Recomiendo separar el registro de experimentos del artefacto final y firmar la versión promovida."),
    ]
    for thread_id, author, role, text in initial:
        _add_message(thread_id, author, role, text)


def _add_message(thread_id: str, author: str, role: str, text: str) -> CommunityMessage:
    message_id = f"msg-{uuid.uuid4().hex[:10]}"
    now = utc_now()
    record = {
        "id": message_id,
        "threadId": thread_id,
        "author": author,
        "role": role,
        "text": text,
        "createdAt": now,
        "likes": 0,
        "moderated": False,
        "hidden": False,
    }
    _messages[message_id] = record
    if thread_id in _threads:
        _threads[thread_id]["lastActivity"] = now
    return CommunityMessage(**record)


def _thread_dto(record: dict[str, Any]) -> CommunityThread:
    count = sum(1 for m in _messages.values() if m["threadId"] == record["id"] and not m["hidden"])
    return CommunityThread(**record, messageCount=count)


def list_threads() -> list[CommunityThread]:
    with _lock:
        _seed()
        return [_thread_dto(item) for item in _threads.values()]


def create_thread(payload: NewCommunityThread) -> CommunityThread:
    with _lock:
        _seed()
        thread_id = f"thr-{uuid.uuid4().hex[:10]}"
        now = utc_now()
        record = {
            "id": thread_id,
            "name": payload.name,
            "title": payload.title,
            "description": payload.description,
            "members": 1,
            "pinned": False,
            "createdAt": now,
            "lastActivity": now,
        }
        _threads[thread_id] = record
        _add_message(thread_id, payload.author, "estudiante", f"Hilo creado: {payload.title}")
        return _thread_dto(record)


def list_messages(thread_id: str) -> list[CommunityMessage]:
    with _lock:
        _seed()
        return [
            CommunityMessage(**m)
            for m in sorted(_messages.values(), key=lambda item: item["createdAt"])
            if m["threadId"] == thread_id and not m["hidden"]
        ]


def post_message(thread_id: str, payload: NewCommunityMessage) -> CommunityMessage | None:
    with _lock:
        _seed()
        if thread_id not in _threads:
            return None
        return _add_message(thread_id, payload.author, payload.role, payload.text)


def moderate_message(message_id: str, payload: ModerationRequest) -> CommunityMessage | None:
    with _lock:
        _seed()
        record = _messages.get(message_id)
        if not record:
            return None
        if payload.action == "hide":
            record["hidden"] = True
            record["moderated"] = True
        elif payload.action == "show":
            record["hidden"] = False
            record["moderated"] = True
        else:
            record["moderated"] = True
        return CommunityMessage(**record)


def like_message(message_id: str) -> CommunityMessage | None:
    with _lock:
        _seed()
        record = _messages.get(message_id)
        if not record:
            return None
        record["likes"] += 1
        return CommunityMessage(**record)
