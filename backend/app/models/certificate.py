import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String

from app.core.database import Base


class CertificateModel(Base):
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    folio = Column(String(64), unique=True, nullable=False)
    student = Column(String(128), nullable=False)
    course = Column(String(256), nullable=False)
    issued_at = Column(DateTime(timezone=True), nullable=False)
    grade = Column(String(64), nullable=False)
    hash = Column(String(64), nullable=False)
    status = Column(String(32), nullable=False, default="Emitido")
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
