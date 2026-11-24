from typing import Dict, Optional

from pydantic import BaseModel, Field


class GradeSubmissionPayload(BaseModel):
    submission_id: str
    official_score: float = Field(..., ge=0.0, le=20.0, description="Calificación oficial firmada por el docente (0-20)")
    teacher_feedback: str = Field(..., min_length=5, description="Retroalimentación cualitativa redactada o validada por el docente")
    teacher_id: str = Field(default="docente-01", description="Identificador del docente titular")
    rubric_scores: Optional[Dict[str, float]] = Field(default_factory=dict, description="Desglose por criterio de rúbrica")


class GradeSubmissionResponse(BaseModel):
    status: str
    submission_id: str
    official_score: float
    signature_hash: str
    signed_by: str
    actor_source: str = Field(
        default="body_unverified",
        description="Origen del actor: header (X-Actor) o body_unverified (demo)",
    )
    signed_at: str
    audit_log_id: str
    message: str
