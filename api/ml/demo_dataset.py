"""Generador de dataset sintetico DEMO para probar el pipeline MTL.

Los datos son artificiales y estan etiquetados DEMO. Sirven para verificar codigo,
contratos y entrenamiento tecnico; no permiten afirmar validez educativa.
"""

from __future__ import annotations

import json
import math
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Any


MASTERY_LEVELS = ["inicial", "en_desarrollo", "competente", "avanzado"]
RESOURCE_TYPES = ["video", "lectura", "practica", "quiz"]
CATEGORIES = ["MATEMATICA", "LENGUA", "TECNOLOGIA", "CIENCIAS"]


@dataclass(frozen=True)
class StudentRecord:
    student_id: str
    category: str
    active_days_14d: int
    sessions_14d: int
    completion_ratio: float
    assessment_mean: float
    assignment_late_rate: float
    help_requests_14d: int
    event_sequence: tuple[str, ...]
    finalizado: int | None
    dominio: int | None
    riesgo: int | None
    recursos_relevantes: tuple[str, ...]


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _resource_id(index: int) -> str:
    return f"REC-{index:03d}"


def generate_dataset(size: int = 240, seed: int = 42) -> list[StudentRecord]:
    rng = random.Random(seed)
    records: list[StudentRecord] = []

    for i in range(size):
        category = rng.choice(CATEGORIES)
        inclination = rng.uniform(-0.6, 0.6)
        activity = rng.randint(0, 14)
        sessions = max(0, min(20, activity + rng.randint(-2, 4)))
        completion = _clamp(rng.betavariate(1.6 + activity / 8, 2.0 - activity / 18) + inclination * 0.12)
        assessment = _clamp((completion * 0.7 + rng.uniform(-0.18, 0.18) + inclination * 0.15), 0.0, 1.0)
        late = _clamp(rng.betavariate(1.2 + (1 - completion) * 2, 3.5))
        help_requests = max(0, int(round(rng.expovariate(1 / (1.5 + (1 - completion) * 3)))))

        event_sequence: list[str] = []
        for _ in range(rng.randint(4, 12)):
            event_sequence.append(
                rng.choices(
                    [
                        "login",
                        "content_view",
                        "activity_start",
                        "activity_complete",
                        "assessment_submit",
                        "help_request",
                    ],
                    weights=[16, 28, 20, 22, 10, 4],
                )[0]
            )

        completion_logit = -1.8 + activity * 0.22 + completion * 2.6 + assessment * 1.2 - late * 1.4
        finalizado = int(rng.random() < _sigmoid(completion_logit))

        mastery_score = completion * 0.45 + assessment * 0.45 - late * 0.1 + rng.uniform(-0.08, 0.08)
        dominio = min(3, max(0, int(mastery_score * 4.2)))

        risk_logit = -0.7 - activity * 0.14 - completion * 1.8 + late * 2.2 + help_requests * 0.25
        riesgo = int(rng.random() < _sigmoid(risk_logit))

        resources = [f"REC-{j:03d}" for j in range(12)]
        # Regla generativa DEMO: relevance depends on detected weak area and level.
        weak_area = min(RESOURCE_TYPES, key=lambda t: assessment + inclination * (0.2 if t == "video" else -0.1))
        ranked = sorted(
            resources,
            key=lambda rid: (
                -rng.uniform(0.35, 0.85) - (0.6 if int(rid[-3:]) % 4 == RESOURCE_TYPES.index(weak_area) else 0.0)
            ),
        )
        relevant = tuple(ranked[:3])

        records.append(
            StudentRecord(
                student_id=f"EST-{i:04d}",
                category=category,
                active_days_14d=activity,
                sessions_14d=sessions,
                completion_ratio=round(completion, 4),
                assessment_mean=round(assessment, 4),
                assignment_late_rate=round(late, 4),
                help_requests_14d=help_requests,
                event_sequence=tuple(event_sequence),
                finalizado=finalizado,
                dominio=dominio,
                riesgo=riesgo,
                recursos_relevantes=relevant,
            )
        )

    return records


def split_temporal(records: list[StudentRecord]) -> tuple[list[StudentRecord], list[StudentRecord]]:
    """Split temporal DEMO: primeros 70% train, ultimos 30% test."""
    cut = int(len(records) * 0.7)
    return records[:cut], records[cut:]


def load_or_generate(path: str | Path | None, size: int, seed: int) -> list[StudentRecord]:
    if path:
        p = Path(path)
        if p.exists():
            payload = json.loads(p.read_text(encoding="utf-8"))
            return [StudentRecord(**item) for item in payload["records"]]
        raise FileNotFoundError(f"No existe dataset: {p}")
    return generate_dataset(size=size, seed=seed)


def save_dataset(records: list[StudentRecord], path: str | Path) -> None:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "label": "DEMO - dataset sintetico, no usar para conclusiones educativas",
        "rows": len(records),
        "records": [r.__dict__ for r in records],
    }
    p.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def to_feature_dict(record: StudentRecord) -> dict[str, Any]:
    return {
        "active_days_14d": record.active_days_14d,
        "sessions_14d": record.sessions_14d,
        "completion_ratio": record.completion_ratio,
        "assessment_mean": record.assessment_mean,
        "assignment_late_rate": record.assignment_late_rate,
        "help_requests_14d": record.help_requests_14d,
        "category": record.category,
        "event_sequence": list(record.event_sequence),
    }
