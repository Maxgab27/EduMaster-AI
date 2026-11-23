"""API REST DEMO de EduMaster.ai.

Contrato versionado bajo /api/v1, envelopes compatibles con el frontend,
correlation id y auditoria en memoria (solo DEMO; sin autenticacion real).
"""

from __future__ import annotations

import os
import threading
import uuid
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import (
    AnalyticsProgress,
    AnalyticsSkillMastery,
    ApiMeta,
    ApiResponse,
    Assessment,
    AuditLog,
    AuditLogCreate,
    Certificate,
    CertificateVerification,
    CommunityMessage,
    CommunityThread,
    Course,
    DashboardSummary,
    FeedbackResult,
    GradeSubmission,
    InferenceRequest,
    InferenceResult,
    LearningPath,
    ModerationRequest,
    NewCommunityMessage,
    NewCommunityThread,
    NewCourse,
    NewSandboxAttempt,
    NeuralStatus,
    Notification,
    NotificationPreferences,
    NotificationRead,
    PathProgressRequest,
    RecommendationFeedback,
    RecommendationItem,
    SandboxAttempt,
    Submission,
    SubmissionFeedback,
    TutorConversation,
    TutorRequest,
    utc_now,
)
from app.services import (
    analytics,
    assessments,
    certificates,
    community,
    courses,
    learning_paths,
    notifications,
    recommendations,
    sandbox,
    tutor,
)
from app.services.demo_data import dashboard_summary
from app.services.inference import infer, model_metrics_summary, neural_status
from app.services.storage import insert as storage_insert
from app.services.storage import select as storage_select
from app.services.storage import source as storage_source

app = FastAPI(
    title="EduMaster.ai API DEMO",
    version="0.1.0-demo",
    description="Backend DEMO con logica MTL del documento. Sin autenticacion real ni datos de produccion.",
)

allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_audit_lock = threading.Lock()


def correlation_id(request: Request) -> str:
    return getattr(request.state, "correlation_id", "unknown")


def actor(request: Request) -> str:
    """Actor DEMO del header; sin autenticación real (Fase 4)."""
    return request.headers.get("X-Actor", "demo-user")


def envelope(data: Any, request: Request) -> dict[str, Any]:
    return {
        "data": data,
        "meta": ApiMeta(
            source="api",
            generatedAt=utc_now(),
            correlationId=correlation_id(request),
        ).model_dump(),
    }


def add_audit(request: Request, action: str, detail: dict[str, Any]) -> AuditLog:
    entry = AuditLog(
        id=f"AUD-{uuid.uuid4().hex[:10]}",
        correlation_id=correlation_id(request),
        action=action,
        actor=request.headers.get("X-Actor", "demo-user"),
        detail=detail,
        timestamp=utc_now(),
    )
    with _audit_lock:
        stored = storage_insert("audit_logs", [entry.model_dump()])
    return AuditLog(**(stored[0] if stored else entry.model_dump()))


@app.middleware("http")
async def correlation_middleware(request: Request, call_next):
    request.state.correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id(request)
    return response


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "code": "VALIDATION_ERROR",
            "message": "La solicitud no cumple el contrato de features autorizadas.",
            "details": {"errors": exc.errors()},
            "correlation_id": correlation_id(request),
        },
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": "Error interno DEMO.",
            "details": {"type": type(exc).__name__},
            "correlation_id": correlation_id(request),
        },
    )


@app.get("/health")
def health(request: Request):
    return envelope(
        {
            "status": "ok",
            "label": "DEMO",
            "service": "edumaster-api",
            "version": app.version,
            "storage": storage_source(),
        },
        request,
    )


@app.get("/api/v1/dashboard/summary", response_model=ApiResponse[DashboardSummary])
def get_dashboard_summary(request: Request):
    return envelope(dashboard_summary(), request)


@app.get("/api/v1/neural/status", response_model=ApiResponse[NeuralStatus])
def get_neural_status(request: Request):
    return envelope(neural_status(), request)


@app.get("/api/v1/ml/models")
def get_models(request: Request):
    return envelope(model_metrics_summary(), request)


@app.post("/api/v1/neural/inference", response_model=ApiResponse[InferenceResult])
def post_inference(payload: InferenceRequest, request: Request):
    result = infer(payload.features, payload.include_explanation)
    add_audit(
        request,
        "ml.inference",
        {
            "prediction_id": result.prediction_id,
            "model_version": result.model_version,
            "student_id": payload.features.student_id,
        },
    )
    return envelope(result, request)


@app.post("/api/v1/recommendations/feedback", response_model=ApiResponse[FeedbackResult])
def post_recommendation_feedback(payload: RecommendationFeedback, request: Request):
    result = FeedbackResult(
        feedback_id=f"FB-{uuid.uuid4().hex[:10]}",
        prediction_id=payload.prediction_id,
        resource_id=payload.resource_id,
        decision=payload.decision,
        recorded_at=utc_now(),
        note="DEMO · feedback registrado en memoria; no entrena al modelo automaticamente.",
    )
    add_audit(request, "recommendation.feedback", result.model_dump())
    return envelope(result, request)


@app.post("/api/v1/audit/logs", response_model=ApiResponse[AuditLog])
def create_audit_log(payload: AuditLogCreate, request: Request):
    entry = AuditLog(
        id=f"AUD-{uuid.uuid4().hex[:10]}",
        correlation_id=payload.correlation_id or correlation_id(request),
        action=payload.action,
        actor=payload.actor,
        detail=payload.detail,
        timestamp=utc_now(),
    )
    with _audit_lock:
        stored = storage_insert("audit_logs", [entry.model_dump()])
    return envelope(AuditLog(**(stored[0] if stored else entry.model_dump())), request)


@app.get("/api/v1/audit/logs", response_model=ApiResponse[list[AuditLog]])
def get_audit_logs(
    request: Request,
    actor: str | None = None,
    action: str | None = None,
    correlation_id: str | None = None,
    limit: int = 100,
):
    filters = {
        "actor": actor,
        "action": action,
        "correlation_id": correlation_id,
    }
    rows = storage_select("audit_logs", filters=filters, order="timestamp.desc", limit=limit)
    return envelope([AuditLog(**row) for row in rows], request)


@app.get("/api/v1/analytics/progress", response_model=ApiResponse[AnalyticsProgress])
def get_analytics_progress(request: Request, cohort: str = "todos"):
    return envelope(analytics.progress(cohort), request)


@app.get("/api/v1/analytics/skill-mastery", response_model=ApiResponse[AnalyticsSkillMastery])
def get_analytics_skill_mastery(request: Request):
    return envelope(analytics.skill_mastery(), request)


@app.get("/api/v1/certificates", response_model=ApiResponse[list[Certificate]])
def get_certificates(request: Request):
    return envelope(certificates.list_certificates(), request)


@app.get("/api/v1/certificates/verify/{folio}", response_model=ApiResponse[CertificateVerification])
def verify_certificate(folio: str, request: Request):
    result = certificates.verify_certificate(folio)
    add_audit(request, "certificate.verify", {"folio": folio, "valid": result.valid})
    return envelope(result, request)


# --- Fase 2: comunidad -------------------------------------------------------

@app.get("/api/v1/community/threads", response_model=ApiResponse[list[CommunityThread]])
def get_community_threads(request: Request):
    return envelope(community.list_threads(), request)


@app.post("/api/v1/community/threads", response_model=ApiResponse[CommunityThread])
def create_community_thread(payload: NewCommunityThread, request: Request):
    result = community.create_thread(payload)
    add_audit(request, "community.thread.created", {"threadId": result.id, "title": result.title})
    return envelope(result, request)


@app.get("/api/v1/community/threads/{thread_id}/messages", response_model=ApiResponse[list[CommunityMessage]])
def get_community_messages(thread_id: str, request: Request):
    return envelope(community.list_messages(thread_id), request)


@app.post("/api/v1/community/threads/{thread_id}/messages", response_model=ApiResponse[CommunityMessage])
def post_community_message(thread_id: str, payload: NewCommunityMessage, request: Request):
    result = community.post_message(thread_id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Hilo no encontrado")
    add_audit(request, "community.message.posted", {"threadId": thread_id, "messageId": result.id})
    return envelope(result, request)


@app.post("/api/v1/community/messages/{message_id}/moderate", response_model=ApiResponse[CommunityMessage])
def moderate_community_message(message_id: str, payload: ModerationRequest, request: Request):
    result = community.moderate_message(message_id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    add_audit(request, "community.message.moderated", {"messageId": message_id, "action": payload.action})
    return envelope(result, request)


@app.post("/api/v1/community/messages/{message_id}/like", response_model=ApiResponse[CommunityMessage])
def like_community_message(message_id: str, request: Request):
    result = community.like_message(message_id)
    if not result:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    return envelope(result, request)


# --- Fase 2: tutor -----------------------------------------------------------

@app.post("/api/v1/tutor/messages", response_model=ApiResponse[TutorConversation])
def post_tutor_message(payload: TutorRequest, request: Request):
    result = tutor.send_message(payload)
    add_audit(
        request,
        "tutor.message",
        {"conversationId": result.conversationId, "messages": len(result.messages)},
    )
    return envelope(result, request)


@app.get("/api/v1/tutor/conversations/{conversation_id}", response_model=ApiResponse[TutorConversation])
def get_tutor_conversation(conversation_id: str, request: Request):
    return envelope(tutor.get_conversation(conversation_id), request)


# --- Fase 2: recomendaciones y notificaciones -------------------------------

@app.get("/api/v1/recommendations", response_model=ApiResponse[list[RecommendationItem]])
def get_recommendations(request: Request):
    return envelope(recommendations.list_recommendations(), request)


@app.get("/api/v1/notifications", response_model=ApiResponse[list[Notification]])
def get_notifications(request: Request):
    return envelope(notifications.list_notifications(), request)


@app.post("/api/v1/notifications/{notification_id}/read", response_model=ApiResponse[Notification])
def mark_notification_read(notification_id: str, payload: NotificationRead, request: Request):
    result = notifications.mark_read(notification_id, payload.read)
    if not result:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    add_audit(request, "notification.read_changed", {"id": notification_id, "read": payload.read})
    return envelope(result, request)


@app.get("/api/v1/notification-preferences", response_model=ApiResponse[NotificationPreferences])
def get_notification_preferences(request: Request):
    return envelope(notifications.get_preferences(), request)


@app.put("/api/v1/notification-preferences", response_model=ApiResponse[NotificationPreferences])
def put_notification_preferences(payload: NotificationPreferences, request: Request):
    result = notifications.update_preferences(payload)
    add_audit(request, "notification.preferences_updated", result.model_dump())
    return envelope(result, request)


# --- Fase 3: cursos ----------------------------------------------------------

@app.get("/api/v1/courses", response_model=ApiResponse[list[Course]])
def get_courses(request: Request):
    return envelope(courses.list_courses(actor(request)), request)


@app.post("/api/v1/courses", response_model=ApiResponse[Course])
def create_course(payload: NewCourse, request: Request):
    result = courses.create_course(payload)
    add_audit(request, "courses.created", {"id": result.id, "code": result.code, "title": result.title})
    return envelope(result, request)


@app.get("/api/v1/courses/{course_id}", response_model=ApiResponse[Course])
def get_course(course_id: str, request: Request):
    result = courses.get_course(course_id, actor(request))
    if not result:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return envelope(result, request)


@app.put("/api/v1/courses/{course_id}", response_model=ApiResponse[Course])
def update_course(course_id: str, payload: NewCourse, request: Request):
    result = courses.update_course(course_id, payload, actor(request))
    if not result:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    add_audit(request, "courses.updated", {"id": course_id, "code": result.code})
    return envelope(result, request)


@app.post("/api/v1/courses/{course_id}/enroll", response_model=ApiResponse[Course])
def enroll_course(course_id: str, request: Request):
    result = courses.enroll_course(course_id, actor(request))
    if not result:
        if courses.get_course(course_id, actor(request)) is None:
            raise HTTPException(status_code=404, detail="Curso no encontrado")
        raise HTTPException(status_code=409, detail="Cupo completo o inscripción inválida")
    add_audit(request, "courses.enrolled", {"id": course_id, "actor": actor(request)})
    return envelope(result, request)


# --- Fase 3: rutas de aprendizaje --------------------------------------------

@app.get("/api/v1/learning-paths", response_model=ApiResponse[list[LearningPath]])
def get_learning_paths(request: Request):
    return envelope(learning_paths.list_paths(actor(request)), request)


@app.post("/api/v1/learning-paths/{path_id}/progress", response_model=ApiResponse[LearningPath])
def update_path_progress(path_id: str, payload: PathProgressRequest, request: Request):
    result = learning_paths.update_progress(path_id, payload, actor(request))
    if not result:
        raise HTTPException(status_code=404, detail="Ruta o paso no encontrado")
    add_audit(
        request,
        "learning_path.progress_changed",
        {"pathId": path_id, "stepId": payload.stepId, "completed": payload.completed, "source": payload.source},
    )
    return envelope(result, request)


# --- Fase 3: evaluaciones y SpeedGrader --------------------------------------

@app.get("/api/v1/assessments", response_model=ApiResponse[list[Assessment]])
def get_assessments(request: Request):
    return envelope(assessments.list_assessments(), request)


@app.get("/api/v1/submissions", response_model=ApiResponse[list[Submission]])
def get_submissions(request: Request):
    return envelope(assessments.list_submissions(), request)


@app.get("/api/v1/submissions/{submission_id}", response_model=ApiResponse[Submission])
def get_submission(submission_id: str, request: Request):
    result = assessments.get_submission(submission_id)
    if not result:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    return envelope(result, request)


@app.post("/api/v1/submissions/{submission_id}/grade", response_model=ApiResponse[Submission])
def grade_submission(submission_id: str, payload: GradeSubmission, request: Request):
    try:
        result = assessments.grade_submission(submission_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    if not result:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    add_audit(
        request,
        "submissions.graded",
        {
            "id": submission_id,
            "estimatedAiScore": result.estimatedAiScore,
            "officialScore": result.officialScore,
            "signedBy": result.signedBy,
        },
    )
    return envelope(result, request)


@app.post("/api/v1/submissions/{submission_id}/feedback", response_model=ApiResponse[Submission])
def add_submission_feedback(submission_id: str, payload: SubmissionFeedback, request: Request):
    result = assessments.add_feedback(submission_id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    add_audit(
        request,
        "submissions.feedback",
        {"id": submission_id, "signedBy": payload.signedBy, "status": result.status},
    )
    return envelope(result, request)


# --- Fase 3: sandbox sin ejecución remota ------------------------------------

@app.get("/api/v1/sandbox/attempts", response_model=ApiResponse[list[SandboxAttempt]])
def list_sandbox_attempts(request: Request):
    student_id = request.query_params.get("studentId")
    raw_limit = request.query_params.get("limit", "10")
    try:
        limit = max(1, min(int(raw_limit), 50))
    except ValueError:
        raise HTTPException(status_code=422, detail="limit debe ser entero")
    return envelope(sandbox.list_attempts(student_id=student_id, limit=limit), request)


@app.post("/api/v1/sandbox/attempts", response_model=ApiResponse[SandboxAttempt])
def create_sandbox_attempt(payload: NewSandboxAttempt, request: Request):
    result = sandbox.create_attempt(payload)
    add_audit(
        request,
        "sandbox.attempt.created",
        {"id": result.id, "studentId": result.studentId, "status": result.status},
    )
    return envelope(result, request)


@app.get("/api/v1/sandbox/attempts/{attempt_id}", response_model=ApiResponse[SandboxAttempt])
def get_sandbox_attempt(attempt_id: str, request: Request):
    result = sandbox.get_attempt(attempt_id)
    if not result:
        raise HTTPException(status_code=404, detail="Intento no encontrado")
    return envelope(result, request)
