import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime

from app.core.database import Base


class StudentMetricModel(Base):
    __tablename__ = "student_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(64), unique=True, nullable=False)
    name = Column(String(128), nullable=False)
    course = Column(String(128), nullable=False)
    cohort = Column(String(64), nullable=False, default="2026-II")
    current_score = Column(Float, nullable=False, default=14.0)
    sessions_14d = Column(Integer, nullable=False, default=12)
    late_submissions_30d = Column(Integer, nullable=False, default=0)
    unexcused_absences = Column(Integer, nullable=False, default=0)
    dropout_risk_score = Column(Float, nullable=False, default=0.08)  # 0.0 to 1.0
    risk_level = Column(String(32), nullable=False, default="Bajo")   # Bajo, Moderado, Crítico
    last_evaluated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
