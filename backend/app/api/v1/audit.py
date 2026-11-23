import json
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.audit import AuditLogModel
from app.schemas.audit import AuditLogEntry

router = APIRouter(prefix="/audit", tags=["Gobernanza y Auditoría Inmutable (Ley 29733)"])


@router.get("/logs", response_model=List[AuditLogEntry])
async def get_audit_logs(
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Retorna los registros inmutables de auditoría sellados con hash SHA-256."""
    query = select(AuditLogModel).order_by(desc(AuditLogModel.timestamp)).limit(limit)
    result = await db.execute(query)
    records = result.scalars().all()

    entries = []
    for r in records:
        details = None
        if r.details_json:
            try:
                details = json.loads(r.details_json)
            except Exception:
                details = None

        entries.append(
            AuditLogEntry(
                id=r.id,
                user_id=r.user_id,
                user_role=r.user_role,
                action=r.action,
                resource=r.resource,
                ip_address=r.ip_address,
                timestamp=r.timestamp.isoformat(),
                payload_hash=r.payload_hash,
                details=details
            )
        )
    return entries
