"""Contrato HTTP real usado por el frontend (envelope { data, meta }).

Estas rutas son el puente entre la UI y el backend activo. No sustituyen a las
6 rutas originales del smoke test: viven bajo /api/v1/compat y devuelven el envelope
que apiClient.ts exige. Los datos siguen siendo sintéticos y se etiquetan como
DEMO; lo que es real es el transporte HTTP, la persistencia SQLite y la firma.
"""

import hmac
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.grades import submit_teacher_grade
from app.core.database import get_db
from app.core.security import hash_audit_payload
from app.models.audit import AuditLogModel
from app.models.certificate import CertificateModel
from app.models.student import StudentMetricModel
from app.models.submission import SubmissionModel
from app.schemas.inference import StudentInferenceInput
from app.schemas.submission import GradeSubmissionPayload
from app.services.pytorch_engine import inference_engine

router = APIRouter(prefix="/compat", tags=["Contrato real del frontend"])


def envelope(data: Any, request: Request) -> Dict[str, Any]:
    return {
        "data": data,
        "meta": {
            "source": "api",
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "correlationId": request.headers.get("x-correlation-id") or str(uuid.uuid4()),
        },
    }


class CompatGradeIn(BaseModel):
    officialScore: float = Field(..., ge=0, le=20)
    feedback: str = Field(..., min_length=5)
    signedBy: str = Field(..., min_length=2)


class CompatFeedbackIn(BaseModel):
    feedback: str = Field(..., min_length=5)
    signedBy: str = Field(default="docente-demo")


class CompatAuditIn(BaseModel):
    action: str
    actor: str
    detail: Dict[str, Any] = Field(default_factory=dict)
    correlation_id: Optional[str] = None


SEED_SUBMISSIONS = [
    {
        "id": "sub-101",
        "student_id": "std-204",
        "student_name": "Sofia Ramírez Vargas",
        "assignment_title": "Implementación de Atención Cruzada Multi-Cabeza",
        "course": "DL-401: Redes Neuronales",
        "code_snippet": "# DEMO · atención cruzada multi-cabeza\nscores = Q @ K.transpose(-2, -1) / (d_k ** 0.5)",
        "estimated_ai_score": 18.5,
        "rubric": {
            "Correctitud Matemática del Escalado (1/√d_k)": 5,
            "Manejo de Tensores y Shapes Multidimensionales": 5,
            "Eficiencia Computacional y Ausencia de Bucles Python": 4.5,
            "Claridad de Código y Tipado PEP 484": 4,
        },
        "feedback": "Excelente estructura tensorial. Considera añadir dropout residual tras la proyección final.",
        "submitted_at": datetime(2026, 11, 22, 0, 15, tzinfo=timezone.utc),
    },
    {
        "id": "sub-102",
        "student_id": "std-205",
        "student_name": "Mateo Vargas Quispe",
        "assignment_title": "Pipeline de Ingesta DVC y Versionado de Dataset",
        "course": "OPS-301: MLOps Enterprise",
        "code_snippet": "# DEMO · dvc.yaml\nstages:\n  prepare:\n    cmd: python src/prepare_data.py --split-temporal",
        "estimated_ai_score": 16.0,
        "rubric": {
            "Definición Declarativa de Etapas dvc.yaml": 4.5,
            "Garantía de Split Temporal sin Fuga de Datos": 4,
            "Manejo de Parquet y Tipos Optimizados": 4,
            "Documentación y Reproducibilidad": 3.5,
        },
        "feedback": "Buen pipeline. Añade los hashes md5 en el lockfile para garantizar reproducibilidad.",
        "submitted_at": datetime(2026, 11, 21, 22, 15, tzinfo=timezone.utc),
    },
    {
        "id": "sub-103",
        "student_id": "std-208",
        "student_name": "Lucía Fernández Morales",
        "assignment_title": "Protocolo de Seudonimización con SHA-256 Salted",
        "course": "SEC-501: Privacidad Ley 29733",
        "code_snippet": "# DEMO · seudonimización HMAC-SHA256\nreturn hmac.new(salt, national_id.encode(), hashlib.sha256).hexdigest()",
        "estimated_ai_score": 19.0,
        "rubric": {
            "Cumplimiento Legal Ley 29733 (No Reversibilidad)": 5,
            "Uso de Criptografía Robusta (HMAC-SHA256)": 5,
            "Gestión Segura del Salt Secreto": 4.5,
            "Pruebas Unitarias de Colisión": 4.5,
        },
        "feedback": "Implementación impecable con apego a los estándares de la Ley 29733.",
        "submitted_at": datetime(2026, 11, 20, 20, 15, tzinfo=timezone.utc),
    },
]

SEED_STUDENTS = [
    {
        "student_id": "risk-1", "name": "Jorge Luis Huamán", "course": "DL-401: Redes Neuronales",
        "score": 0.88, "sessions": 5, "late": 3,
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    {
        "student_id": "risk-2", "name": "Andrea Celeste Torres", "course": "OPS-301: MLOps Enterprise",
        "score": 0.74, "sessions": 8, "late": 2,
        "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
    {
        "student_id": "risk-3", "name": "Renato Castillo Peña", "course": "ML-201: Machine Learning Baselines",
        "score": 0.68, "sessions": 9, "late": 1,
        "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    },
]


SEED_CERTIFICATES = [
    {
        "id": "cert-1",
        "folio": "EDU-2026-98124",
        "student": "Carlos Mendoza Ramos",
        "course": "Especialista en Redes Neuronales & PyTorch MTL",
        "issued_at": datetime(2026, 11, 12, tzinfo=timezone.utc),
        "grade": "19.4 / 20 (Sobresaliente)",
        "status": "Emitido",
    },
    {
        "id": "cert-2",
        "folio": "EDU-2026-98125",
        "student": "Sofia Ramírez Vargas",
        "course": "Ingeniería de Características & DataOps",
        "issued_at": datetime(2026, 11, 14, tzinfo=timezone.utc),
        "grade": "19.8 / 20 (Sobresaliente)",
        "status": "Emitido",
    },
    {
        "id": "cert-3",
        "folio": "EDU-2026-98126",
        "student": "Mateo Vargas Quispe",
        "course": "MLOps: Despliegue con FastAPI y MLflow",
        "issued_at": datetime(2026, 11, 15, tzinfo=timezone.utc),
        "grade": "18.2 / 20 (Notable)",
        "status": "Emitido",
    },
]


def certificate_payload(
    folio: str,
    student: str,
    course: str,
    issued_at: datetime,
    grade: str,
) -> Dict[str, str]:
    """Payload canónico; el mismo que calcula el frontend con Web Crypto."""
    issued = issued_at
    if issued.tzinfo is None:
        issued = issued.replace(tzinfo=timezone.utc)
    return {
        "folio": folio,
        "student": student,
        "course": course,
        "issuedAt": issued.isoformat(),
        "grade": grade,
    }


def certificate_hash(row: CertificateModel) -> str:
    return hash_audit_payload(
        certificate_payload(row.folio, row.student, row.course, row.issued_at, row.grade)
    )


def certificate_to_api(row: CertificateModel) -> Dict[str, Any]:
    issued = row.issued_at
    if issued.tzinfo is None:
        issued = issued.replace(tzinfo=timezone.utc)
    return {
        "id": row.id,
        "folio": row.folio,
        "student": row.student,
        "course": row.course,
        "issuedAt": issued.isoformat(),
        "grade": row.grade,
        "hash": row.hash,
        "status": row.status,
        # Ruta relativa: el frontend la convierte en URL absoluta con su origin.
        "verificationUrl": f"/?verify={quote(row.folio)}",
    }


SEED_AVATARS = {item["student_id"]: item["avatar"] for item in SEED_STUDENTS}


async def ensure_seed(db: AsyncSession) -> None:
    """Siembra datos sintéticos una sola vez para que la UI tenga contenido."""
    existing_submissions = set((await db.execute(select(SubmissionModel.id))).scalars().all())
    for item in SEED_SUBMISSIONS:
        if item["id"] in existing_submissions:
            continue
        db.add(SubmissionModel(
            id=item["id"],
            student_id=item["student_id"],
            student_name=item["student_name"],
            assignment_title=item["assignment_title"],
            course=item["course"],
            code_snippet=item["code_snippet"],
            estimated_ai_score=item["estimated_ai_score"],
            rubric_scores_json=json.dumps(item["rubric"]),
            teacher_feedback=item["feedback"],
            submitted_at=item["submitted_at"],
            status="PENDIENTE",
        ))
    await db.commit()

    existing_students = set((await db.execute(select(StudentMetricModel.student_id))).scalars().all())
    for item in SEED_STUDENTS:
        if item["student_id"] in existing_students:
            continue
        level = "Crítico" if item["score"] >= 0.8 else "Moderado"
        db.add(StudentMetricModel(
            student_id=item["student_id"],
            name=item["name"],
            course=item["course"],
            cohort="2026-II",
            current_score=12.5,
            sessions_14d=item["sessions"],
            late_submissions_30d=item["late"],
            unexcused_absences=1,
            dropout_risk_score=item["score"],
            risk_level=level,
        ))
    await db.commit()

    existing_certificates = set((await db.execute(select(CertificateModel.folio))).scalars().all())
    for item in SEED_CERTIFICATES:
        if item["folio"] in existing_certificates:
            continue
        db.add(CertificateModel(
            id=item["id"],
            folio=item["folio"],
            student=item["student"],
            course=item["course"],
            issued_at=item["issued_at"],
            grade=item["grade"],
            status=item["status"],
            hash=hash_audit_payload(certificate_payload(
                item["folio"], item["student"], item["course"], item["issued_at"], item["grade"]
            )),
        ))
    await db.commit()


def submission_to_api(row: SubmissionModel) -> Dict[str, Any]:
    try:
        rubric = json.loads(row.rubric_scores_json or "{}")
    except (json.JSONDecodeError, TypeError):
        rubric = {}
    if not rubric:
        # Una firma anterior pudo sobreescribir el desglose con un dict vacío.
        rubric = next(
            (item["rubric"] for item in SEED_SUBMISSIONS if item["id"] == row.id),
            {},
        )
    rubric_scores = [
        {"criteria": criteria, "maxPts": 5, "score": float(score)}
        for criteria, score in rubric.items()
    ]
    status = "pending"
    if row.status in ("FIRMADO", "PUBLICADO"):
        status = "graded"
    elif row.status == "REVISION":
        status = "in_review"
    return {
        "id": row.id,
        "studentId": row.student_id,
        "studentName": row.student_name,
        "avatar": None,
        "course": row.course,
        "assignmentTitle": row.assignment_title,
        "submittedAt": row.submitted_at.isoformat() if row.submitted_at else "",
        "estimatedAiScore": row.estimated_ai_score,
        "officialScore": row.official_score,
        "status": status,
        "codeSnippet": row.code_snippet,
        "rubricScores": rubric_scores,
        "feedback": row.teacher_feedback or "",
        "signedBy": row.signed_by_teacher_id,
        "gradedAt": row.signed_at.isoformat() if row.signed_at else None,
        "predictionId": None,
    }


@router.get("/submissions")
async def compat_list_submissions(request: Request, db: AsyncSession = Depends(get_db)):
    await ensure_seed(db)
    rows = (
        await db.execute(
            select(SubmissionModel)
            .where(SubmissionModel.id.like("sub-1%"))
            .order_by(SubmissionModel.submitted_at)
        )
    ).scalars().all()
    return envelope([submission_to_api(row) for row in rows], request)


@router.post("/submissions/{submission_id}/grade")
async def compat_grade_submission(
    submission_id: str,
    body: CompatGradeIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    await ensure_seed(db)
    existing = (
        await db.execute(select(SubmissionModel).where(SubmissionModel.id == submission_id))
    ).scalars().one_or_none()
    if not existing:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    try:
        rubric = json.loads(existing.rubric_scores_json or "{}")
    except (json.JSONDecodeError, TypeError):
        rubric = {}
    if not rubric:
        rubric = next((item["rubric"] for item in SEED_SUBMISSIONS if item["id"] == submission_id), {})
    grade_payload = GradeSubmissionPayload(
        submission_id=submission_id,
        official_score=body.officialScore,
        teacher_feedback=body.feedback,
        teacher_id=body.signedBy,
        rubric_scores=rubric,
    )
    # Reutiliza exactamente la firma SHA-256 y el audit log de la ruta oficial.
    result = await submit_teacher_grade(grade_payload, request, db)
    row = (await db.execute(select(SubmissionModel).where(SubmissionModel.id == submission_id))).scalars().one()
    data = submission_to_api(row)
    data["signatureHash"] = result.signature_hash
    data["auditLogId"] = result.audit_log_id
    data["actorSource"] = result.actor_source
    return envelope(data, request)


@router.post("/submissions/{submission_id}/feedback")
async def compat_feedback(
    submission_id: str,
    body: CompatFeedbackIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    await ensure_seed(db)
    row = (await db.execute(select(SubmissionModel).where(SubmissionModel.id == submission_id))).scalars().one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    row.teacher_feedback = body.feedback
    if row.status == "PENDIENTE":
        row.status = "REVISION"
    await db.commit()
    await db.refresh(row)
    return envelope(submission_to_api(row), request)


@router.get("/students/at-risk")
async def compat_at_risk(request: Request, db: AsyncSession = Depends(get_db)):
    await ensure_seed(db)
    rows = (
        await db.execute(
            select(StudentMetricModel)
            .where(StudentMetricModel.student_id.like("risk-%"))
            .where(StudentMetricModel.dropout_risk_score >= 0.6)
            .order_by(desc(StudentMetricModel.dropout_risk_score))
            .limit(20)
        )
    ).scalars().all()
    result: List[Dict[str, Any]] = []
    for row in rows:
        days = max(0, 14 - row.sessions_14d)
        critical = row.dropout_risk_score >= 0.8
        result.append({
            "id": row.student_id,
            "name": row.name,
            "avatar": SEED_AVATARS.get(row.student_id, ""),
            "course": row.course,
            "riskScore": round(row.dropout_risk_score * 100),
            "daysInactive": days,
            "missingAssignments": row.late_submissions_30d,
            "lastActive": f"Hace {days} días",
            "suggestedAction": (
                "Programar sesión de mentoría síncrona de 15 min." if critical
                else "Enviar recordatorio con enlace a grabación de repaso."
            ),
            "status": "critical" if critical else "warning",
            "interventionSent": False,
        })
    return envelope(result, request)


@router.get("/certificates")
async def compat_list_certificates(request: Request, db: AsyncSession = Depends(get_db)):
    await ensure_seed(db)
    rows = (await db.execute(select(CertificateModel).order_by(CertificateModel.issued_at))).scalars().all()
    return envelope([certificate_to_api(row) for row in rows], request)


@router.get("/certificates/verify/{folio}")
async def compat_verify_certificate(
    folio: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    await ensure_seed(db)
    normalized = folio.strip().upper()
    row = (
        await db.execute(select(CertificateModel).where(CertificateModel.folio == normalized))
    ).scalars().one_or_none()
    if not row:
        return envelope({
            "valid": False,
            "folio": normalized,
            "student": "",
            "course": "",
            "issuedAt": "",
            "grade": "",
            "hash": "",
            "status": "No encontrado",
            "verifiedAt": datetime.now(timezone.utc).isoformat(),
            "message": "DEMO · folio no encontrado en el registro sintético.",
        }, request)

    data = certificate_to_api(row)
    hash_matches = hmac.compare_digest(certificate_hash(row), row.hash)
    valid = row.status == "Emitido" and hash_matches
    data.update({
        "valid": valid,
        "verifiedAt": datetime.now(timezone.utc).isoformat(),
        "message": (
            "DEMO · folio y hash SHA-256 coinciden en la API; no es un certificado oficial."
            if valid
            else "DEMO · el hash no coincide o el folio no está emitido."
        ),
    })
    return envelope(data, request)


@router.post("/inference/dropout-risk")
async def compat_inference(
    payload: StudentInferenceInput,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    prediction = inference_engine.predict_dropout_risk(payload)
    row = (
        await db.execute(select(StudentMetricModel).where(StudentMetricModel.student_id == payload.student_id))
    ).scalars().one_or_none()
    if row:
        row.dropout_risk_score = prediction.probability
        row.risk_level = prediction.risk_level
        row.sessions_14d = payload.sessions_14d
        row.late_submissions_30d = payload.late_submissions_30d
        row.current_score = payload.avg_quiz_score
    else:
        db.add(StudentMetricModel(
            student_id=payload.student_id,
            name=f"Estudiante {payload.student_id}",
            course="DL-401: Redes Neuronales",
            cohort="2026-II",
            current_score=payload.avg_quiz_score,
            sessions_14d=payload.sessions_14d,
            late_submissions_30d=payload.late_submissions_30d,
            unexcused_absences=payload.unexcused_absences,
            dropout_risk_score=prediction.probability,
            risk_level=prediction.risk_level,
        ))
    await db.commit()
    return envelope(prediction.model_dump(), request)


@router.get("/audit/logs")
async def compat_get_audit(
    request: Request,
    actor: Optional[str] = None,
    action: Optional[str] = None,
    correlation_id: Optional[str] = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    query = select(AuditLogModel).order_by(desc(AuditLogModel.timestamp))
    if actor:
        query = query.where(AuditLogModel.user_id == actor)
    if action:
        query = query.where(AuditLogModel.action == action)
    rows = (await db.execute(query.limit(min(max(limit, 1), 200)))).scalars().all()

    entries: List[Dict[str, Any]] = []
    for row in rows:
        try:
            details = json.loads(row.details_json or "{}")
        except (json.JSONDecodeError, TypeError):
            details = {}
        # Los artefactos del smoke test viven en la misma SQLite; se ocultan
        # aquí igual que en /submissions y /students/at-risk. La ruta plana
        # /api/v1/audit/logs sigue devolviendo el historial completo.
        target = str(details.get("submission_id", ""))
        if target.startswith(("sub-smoke-", "std-smoke-", "std-test-")):
            continue
        entries.append({
            "id": row.id,
            "correlation_id": details.get("correlation_id", ""),
            "action": row.action,
            "actor": row.user_id,
            "detail": details,
            "timestamp": row.timestamp.isoformat(),
            "role": row.user_role,
            "actor_id": row.user_id,
            "tenant_id": "demo-local",
            "method": None,
            "path": row.resource,
            "ip_address": row.ip_address,
            "status": "success",
        })
    if correlation_id:
        entries = [entry for entry in entries if entry["correlation_id"] == correlation_id]
    return envelope(entries, request)


@router.post("/audit/logs")
async def compat_write_audit(
    body: CompatAuditIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    details = {**body.detail, "correlation_id": body.correlation_id or ""}
    data = {
        "action": body.action,
        "actor": body.actor,
        "detail": details,
        "timestamp": now.isoformat(),
    }
    entry = AuditLogModel(
        user_id=body.actor,
        user_role=request.headers.get("x-role") or "demo",
        action=body.action,
        resource="frontend-action",
        ip_address=request.client.host if request.client else "127.0.0.1",
        timestamp=now,
        payload_hash=hash_audit_payload(data),
        details_json=json.dumps(details),
    )
    db.add(entry)
    await db.commit()
    return envelope({"id": entry.id, "correlation_id": details["correlation_id"]}, request)
