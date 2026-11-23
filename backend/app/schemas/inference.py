from typing import List, Optional
from pydantic import BaseModel, Field


class StudentInferenceInput(BaseModel):
    student_id: str = Field(..., description="ID único del estudiante")
    sessions_14d: int = Field(default=8, ge=0, description="Sesiones activas en los últimos 14 días")
    late_submissions_30d: int = Field(default=0, ge=0, description="Entregas fuera de plazo en 30 días")
    unexcused_absences: int = Field(default=0, ge=0, description="Inasistencias injustificadas")
    avg_quiz_score: float = Field(default=15.0, ge=0.0, le=20.0, description="Promedio de notas en escala vigesimal (0-20)")
    hours_active_weekly: float = Field(default=6.5, ge=0.0, description="Horas de dedicación semanal en plataforma")


class DropoutRiskPrediction(BaseModel):
    student_id: str
    probability: float = Field(..., ge=0.0, le=1.0, description="Probabilidad de abandono estimada")
    risk_level: str = Field(..., description="Clasificación categórica: Bajo, Moderado o Crítico")
    confidence: float = Field(default=0.94, description="Nivel de confianza estadística del modelo")
    calibrated_brier_score: float = Field(default=0.082, description="Brier Score de calibración")
    dominant_factors: List[str] = Field(default_factory=list, description="Factores determinantes que explican la predicción")
    recommended_pedagogical_action: str = Field(..., description="Acción sugerida para el tutor o docente humano")
    evaluated_at: str
