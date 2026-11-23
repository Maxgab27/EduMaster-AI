import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text

from app.core.database import Base


class SubmissionModel(Base):
    __tablename__ = "teacher_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(64), nullable=False)
    student_name = Column(String(128), nullable=False)
    assignment_title = Column(String(256), nullable=False)
    course = Column(String(128), nullable=False)
    code_snippet = Column(Text, nullable=False)
    estimated_ai_score = Column(Float, nullable=False, default=16.5)
    official_score = Column(Float, nullable=True)
    teacher_feedback = Column(Text, nullable=True)
    rubric_scores_json = Column(Text, nullable=True)
    signed_by_teacher_id = Column(String(64), nullable=True)
    signature_hash = Column(String(64), nullable=True)
    status = Column(String(32), default="PENDIENTE", nullable=False)  # PENDIENTE, FIRMADO, PUBLICADO
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    signed_at = Column(DateTime(timezone=True), nullable=True)
