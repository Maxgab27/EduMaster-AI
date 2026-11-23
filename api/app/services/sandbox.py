"""Sandbox DEMO: análisis estático del código, sin ejecución en el servidor.

Railway Free no ejecuta código de estudiantes. El servicio solo inspecciona
el texto, devuelve hallazgos trazables y persiste el intento.
"""

from __future__ import annotations

import threading
import uuid
from typing import Any

from app.schemas import NewSandboxAttempt, SandboxAttempt, utc_now
from app.services.storage import insert as storage_insert
from app.services.storage import select as storage_select
from app.services.storage import seed_memory as storage_seed

_TABLE = "sandbox_attempts"
_lock = threading.RLock()

_BLOCKED_PATTERNS = ("eval(", "exec(", "__import__", "subprocess", "os.system")
_WARN_PATTERNS = ("open(", "requests.", "socket.", "urllib.request")


def _seed() -> None:
    storage_seed(_TABLE, [])


def _without_comments(code: str) -> str:
    """Elimina comentarios Python sin tocar # dentro de cadenas."""
    lines: list[str] = []
    for line in code.splitlines():
        quote: str | None = None
        cleaned: list[str] = []
        for index, char in enumerate(line):
            if quote:
                cleaned.append(char)
                if char == quote and (index == 0 or line[index - 1] != "\\"):
                    quote = None
            elif char in ("'", '"'):
                quote = char
                cleaned.append(char)
            elif char == "#":
                break
            else:
                cleaned.append(char)
        lines.append("".join(cleaned))
    return "\n".join(lines)


def _analyse(code: str) -> tuple[str, list[str], str]:
    lowered = _without_comments(code).lower()
    findings: list[str] = []

    for pattern in _BLOCKED_PATTERNS:
        if pattern in lowered:
            findings.append(f"Patrón bloqueado por guardrail: {pattern}")

    for pattern in _WARN_PATTERNS:
        if pattern in lowered:
            findings.append(f"Acceso externo no ejecutado: {pattern}")

    if "torch" in lowered:
        findings.append("PyTorch no está disponible en el backend DEMO; solo análisis estático.")
    if "print(" in lowered:
        findings.append("Se detectó print(); la salida mostrada es simulada, no real.")
    if not findings:
        findings.append("Sin hallazgos de riesgo en el análisis estático.")

    blocked = any(item.startswith("Patrón bloqueado") for item in findings)
    status = "bloqueado" if blocked else "simulado"
    output = (
        "SIMULACIÓN LOCAL · no se ejecutó código en el servidor. "
        + " ".join(findings)
    )
    guardrail = (
        "El código no se ejecuta. La nota oficial requiere firma docente; "
        "este intento no modifica calificaciones."
    )
    return output, findings, guardrail


def create_attempt(payload: NewSandboxAttempt) -> SandboxAttempt:
    with _lock:
        _seed()
        output, findings, guardrail = _analyse(payload.code)
        record: dict[str, Any] = {
            "id": f"sa-{uuid.uuid4().hex[:10]}",
            "studentId": payload.studentId,
            "code": payload.code,
            "output": output,
            "status": "bloqueado" if "Patrón bloqueado" in " ".join(findings) else "simulado",
            "findings": findings,
            "guardrail": guardrail,
            "createdAt": utc_now(),
        }
        stored = storage_insert(_TABLE, [record])
        return SandboxAttempt(**(stored[0] if stored else record))


def get_attempt(attempt_id: str) -> SandboxAttempt | None:
    with _lock:
        _seed()
        rows = storage_select(_TABLE, filters={"id": attempt_id})
        return SandboxAttempt(**rows[0]) if rows else None


def list_attempts(student_id: str | None = None, limit: int = 10) -> list[SandboxAttempt]:
    """Devuelve los intentos más recientes, opcionalmente por estudiante."""
    with _lock:
        _seed()
        rows = storage_select(
            _TABLE,
            filters={"studentId": student_id},
            order="createdAt.desc",
            limit=limit,
        )
        return [SandboxAttempt(**row) for row in rows]
