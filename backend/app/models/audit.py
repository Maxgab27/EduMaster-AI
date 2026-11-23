import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=False)
    user_role = Column(String(32), nullable=False)
    action = Column(String(64), nullable=False)
    resource = Column(String(128), nullable=False)
    ip_address = Column(String(45), nullable=False, default="127.0.0.1")
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    payload_hash = Column(String(64), nullable=False)
    details_json = Column(Text, nullable=True)
