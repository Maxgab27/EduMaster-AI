"""Recomendaciones DEMO: ranking del modelo + catálogo pedagógico local."""

from __future__ import annotations

from typing import Any

from app.schemas import AllowedFeatures, RecommendationItem
from app.services.inference import infer

# Catálogo DEMO alineado con los recursos REC-000..REC-011 del dataset sintético.
_CATALOG: list[dict[str, Any]] = [
    {"prefix": "Repasa", "title": "Inteligencia Artificial Avanzada", "course": "Transformers & LLM Architecture v2", "difficulty": "Avanzado"},
    {"prefix": "Completa", "title": "Machine Learning Básico", "course": "Fundamentos de Regresión y Clasificación", "difficulty": "Básico"},
    {"prefix": "Sigue", "title": "Ruta de Ciencia de Datos", "course": "Data Science & Feature Engineering Pipeline", "difficulty": "Intermedio"},
    {"prefix": "Realiza", "title": "Proyecto Final de Python", "course": "FastAPI Microservices & Clean Architecture", "difficulty": "Avanzado"},
    {"prefix": "Explora", "title": "Nuevos Cursos en IA", "course": "Visión Computacional & Diffusion Models", "difficulty": "Intermedio"},
    {"prefix": "Repasa", "title": "Álgebra Lineal aplicada", "course": "Vectores, matrices y atención", "difficulty": "Básico"},
    {"prefix": "Completa", "title": "Taller de evidencias", "course": "Rúbricas y firma docente", "difficulty": "Básico"},
    {"prefix": "Sigue", "title": "MLOps ligero", "course": "FastAPI + Supabase REST en Railway", "difficulty": "Intermedio"},
    {"prefix": "Realiza", "title": "Laboratorio de calibración", "course": "Brier, temperatura y umbrales", "difficulty": "Avanzado"},
    {"prefix": "Explora", "title": "Gobernanza de datos", "course": "Ley 29733 y auditoría", "difficulty": "Intermedio"},
    {"prefix": "Repasa", "title": "Fundamentos de redes", "course": "Perceptrón y retropropagación", "difficulty": "Básico"},
    {"prefix": "Sigue", "title": "Analítica educativa", "course": "Series temporales y dominio", "difficulty": "Intermedio"},
]

_DEMO_FEATURES = AllowedFeatures(
    active_days_14d=6,
    sessions_14d=9,
    completion_ratio=0.58,
    assessment_mean=0.62,
    assignment_late_rate=0.22,
    help_requests_14d=3,
    category="TECNOLOGIA",
    event_sequence=["login", "content_view", "activity_start", "activity_complete", "assessment_submit"],
    student_id="EST-DEMO-0001",
)


def list_recommendations() -> list[RecommendationItem]:
    """Obtiene el ranking del artefacto y lo traduce al catálogo visible.

    No reentrena ni escribe notas oficiales: solo expone candidatos con su motivo.
    """
    result = infer(_DEMO_FEATURES, include_explanation=True)
    items: list[RecommendationItem] = []
    for ranked in result.resource_ranking[:5]:
        index = int(ranked.resource_id.split("-")[-1]) % len(_CATALOG)
        entry = _CATALOG[index]
        confidence = min(0.99, max(0.35, round(ranked.score, 4)))
        items.append(
            RecommendationItem(
                id=f"rec-{ranked.resource_id.lower()}",
                prediction_id=result.prediction_id,
                resource_id=ranked.resource_id,
                prefix=entry["prefix"],
                title=entry["title"],
                course=entry["course"],
                difficulty=entry["difficulty"],
                rationale=(
                    f"{ranked.reason}. Estimación DEMO del artefacto "
                    f"{result.model_version}; no sustituye al docente."
                ),
                confidence=confidence,
                score=ranked.score,
                available=ranked.available,
            )
        )
    return items
