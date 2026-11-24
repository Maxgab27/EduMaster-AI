import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import hash_audit_payload
from app.models.audit import AuditLogModel
from app.models.submission import SubmissionModel
from app.schemas.submission import GradeSubmissionPayload, GradeSubmissionResponse

router = APIRouter(prefix="/grades", tags=["Evaluaciones y Rúbricas Docentes"])


@router.post("/submit", response_model=GradeSubmissionResponse)
async def submit_teacher_grade(
    payload: GradeSubmissionPayload,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    SOP 70-75 (Principio de Autoridad Docente):
    El docente oficializa y firma la calificación evaluada en el SpeedGrader.
    Se sella con hash SHA-256 inmutable en audit_logs bajo la Ley 29733.

    Modo DEMO: X-Actor/X-Role son opcionales. Si no viene X-Actor se usa el
    teacher_id del body y se registra actor_source=body_unverified. Esto hace
    visible la limitación; NO es autenticación real.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    now_utc = datetime.now(timezone.utc)

    header_actor = (request.headers.get("x-actor") or "").strip()
    signed_by = header_actor or payload.teacher_id
    actor_source = "header" if header_actor else "body_unverified"

    # 1. Generar hash criptográfico inmutable de la firma
    audit_data = {
        "submission_id": payload.submission_id,
        "official_score": payload.official_score,
        "teacher_id": signed_by,
        "actor_source": actor_source,
        "feedback_length": len(payload.teacher_feedback),
        "rubric_scores": payload.rubric_scores,
        "timestamp": now_utc.isoformat(),
        "ip_address": client_ip,
    }
    signature_hash = hash_audit_payload(audit_data)

    # 2. Registrar en la tabla inmutable audit_logs
    audit_entry = AuditLogModel(
        user_id=signed_by,
        user_role="docente",
        action="OFFICIAL_GRADE_SIGN",
        resource=f"submission:{payload.submission_id}",
        ip_address=client_ip,
        timestamp=now_utc,
        payload_hash=signature_hash,
        details_json=json.dumps(audit_data)
    )
    db.add(audit_entry)

    # 3. Actualizar o registrar la entrega del estudiante
    query = select(SubmissionModel).where(SubmissionModel.id == payload.submission_id)
    result = await db.execute(query)
    submission = result.scalar_one_or_none()

    if submission:
        submission.official_score = payload.official_score
        submission.teacher_feedback = payload.teacher_feedback
        submission.rubric_scores_json = json.dumps(payload.rubric_scores)
        submission.signed_by_teacher_id = signed_by
        submission.signature_hash = signature_hash
        submission.status = "FIRMADO"
        submission.signed_at = now_utc
    else:
        new_sub = SubmissionModel(
            id=payload.submission_id,
            student_id="std-demo",
            student_name="Alumno Evaluado",
            assignment_title="Laboratorio Evaluado",
            course="Modelado Secuencial con GRU & LSTM",
            code_snippet="# Código evaluado",
            official_score=payload.official_score,
            teacher_feedback=payload.teacher_feedback,
            rubric_scores_json=json.dumps(payload.rubric_scores),
            signed_by_teacher_id=signed_by,
            signature_hash=signature_hash,
            status="FIRMADO",
            signed_at=now_utc
        )
        db.add(new_sub)

    await db.commit()

    return GradeSubmissionResponse(
        status="SUCCESS",
        submission_id=payload.submission_id,
        official_score=payload.official_score,
        signature_hash=signature_hash,
        signed_by=signed_by,
        actor_source=actor_source,
        signed_at=now_utc.isoformat(),
        audit_log_id=audit_entry.id,
        message="Calificación oficial firmada y registrada exitosamente en audit_logs bajo la Ley 29733."
    )
