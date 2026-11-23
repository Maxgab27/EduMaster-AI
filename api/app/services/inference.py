"""Servicio de inferencia y reglas de negocio; carga el artefacto una sola vez."""

from __future__ import annotations

import json
import sys
import threading
import uuid
from pathlib import Path
from typing import Any

from app.schemas import AllowedFeatures, InferenceResult, HeadScores, NeuralStatus, RankedResource, utc_now

API_ROOT = Path(__file__).resolve().parents[2]
ML_ROOT = API_ROOT / "ml"
for path in (str(API_ROOT), str(ML_ROOT)):
    if path not in sys.path:
        sys.path.insert(0, path)

from demo_dataset import StudentRecord, generate_dataset  # noqa: E402
from mtl_model import MTLModel  # noqa: E402

MODEL_PATH = ML_ROOT / "artifacts" / "model.json"
REPORT_PATH = ML_ROOT / "artifacts" / "evaluation.json"
CONFIG_PATH = ML_ROOT / "config.json"

_lock = threading.Lock()
_model: MTLModel | None = None


def _load_model() -> MTLModel:
    if MODEL_PATH.exists():
        return MTLModel.load(MODEL_PATH)
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    config["epochs"] = 6
    config["early_stopping_patience"] = 6
    records = generate_dataset(size=60, seed=int(config.get("seed", 42)))
    return MTLModel(config).fit(records)


def get_model() -> MTLModel:
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                _model = _load_model()
    return _model


def to_student_record(features: AllowedFeatures) -> StudentRecord:
    """Convierte features autorizadas; etiquetas ausentes permanecen enmascaradas."""
    return StudentRecord(
        student_id=features.student_id or "DEMO-ANON",
        category=features.category,
        active_days_14d=features.active_days_14d,
        sessions_14d=features.sessions_14d,
        completion_ratio=features.completion_ratio,
        assessment_mean=features.assessment_mean,
        assignment_late_rate=features.assignment_late_rate,
        help_requests_14d=features.help_requests_14d,
        event_sequence=tuple(features.event_sequence),
        finalizado=None,
        dominio=None,
        riesgo=None,
        recursos_relevantes=(),
    )


def apply_business_rules(ranking: list[dict[str, Any]]) -> list[RankedResource]:
    """Reglas DEMO: disponibilidad, score minimo y diversidad maxima por tipo."""
    result: list[RankedResource] = []
    used_types: dict[int, int] = {}
    for item in ranking:
        resource_idx = int(item["resource_id"].split("-")[-1])
        resource_type = resource_idx % 4
        available = resource_idx != 7  # recurso de ejemplo no disponible
        reason_parts: list[str] = []
        if not available:
            reason_parts.append("recurso no disponible en catalogo DEMO")
        if item["score"] < 0:
            reason_parts.append("score por debajo del umbral")
        if used_types.get(resource_type, 0) >= 2:
            reason_parts.append("cupo de diversidad por tipo alcanzado")
        accepted = available and item["score"] >= 0 and used_types.get(resource_type, 0) < 2
        if accepted:
            used_types[resource_type] = used_types.get(resource_type, 0) + 1
        elif len(reason_parts) == 0:
            reason_parts.append("filtrado por regla de negocio")
        result.append(
            RankedResource(
                resource_id=item["resource_id"],
                score=item["score"],
                available=available,
                reason="; ".join(reason_parts) if reason_parts else "candidato prioritizado por modelo y reglas",
            )
        )
    return result


def infer(features: AllowedFeatures, include_explanation: bool = True) -> InferenceResult:
    model = get_model()
    record = to_student_record(features)
    prediction = model.predict(record)
    explanation = model.explain(record) if include_explanation else None
    scores = HeadScores(**prediction)
    return InferenceResult(
        prediction_id=f"PRED-{uuid.uuid4().hex[:12]}",
        model_name=model.config["model_name"],
        model_version=model.config["model_version"],
        feature_schema_version=model.config["feature_schema_version"],
        timestamp=utc_now(),
        scores=scores,
        resource_ranking=apply_business_rules(prediction["resource_ranking"]),
        explanation=explanation,
        guardrails=[
            "Estimacion DEMO, no certeza ni diagnostico.",
            "No es nota oficial; la calificacion requiere revision y firma docente.",
            "La senal de riesgo es para apoyo humano, nunca para sancion.",
            "Explicacion de asociaciones observadas; no implica causalidad.",
        ],
    )


def neural_status() -> NeuralStatus:
    model = get_model()
    report: dict[str, Any] = {}
    if REPORT_PATH.exists():
        report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
    return NeuralStatus(
        model_name=model.config["model_name"],
        model_version=model.config["model_version"],
        feature_schema_version=model.config["feature_schema_version"],
        status="inferencia" if model.trained_epochs > 0 else "detenido",
        trained_epochs=model.trained_epochs,
        last_train_loss=model.train_loss_history[-1] if model.train_loss_history else None,
        last_val_loss=model.val_loss_history[-1] if model.val_loss_history else None,
        temperature=model.temperature,
        decision_thresholds=model.thresholds,
        lambdas=model.config["lambdas"],
        publication_decision=report.get(
            "publication_decision",
            "DEMO: pendiente de comparacion con baselines y aprobacion humana.",
        ),
        evaluation_source=str(report.get("dataset", {}).get("source", "synthetic_demo_v1")),
    )


def model_metrics_summary() -> dict[str, Any]:
    if not REPORT_PATH.exists():
        return {"label": "DEMO - sin informe de evaluacion generado"}
    report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
    return {
        "label": report.get("label"),
        "model": report.get("model"),
        "mtl_test": report.get("mtl_test"),
        "baselines_test": report.get("baselines_test"),
        "publication_decision": report.get("publication_decision"),
    }
