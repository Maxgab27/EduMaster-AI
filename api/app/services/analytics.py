"""Analítica DEMO derivada de eventos y competencias, con soporte Supabase."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.schemas import (
    AnalyticsProgress,
    AnalyticsSkillMastery,
    ProgressPoint,
    SkillMasteryAggregate,
)
from app.services.storage import select

API_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = API_ROOT / "ml" / "config.json"

_cache: dict[str, Any] = {}


def _records() -> list[Any]:
    if "records" in _cache:
        return _cache["records"]
    import sys

    ml_root = str(API_ROOT / "ml")
    if ml_root not in sys.path:
        sys.path.insert(0, ml_root)
    from demo_dataset import generate_dataset  # noqa: E402

    seed = 42
    if CONFIG_PATH.exists():
        seed = int(json.loads(CONFIG_PATH.read_text(encoding="utf-8")).get("seed", 42))
    records = generate_dataset(size=240, seed=seed)
    _cache["records"] = records
    return records


def progress(cohort: str = "todos") -> AnalyticsProgress:
    records = _records()
    if cohort != "todos":
        records = [r for r in records if r.category == cohort]
    events = select("learning_events", limit=500)

    points: list[ProgressPoint] = []
    for week in range(1, 7):
        bucket = records[((week - 1) * len(records) // 6): (week * len(records) // 6)]
        if not bucket:
            continue
        completion = sum(r.completion_ratio for r in bucket) / len(bucket)
        active = sum(1 for r in bucket if r.active_days_14d >= 5)
        assessments = sum(1 for r in bucket if r.assessment_mean >= 0.7)
        extra = sum(1 for e in events if e.get("event_type") == "assessment_submit")
        points.append(
            ProgressPoint(
                label=f"Semana {week}",
                completion=round(completion, 4),
                activeStudents=active + (extra // 6 if extra else 0),
                assessments=assessments,
            )
        )

    return AnalyticsProgress(
        label="DEMO · progreso semanal derivado de eventos sintéticos",
        cohort=cohort,
        series=points,
    )


def skill_mastery() -> AnalyticsSkillMastery:
    records = _records()
    groups: dict[str, list[Any]] = {}
    for record in records:
        groups.setdefault(record.category, []).append(record)

    skills: list[SkillMasteryAggregate] = []
    for skill, items in sorted(groups.items()):
        mean = sum(r.assessment_mean for r in items) / len(items)
        evidence = sum(1 for r in items if r.dominio is not None)
        skills.append(
            SkillMasteryAggregate(
                skill=skill,
                level=round(mean, 4),
                certifiedByDocent=evidence > 0,
                evidenceCount=evidence,
            )
        )
    return AnalyticsSkillMastery(
        label="DEMO · dominio agregado por competencia; no es nota oficial",
        skills=skills,
    )
