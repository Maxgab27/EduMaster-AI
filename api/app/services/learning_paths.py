"""Rutas de aprendizaje DEMO: pasos ordenados y progreso persistido por actor."""

from __future__ import annotations

import threading
import uuid
from typing import Any

from app.schemas import LearningPath, PathProgressRequest, utc_now
from app.services.storage import insert as storage_insert
from app.services.storage import select as storage_select
from app.services.storage import seed_memory as storage_seed
from app.services.storage import update as storage_update

_PATHS = "learning_paths"
_PROGRESS = "path_progress"
_lock = threading.RLock()


def _step(step_id: str, name: str, course_id: str, done: bool, score: str) -> dict[str, Any]:
    return {
        "id": step_id,
        "name": name,
        "courseId": course_id,
        "initialCompleted": done,
        "seedScore": score,
    }


_SEED: list[dict[str, Any]] = [
    {
        "id": "dl-engineer",
        "title": "Especialista en Deep Learning & Redes Neuronales",
        "description": "Dominio de arquitecturas Transformer, GRU, convolucionales y MLOps con PyTorch.",
        "duration": "120 horas",
        "coursesCount": 6,
        "steps": [
            _step("dl-1", "Álgebra Lineal & Optimización Tensorial", "crs-1", True, "98/100"),
            _step("dl-2", "Redes Neuronales Densas & Backpropagation", "crs-1", True, "95/100"),
            _step("dl-3", "Modelado Secuencial con GRU & LSTM", "crs-1", False, ""),
            _step("dl-4", "Transformers & Mecanismos de Auto-Atención", "crs-1", False, ""),
            _step("dl-5", "Arquitecturas Multitarea & Loss Ponderada", "crs-3", False, ""),
            _step("dl-6", "Despliegue con FastAPI & MLflow", "crs-3", False, ""),
        ],
    },
    {
        "id": "data-scientist",
        "title": "Científico de Datos & DataOps Enterprise",
        "description": "Ingesta de eventos, split temporal estricto, feature stores y mitigación de fugas.",
        "duration": "95 horas",
        "coursesCount": 5,
        "steps": [
            _step("ds-1", "Ingeniería de Características en Tiempo Real", "crs-4", True, "92/100"),
            _step("ds-2", "Split Temporal y Validación sin Data Leakage", "crs-4", False, ""),
            _step("ds-3", "Modelos Baselines Interpretables (XGBoost)", "crs-2", False, ""),
            _step("ds-4", "Gobernanza de Datos & Ley 29733", "crs-5", False, ""),
        ],
    },
]


def _seed() -> None:
    storage_seed(_PATHS, _SEED)


def _progress_rows(actor: str) -> list[dict[str, Any]]:
    return storage_select(_PROGRESS, filters={"actor": actor})


def _to_dto(path: dict[str, Any], progress_rows: list[dict[str, Any]]) -> LearningPath:
    by_step = {row.get("stepId"): row for row in progress_rows}
    steps: list[dict[str, Any]] = []
    completed_count = 0

    for item in path.get("steps", []):
        record = by_step.get(item.get("id"))
        done = bool(record.get("completed")) if record else bool(item.get("initialCompleted", False))
        if done:
            completed_count += 1
        steps.append(
            {
                "id": item.get("id"),
                "name": item.get("name"),
                "courseId": item.get("courseId"),
                "status": "completed" if done else "pending",
                "score": item.get("seedScore") or "",
            }
        )

    first_pending = next((index for index, step in enumerate(steps) if step["status"] == "pending"), None)
    for index, step in enumerate(steps):
        if step["status"] != "pending":
            continue
        step["status"] = "current" if index == first_pending else "locked"
        step["score"] = "En progreso" if index == first_pending else "Pendiente"

    total = len(steps)
    progress = round(completed_count / total * 100) if total else 0
    data = {key: value for key, value in path.items() if key != "steps"}
    return LearningPath(**data, steps=steps, progress=progress)


def list_paths(actor: str = "demo-user") -> list[LearningPath]:
    with _lock:
        _seed()
        progress = _progress_rows(actor)
        return [_to_dto(row, progress) for row in storage_select(_PATHS)]


def get_path(path_id: str, actor: str = "demo-user") -> LearningPath | None:
    with _lock:
        _seed()
        rows = storage_select(_PATHS, filters={"id": path_id})
        if not rows:
            return None
        return _to_dto(rows[0], _progress_rows(actor))


def update_progress(
    path_id: str, payload: PathProgressRequest, actor: str = "demo-user"
) -> LearningPath | None:
    with _lock:
        _seed()
        rows = storage_select(_PATHS, filters={"id": path_id})
        if not rows:
            return None
        path = rows[0]
        step_ids = {item.get("id") for item in path.get("steps", [])}
        if payload.stepId not in step_ids:
            return None

        existing = storage_select(
            _PROGRESS,
            filters={"pathId": path_id, "stepId": payload.stepId, "actor": actor},
        )
        changes = {
            "completed": payload.completed,
            "source": payload.source,
            "updatedAt": utc_now(),
        }
        if existing:
            storage_update(_PROGRESS, existing[0]["id"], changes)
        else:
            storage_insert(
                _PROGRESS,
                [
                    {
                        "id": f"prg-{uuid.uuid4().hex[:10]}",
                        "pathId": path_id,
                        "stepId": payload.stepId,
                        "actor": actor,
                        **changes,
                    }
                ],
            )
        return get_path(path_id, actor)
