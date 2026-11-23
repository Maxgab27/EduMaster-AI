import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from jose import jwt

from app.core.config import settings


def hash_audit_payload(payload: Dict[str, Any]) -> str:
    """Calcula un hash inmutable SHA-256 sobre un payload estructurado para cumplimiento Ley 29733."""
    canonical_json = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
