"""Cursos DEMO: catálogo, creación, edición e inscripción persistida."""

from __future__ import annotations

import threading
import uuid
from collections import Counter
from typing import Any

from app.schemas import Course, NewCourse, utc_now
from app.services.storage import insert as storage_insert
from app.services.storage import select as storage_select
from app.services.storage import seed_memory as storage_seed
from app.services.storage import update as storage_update

_COURSES = "courses"
_ENROLLMENTS = "course_enrollments"
_lock = threading.RLock()

_SEED: list[dict[str, Any]] = [
    {
        "id": "crs-1",
        "code": "DL-401",
        "title": "Arquitectura de Redes Neuronales & Transformers",
        "instructor": "Dr. Alejandro Morales",
        "level": "Avanzado",
        "description": "Arquitecturas profundas, atención multi-cabeza y entrenamiento con regularización.",
        "students": 4820,
        "capacity": 6000,
        "completionRate": 84,
        "status": "Publicado",
        "tags": ["PyTorch", "Transformers", "Deep Learning"],
    },
    {
        "id": "crs-2",
        "code": "ML-201",
        "title": "Machine Learning con Baselines Interpretables",
        "instructor": "Dra. Elena Silva",
        "level": "Intermedio",
        "description": "Modelos base interpretables, validación temporal y métricas calibradas.",
        "students": 6150,
        "capacity": 7000,
        "completionRate": 79,
        "status": "Publicado",
        "tags": ["Scikit-Learn", "XGBoost", "LightGBM"],
    },
    {
        "id": "crs-3",
        "code": "OPS-301",
        "title": "MLOps: Despliegue con FastAPI, MLflow y DVC",
        "instructor": "Ing. Carlos Mendoza",
        "level": "Avanzado",
        "description": "Versionado de datos y modelos, despliegue ligero y rollback controlado.",
        "students": 3290,
        "capacity": 5000,
        "completionRate": 91,
        "status": "Publicado",
        "tags": ["MLOps", "FastAPI", "Docker", "DVC"],
    },
    {
        "id": "crs-4",
        "code": "DAT-101",
        "title": "DataOps & Ingesta de Eventos en Tiempo Real",
        "instructor": "Mg. Patricia Ruiz",
        "level": "Básico",
        "description": "Ingesta de eventos, calidad de datos y tuberías reproducibles.",
        "students": 5410,
        "capacity": 6500,
        "completionRate": 88,
        "status": "Publicado",
        "tags": ["PostgreSQL", "Eventos", "Outbox"],
    },
    {
        "id": "crs-5",
        "code": "SEC-501",
        "title": "Privacidad de Datos y Cumplimiento Ley 29733",
        "instructor": "Abg. Roberto Castillo",
        "level": "Intermedio",
        "description": "Disociación de identidad, consentimiento y buenas prácticas de seguridad.",
        "students": 2180,
        "capacity": 3500,
        "completionRate": 95,
        "status": "Publicado",
        "tags": ["Legal Tech", "Ley 29733", "Anonimización"],
    },
]


def _seed() -> None:
    now = utc_now()
    rows = []
    for item in _SEED:
        row = dict(item)
        row.setdefault("createdAt", now)
        rows.append(row)
    storage_seed(_COURSES, rows)


def _enrollments() -> list[dict[str, Any]]:
    return storage_select(_ENROLLMENTS)


def _to_dto(row: dict[str, Any], actor: str, enrollments: list[dict[str, Any]]) -> Course:
    counts = Counter(item.get("courseId") for item in enrollments)
    data = dict(row)
    data["students"] = int(row.get("students", 0)) + counts.get(row.get("id"), 0)
    data["enrolled"] = any(
        item.get("courseId") == row.get("id") and item.get("actor") == actor
        for item in enrollments
    )
    return Course(**data)


def list_courses(actor: str = "demo-user") -> list[Course]:
    with _lock:
        _seed()
        enrollments = _enrollments()
        return [_to_dto(row, actor, enrollments) for row in storage_select(_COURSES)]


def get_course(course_id: str, actor: str = "demo-user") -> Course | None:
    with _lock:
        _seed()
        rows = storage_select(_COURSES, filters={"id": course_id})
        if not rows:
            return None
        return _to_dto(rows[0], actor, _enrollments())


def create_course(payload: NewCourse) -> Course:
    with _lock:
        _seed()
        record = payload.model_dump()
        record.update(
            {
                "id": f"crs-{uuid.uuid4().hex[:10]}",
                "students": 0,
                "completionRate": 0,
                "createdAt": utc_now(),
            }
        )
        stored = storage_insert(_COURSES, [record])
        return Course(**(stored[0] if stored else record))


def update_course(course_id: str, payload: NewCourse, actor: str = "demo-user") -> Course | None:
    with _lock:
        _seed()
        existing = storage_select(_COURSES, filters={"id": course_id})
        if not existing:
            return None
        changes = payload.model_dump()
        storage_update(_COURSES, course_id, changes)
        return get_course(course_id, actor)


def enroll_course(course_id: str, actor: str = "demo-user") -> Course | None:
    with _lock:
        _seed()
        rows = storage_select(_COURSES, filters={"id": course_id})
        if not rows:
            return None
        row = rows[0]
        enrollments = _enrollments()
        already = any(
            item.get("courseId") == course_id and item.get("actor") == actor
            for item in enrollments
        )
        if not already:
            count = sum(1 for item in enrollments if item.get("courseId") == course_id)
            capacity = int(row.get("capacity") or 0)
            if capacity and int(row.get("students", 0)) + count >= capacity:
                return None
            storage_insert(
                _ENROLLMENTS,
                [
                    {
                        "id": f"enr-{uuid.uuid4().hex[:10]}",
                        "courseId": course_id,
                        "actor": actor,
                        "createdAt": utc_now(),
                    }
                ],
            )
        return _to_dto(row, actor, _enrollments())
