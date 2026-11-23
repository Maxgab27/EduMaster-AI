from typing import Optional, Dict, Any
from pydantic import BaseModel


class AuditLogEntry(BaseModel):
    id: str
    user_id: str
    user_role: str
    action: str
    resource: str
    ip_address: str
    timestamp: str
    payload_hash: str
    details: Optional[Dict[str, Any]] = None
