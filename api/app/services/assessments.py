"""Evaluaciones y entregas DEMO: nota estimada vs nota oficial firmada por docente."""

from __future__ import annotations

import threading
from typing import Any

from app.schemas import (
    Assessment,
    GradeSubmission,
    Submission,
    SubmissionFeedback,
    utc_now,
)
from app.services.storage import select as storage_select
from app.services.storage import seed_memory as storage_seed
from app.services.storage import update as storage_update

_ASSESSMENTS = "assessments"
_SUBMISSIONS = "submissions"
_lock = threading.RLock()


def _rubric(scores: list[float]) -> list[dict[str, Any]]:
    criteria = [
        "Correctitud técnica y uso de librerías",
        "Trazabilidad y reproducibilidad",
        "Manejo de errores y casos límite",
        "Claridad, documentación y pruebas",
    ]
    return [
        {"criteria": name, "maxPts": 5, "score": score}
        for name, score in zip(criteria, scores)
    ]


_SEED_ASSESSMENTS: list[dict[str, Any]] = [
    {
        "id": "as-1",
        "title": "Examen Práctico: Backpropagation en NumPy",
        "course": "DL-401: Arquitectura de Redes Neuronales",
        "dueDate": "20 Nov 2026",
        "maxScore": 20,
        "weight": "30%",
        "attempts": 142,
        "officialAvg": 17.4,
        "predictiveEst": 16.9,
        "status": "Disponible",
    },
    {
        "id": "as-2",
        "title": "Proyecto Integrador: Feature Store & DVC",
        "course": "OPS-301: MLOps Enterprise",
        "dueDate": "24 Nov 2026",
        "maxScore": 20,
        "weight": "40%",
        "attempts": 89,
        "officialAvg": 18.1,
        "predictiveEst": 17.8,
        "status": "En Calificación",
    },
    {
        "id": "as-3",
        "title": "Cuestionario: Pérdida Multitarea y Regularización",
        "course": "ML-201: Machine Learning con Baselines",
        "dueDate": "15 Nov 2026",
        "maxScore": 20,
        "weight": "15%",
        "attempts": 310,
        "officialAvg": 15.8,
        "predictiveEst": 16.0,
        "status": "Cerrado",
    },
]


_SEED_SUBMISSIONS: list[dict[str, Any]] = [
    {
        "id": "sub-101",
        "studentId": "std-204",
        "studentName": "Sofia Ramírez Vargas",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "course": "DL-401: Redes Neuronales",
        "assignmentTitle": "Implementación de Atención Cruzada Multi-Cabeza",
        "submittedAt": "2026-11-22T02:15:00Z",
        "estimatedAiScore": 18.5,
        "predictionId": "PRED-DEMO-SUB101",
        "status": "pending",
        "codeSnippet": (
            "class CrossAttention(nn.Module):\n"
            "    def forward(self, q, kv, mask=None):\n"
            "        Q = self.q_proj(q).view(B, L, self.n_heads, self.head_dim)\n"
            "        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.head_dim ** 0.5)\n"
            "        attn = torch.softmax(scores, dim=-1)\n"
            "        return self.out_proj(torch.matmul(attn, V))"
        ),
        "rubricScores": _rubric([5, 5, 4.5, 4]),
        "feedback": "Excelente estructura tensorial. Considera dropout residual tras la proyección final.",
    },
    {
        "id": "sub-102",
        "studentId": "std-205",
        "studentName": "Mateo Vargas Quispe",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "course": "OPS-301: MLOps Enterprise",
        "assignmentTitle": "Pipeline de Ingesta DVC y Versionado de Dataset",
        "submittedAt": "2026-11-22T01:10:00Z",
        "estimatedAiScore": 16.0,
        "predictionId": "PRED-DEMO-SUB102",
        "status": "pending",
        "codeSnippet": (
            "stages:\n"
            "  prepare:\n"
            "    cmd: python src/prepare_data.py --split-temporal\n"
            "    deps:\n"
            "      - data/raw_events.csv\n"
            "    outs:\n"
            "      - data/processed/train.parquet\n"
            "      - data/processed/val.parquet"
        ),
        "rubricScores": _rubric([4.5, 4, 4, 3.5]),
        "feedback": "Buen pipeline. Añade hashes en el lockfile para garantizar reproducibilidad.",
    },
    {
        "id": "sub-103",
        "studentId": "std-208",
        "studentName": "Lucía Fernández Morales",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "course": "SEC-501: Privacidad Ley 29733",
        "assignmentTitle": "Protocolo de Seudonimización con HMAC-SHA256",
        "submittedAt": "2026-11-21T23:40:00Z",
        "estimatedAiScore": 19.0,
        "predictionId": "PRED-DEMO-SUB103",
        "status": "pending",
        "codeSnippet": (
            "import hmac\nimport hashlib\n\n"
            "def pseudonymize(national_id: str, salt: bytes) -> str:\n"
            "    return hmac.new(salt, national_id.encode('utf-8'), hashlib.sha256).hexdigest()"
        ),
        "rubricScores": _rubric([5, 5, 4.5, 4.5]),
        "feedback": "Implementación sólida. Documenta la rotación periódica del salt.",
    },
]


def _seed() -> None:
    storage_seed(_ASSESSMENTS, _SEED_ASSESSMENTS)
    storage_seed(_SUBMISSIONS, _SEED_SUBMISSIONS)


def list_assessments() -> list[Assessment]:
    with _lock:
        _seed()
        return [Assessment(**row) for row in storage_select(_ASSESSMENTS)]


def list_submissions() -> list[Submission]:
    with _lock:
        _seed()
        rows = storage_select(_SUBMISSIONS, order="submittedAt.desc")
        return [Submission(**row) for row in rows]


def get_submission(submission_id: str) -> Submission | None:
    with _lock:
        _seed()
        rows = storage_select(_SUBMISSIONS, filters={"id": submission_id})
        return Submission(**rows[0]) if rows else None


def _max_score(row: dict[str, Any]) -> float:
    rubric = row.get("rubricScores") or []
    return float(sum(float(item.get("maxPts", 0)) for item in rubric) or 20)


def grade_submission(submission_id: str, payload: GradeSubmission) -> Submission | None:
    with _lock:
        _seed()
        rows = storage_select(_SUBMISSIONS, filters={"id": submission_id})
        if not rows:
            return None
        row = rows[0]
        maximum = _max_score(row)
        if payload.officialScore > maximum:
            raise ValueError(f"La nota oficial no puede superar {maximum:g} puntos según la rúbrica.")
        storage_update(
            _SUBMISSIONS,
            submission_id,
            {
                "officialScore": payload.officialScore,
                "feedback": payload.feedback,
                "signedBy": payload.signedBy,
                "gradedAt": utc_now(),
                "status": "graded",
            },
        )
        return get_submission(submission_id)


def add_feedback(submission_id: str, payload: SubmissionFeedback) -> Submission | None:
    with _lock:
        _seed()
        rows = storage_select(_SUBMISSIONS, filters={"id": submission_id})
        if not rows:
            return None
        changes: dict[str, Any] = {"feedback": payload.feedback}
        if rows[0].get("status") == "pending":
            changes["status"] = "in_review"
            changes["reviewedBy"] = payload.signedBy
        storage_update(_SUBMISSIONS, submission_id, changes)
        return get_submission(submission_id)
