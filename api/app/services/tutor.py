"""Tutor pedagógico DEMO: respuestas gobernadas y trazables, sin LLM externo."""

from __future__ import annotations

import json
import threading
import uuid
from pathlib import Path
from typing import Any

from app.schemas import TutorConversation, TutorMessage, TutorRequest, utc_now

API_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = API_ROOT / "ml" / "config.json"

_lock = threading.Lock()
_conversations: dict[str, list[dict[str, Any]]] = {}


def _rules() -> dict[str, dict[str, Any]]:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8")) if CONFIG_PATH.exists() else {}
    lambdas = config.get("lambdas", {})
    return {
        "riesgo": {
            "text": (
                "La señal de riesgo de desconexión es una estimación DEMO con fines de apoyo humano. "
                "Según el documento, no debe usarse para sancionar. Conviene revisar "
                "active_days_14d, completion_ratio y assignment_late_rate antes de contactar al estudiante."
            ),
            "confidence": 0.86,
            "sources": ["Documento §9.5", "Guardrails del modelo"],
        },
        "lambda": {
            "text": (
                "La pérdida multitarea se define como λ₁·BCE(finalización) + λ₂·CE(dominio) + "
                f"λ₃·BCE(riesgo) + λ₄·RankingLoss. En el artefacto DEMO: λ={lambdas}. "
                "Los pesos deben justificarse con validación y no copiarse de otro dominio."
            ),
            "confidence": 0.91,
            "sources": ["Documento §9.3", "ml/config.json"],
        },
        "certificado": {
            "text": (
                "La nota oficial no la emite el modelo: el docente revisa la evidencia y firma la calificación. "
                "El certificado usa folio único y hash verificable; el QR apunta al endpoint público de verificación."
            ),
            "confidence": 0.93,
            "sources": ["Documento §4.10", "Política human-in-the-loop"],
        },
        "comunidad": {
            "text": (
                "Los espacios de comunidad deben moderarse por cohorte. Los mensajes quedan registrados y pueden "
                "ocultarse o marcarse; la retroalimentación útil se evalúa, no solo el número de clics."
            ),
            "confidence": 0.84,
            "sources": ["Documento §4.11", "Flujo de recomendaciones"],
        },
        "default": {
            "text": (
                "Puedo ayudarte con finalización, dominio, riesgo, recomendaciones, evaluación y gobernanza. "
                "Esta respuesta es DEMO y se genera con reglas trazables, no con un modelo generativo externo. "
                "Formula tu consulta mencionando uno de esos temas para obtener una respuesta más específica."
            ),
            "confidence": 0.72,
            "sources": ["Base de conocimiento DEMO"],
        },
    }


def _match_rule(text: str) -> dict[str, Any]:
    lowered = text.lower()
    rules = _rules()
    if any(word in lowered for word in ["riesgo", "abandono", "desconexión", "desconexion", "sancion"]):
        return rules["riesgo"]
    if any(word in lowered for word in ["lambda", "pérdida", "perdida", "loss", "peso", "λ"]):
        return rules["lambda"]
    if any(word in lowered for word in ["certificado", "folio", "qr", "nota oficial", "calificación"]):
        return rules["certificado"]
    if any(word in lowered for word in ["comunidad", "foro", "chat", "moderación", "moderacion"]):
        return rules["comunidad"]
    return rules["default"]


def _to_dto(record: dict[str, Any]) -> TutorMessage:
    return TutorMessage(**record)


def get_conversation(conversation_id: str) -> TutorConversation:
    with _lock:
        records = _conversations.get(conversation_id, [])
    return TutorConversation(conversationId=conversation_id, messages=[_to_dto(r) for r in records])


def send_message(payload: TutorRequest) -> TutorConversation:
    conversation_id = payload.conversationId or f"conv-{uuid.uuid4().hex[:10]}"
    now = utc_now()
    user_record = {
        "id": f"tm-{uuid.uuid4().hex[:10]}",
        "conversationId": conversation_id,
        "sender": "user",
        "text": payload.message,
        "createdAt": now,
        "confidence": None,
        "sources": [],
        "guardrail": None,
    }
    rule = _match_rule(payload.message)
    tutor_record = {
        "id": f"tm-{uuid.uuid4().hex[:10]}",
        "conversationId": conversation_id,
        "sender": "tutor",
        "text": rule["text"],
        "createdAt": utc_now(),
        "confidence": rule["confidence"],
        "sources": rule["sources"],
        "guardrail": "DEMO · respuesta reglada, no diagnóstico ni nota oficial; requiere criterio docente.",
    }
    with _lock:
        existing = _conversations.setdefault(conversation_id, [])
        if not existing:
            existing.append(
                {
                    "id": f"tm-{uuid.uuid4().hex[:10]}",
                    "conversationId": conversation_id,
                    "sender": "tutor",
                    "text": (
                        "Hola. Soy el tutor DEMO de EduMaster.ai. Respondo con reglas trazables y señalo "
                        "fuentes, sin inventar datos institucionales."
                    ),
                    "createdAt": utc_now(),
                    "confidence": 0.99,
                    "sources": ["Guardrails DEMO"],
                    "guardrail": "Estimación pedagógica, no sustituye al docente.",
                }
            )
        existing.extend([user_record, tutor_record])
        return TutorConversation(
            conversationId=conversation_id,
            messages=[_to_dto(r) for r in existing],
        )
