"""Capa de persistencia ligera: Supabase REST con fallback en memoria.

No usa ORM ni clientes pesados. Con SUPABASE_URL + SUPABASE_KEY configurados
las lecturas/escrituras van a Supabase PostgREST; si no, se mantiene un store
en memoria para DEMO. Sirve para Railway Free/1GB.
"""

from __future__ import annotations

import json
import os
import threading
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

_lock = threading.RLock()
_memory: dict[str, list[dict[str, Any]]] = {}


def configured() -> bool:
    return bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_KEY"))


def source() -> str:
    return "supabase" if configured() else "memory-demo"


def _base_url() -> str:
    return os.getenv("SUPABASE_URL", "").rstrip("/")


def _key() -> str:
    return os.getenv("SUPABASE_KEY", "")


def _request(method: str, table: str, params: dict[str, Any] | None = None,
             payload: Any | None = None) -> list[dict[str, Any]]:
    query: dict[str, str] = {}
    for key, value in (params or {}).items():
        if value is None:
            continue
        query[key] = str(value)

    url = f"{_base_url()}/rest/v1/{table}"
    if query:
        url += "?" + urllib.parse.urlencode(query)

    headers = {
        "apikey": _key(),
        "Authorization": f"Bearer {_key()}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=6) as response:
        body = response.read().decode("utf-8")
    if not body:
        return []
    parsed = json.loads(body)
    return parsed if isinstance(parsed, list) else [parsed]


def select(table: str, filters: dict[str, Any] | None = None,
           order: str | None = None, limit: int | None = None) -> list[dict[str, Any]]:
    """SELECT con filtros `column=value` (PostgREST eq implícito)."""
    params: dict[str, Any] = {"select": "*"}
    for key, value in (filters or {}).items():
        params[key] = f"eq.{value}"
    if order:
        params["order"] = order
    if limit:
        params["limit"] = limit

    if configured():
        try:
            return _request("GET", table, params)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            # Fallback controlado para no caer en Railway si Supabase no responde.
            pass

    with _lock:
        rows = list(_memory.get(table, []))
    for key, value in (filters or {}).items():
        if value is None:
            continue
        rows = [row for row in rows if row.get(key) == value]
    if order:
        parts = order.split(".")
        column = parts[0]
        descending = len(parts) > 1 and parts[1] == "desc"
        rows.sort(key=lambda row: str(row.get(column, "")), reverse=descending)
    if limit:
        rows = rows[:limit]
    return rows


def insert(table: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if configured():
        try:
            return _request("POST", table, payload=rows)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            pass
    with _lock:
        destination = _memory.setdefault(table, [])
        stored: list[dict[str, Any]] = []
        for row in rows:
            record = dict(row)
            destination.append(record)
            stored.append(record)
        return stored


def seed_memory(table: str, rows: list[dict[str, Any]]) -> None:
    """ siembra el store en memoria sin duplicar por id."""
    with _lock:
        existing = {row.get("id") for row in _memory.get(table, [])}
        destination = _memory.setdefault(table, [])
        for row in rows:
            if row.get("id") not in existing:
                destination.append(dict(row))
                existing.add(row.get("id"))
