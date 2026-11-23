"""Certificados DEMO con folio, hash verificable y QR real SVG."""

from __future__ import annotations

import hashlib
import io
import os
import threading
from typing import Any

from app.schemas import Certificate, CertificateVerification, utc_now
from app.services.storage import seed_memory, select

try:
    import segno
except ImportError:  #pragma: no cover
    segno = None

_lock = threading.Lock()
_seed = [
    {
        "id": "cert-1",
        "folio": "EDU-2026-98124",
        "student": "Carlos Mendoza Ramos",
        "course": "Especialista en Redes Neuronales & PyTorch MTL",
        "date": "2026-11-12T00:00:00Z",
        "grade": "19.4 / 20 (Sobresaliente)",
        "status": "Emitido",
    },
    {
        "id": "cert-2",
        "folio": "EDU-2026-98125",
        "student": "Sofia Ramírez Vargas",
        "course": "Ingeniería de Características & DataOps",
        "date": "2026-11-14T00:00:00Z",
        "grade": "19.8 / 20 (Sobresaliente)",
        "status": "Emitido",
    },
    {
        "id": "cert-3",
        "folio": "EDU-2026-98126",
        "student": "Mateo Vargas Quispe",
        "course": "MLOps: Despliegue con FastAPI y MLflow",
        "date": "2026-11-15T00:00:00Z",
        "grade": "18.2 / 20 (Notable)",
        "status": "Emitido",
    },
]
_certificates: dict[str, dict[str, Any]] = {}


def _hash_for(item: dict[str, Any]) -> str:
    payload = f"{item['folio']}|{item['student']}|{item['course']}|{item['date']}|{item['grade']}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:24]


def _verification_url(folio: str) -> str:
    base = os.getenv(
        "PUBLIC_VERIFY_BASE_URL",
        "http://127.0.0.1:8000/api/v1/certificates/verify",
    ).rstrip("/")
    return f"{base}/{folio}"


def _qr_svg(folio: str) -> str | None:
    if segno is None:
        return None
    qr = segno.make(_verification_url(folio), error="m")
    buffer = io.BytesIO()
    qr.save(buffer, kind="svg", scale=4, border=2, dark="#0f172a", light="#ffffff")
    return buffer.getvalue().decode("utf-8")


def _to_dto(item: dict[str, Any]) -> Certificate:
    return Certificate(
        id=item["id"],
        folio=item["folio"],
        student=item["student"],
        course=item["course"],
        issuedAt=item["date"],
        grade=item["grade"],
        hash=item["hash"],
        status=item["status"],
        verificationUrl=item["verificationUrl"],
        qrSvg=item.get("qrSvg"),
    )


def _ensure_seeded() -> None:
    if _certificates:
        return
    with _lock:
        if _certificates:
            return
        memory_rows: list[dict[str, Any]] = []
        for item in _seed:
            record = dict(item)
            record["hash"] = _hash_for(record)
            record["verificationUrl"] = _verification_url(record["folio"])
            record["qrSvg"] = _qr_svg(record["folio"])
            _certificates[record["folio"]] = record
            memory_rows.append(
                {
                    "id": record["id"],
                    "folio": record["folio"],
                    "student": record["student"],
                    "course": record["course"],
                    "issued_at": record["date"],
                    "grade": record["grade"],
                    "hash": record["hash"],
                    "status": record["status"],
                }
            )
        seed_memory("certificates", memory_rows)


def _normalize_row(row: dict[str, Any]) -> dict[str, Any]:
    record = dict(row)
    record["date"] = record.get("issued_at") or record.get("date") or ""
    record["hash"] = record.get("hash") or _hash_for(record)
    record["verificationUrl"] = record.get("verificationUrl") or _verification_url(record["folio"])
    record["qrSvg"] = _qr_svg(record["folio"])
    return record


def list_certificates() -> list[Certificate]:
    _ensure_seeded()
    rows = select("certificates")
    if not rows:
        with _lock:
            rows = list(_certificates.values())
    return [_to_dto(_normalize_row(row)) for row in rows]


def verify_certificate(code: str) -> CertificateVerification:
    _ensure_seeded()
    rows = select("certificates", filters={"folio": code})
    item = _normalize_row(rows[0]) if rows else None
    if item is None:
        with _lock:
            item = _certificates.get(code)
    if not item:
        return CertificateVerification(
            valid=False,
            folio=code,
            student="",
            course="",
            issuedAt="",
            grade="",
            hash="",
            status="No encontrado",
            verifiedAt=utc_now(),
            message="DEMO · folio no encontrado en el registro sintético.",
        )
    expected = _hash_for(item)
    valid = item["hash"] == expected and item["status"] == "Emitido"
    return CertificateVerification(
        valid=valid,
        folio=item["folio"],
        student=item["student"],
        course=item["course"],
        issuedAt=item["date"],
        grade=item["grade"],
        hash=item["hash"],
        status=item["status"],
        verifiedAt=utc_now(),
        message=(
            "DEMO · folio y hash coinciden con el registro sintético."
            if valid
            else "DEMO · integridad del registro no verificada."
        ),
    )
