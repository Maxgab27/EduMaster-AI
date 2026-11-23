"""Contratos API versionados (/api/v1)."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ApiMeta(BaseModel):
    source: str = "api"
    generatedAt: str
    correlationId: str
    label: str = "DEMO - datos sinteticos, no evidencia pedagogica"


class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: ApiMeta


class MetricCard(BaseModel):
    title: str
    value: str
    change: str
    isPositive: bool
    subtext: str | None = None
    iconName: str


class RegionProgress(BaseModel):
    region: str
    students: int
    change: str
    color: str


class SkillLevels(BaseModel):
    aprender: int
    practicar: int
    aplicar: int
    avanzado: int
    experto: int


class SkillCategory(BaseModel):
    id: str
    name: str
    levels: SkillLevels
    certifiedByDocent: bool


class ActivityEvent(BaseModel):
    id: str
    icon: str
    title: str
    description: str
    timeAgo: str
    user: str
    status: str


class NeuralVisualizerState(BaseModel):
    status: str
    epoch: int
    loss: float
    valMetric: float
    modelVersion: str
    publicationDecision: str | None = None


class DashboardSummary(BaseModel):
    metrics: list[MetricCard]
    regions: list[RegionProgress]
    skills: list[SkillCategory]
    activity: list[ActivityEvent]
    neural: NeuralVisualizerState


class NeuralStatus(BaseModel):
    model_name: str
    model_version: str
    feature_schema_version: str
    status: str
    trained_epochs: int
    last_train_loss: float | None
    last_val_loss: float | None
    temperature: dict[str, float]
    decision_thresholds: dict[str, float]
    lambdas: dict[str, float]
    publication_decision: str
    evaluation_source: str


class AllowedFeatures(BaseModel):
    model_config = ConfigDict(extra="forbid")

    active_days_14d: int = Field(ge=0, le=14)
    sessions_14d: int = Field(ge=0, le=40)
    completion_ratio: float = Field(ge=0, le=1)
    assessment_mean: float = Field(ge=0, le=1)
    assignment_late_rate: float = Field(ge=0, le=1)
    help_requests_14d: int = Field(ge=0, le=50)
    category: str = Field(pattern="^(MATEMATICA|LENGUA|TECNOLOGIA|CIENCIAS)$")
    event_sequence: list[
        Literal[
            "login",
            "content_view",
            "activity_start",
            "activity_complete",
            "assessment_submit",
            "help_request",
        ]
    ] = Field(default_factory=list, max_length=12)
    student_id: str | None = None


class InferenceRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    features: AllowedFeatures
    include_explanation: bool = True


class HeadScores(BaseModel):
    completion_probability: float
    mastery_probabilities: dict[str, float]
    mastery_level: str
    dropout_risk_probability: float
    decision_thresholds: dict[str, float]


class RankedResource(BaseModel):
    resource_id: str
    score: float
    available: bool
    reason: str


class InferenceResult(BaseModel):
    prediction_id: str
    model_name: str
    model_version: str
    feature_schema_version: str
    timestamp: str
    scores: HeadScores
    resource_ranking: list[RankedResource]
    explanation: dict[str, Any] | None
    guardrails: list[str]


class RecommendationItem(BaseModel):
    id: str
    prediction_id: str
    resource_id: str
    prefix: Literal["Repasa", "Completa", "Sigue", "Realiza", "Explora"]
    title: str
    course: str
    difficulty: str
    rationale: str
    confidence: float
    score: float
    available: bool
    status: str = "nueva"


class RecommendationFeedback(BaseModel):
    prediction_id: str
    resource_id: str
    decision: str = Field(pattern="^(aceptada|descartada|completada|util|no_util)$")
    comment: str | None = None


class Notification(BaseModel):
    id: str
    title: str
    message: str
    category: str
    createdAt: str
    read: bool = False
    actor: str = "sistema-demo"


class NotificationRead(BaseModel):
    model_config = ConfigDict(extra="forbid")

    read: bool = True


class NotificationPreferences(BaseModel):
    email: bool = False
    inApp: bool = True
    digest: str = "diario"
    categories: list[str] = Field(default_factory=list)


class FeedbackResult(BaseModel):
    feedback_id: str
    prediction_id: str
    resource_id: str
    decision: str
    recorded_at: str
    note: str


class AuditLog(BaseModel):
    id: str
    correlation_id: str
    action: str
    actor: str
    detail: dict[str, Any]
    timestamp: str


class AuditLogCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    action: str = Field(min_length=3, max_length=120)
    actor: str = Field(default="demo-user", min_length=2, max_length=80)
    detail: dict[str, Any] = Field(default_factory=dict)
    correlation_id: str | None = None


class ProgressPoint(BaseModel):
    label: str
    completion: float
    activeStudents: int
    assessments: int


class AnalyticsProgress(BaseModel):
    label: str
    cohort: str
    series: list[ProgressPoint]


class SkillMasteryAggregate(BaseModel):
    skill: str
    level: float
    certifiedByDocent: bool
    evidenceCount: int


class AnalyticsSkillMastery(BaseModel):
    label: str
    skills: list[SkillMasteryAggregate]


class Certificate(BaseModel):
    id: str
    folio: str
    student: str
    course: str
    issuedAt: str
    grade: str
    hash: str
    status: str
    verificationUrl: str
    qrSvg: str | None = None


class CertificateVerification(BaseModel):
    valid: bool
    folio: str
    student: str
    course: str
    issuedAt: str
    grade: str
    hash: str
    status: str
    verifiedAt: str
    message: str


class CommunityThread(BaseModel):
    id: str
    name: str
    title: str
    description: str
    members: int
    pinned: bool = False
    createdAt: str
    lastActivity: str
    messageCount: int


class CommunityMessage(BaseModel):
    id: str
    threadId: str
    author: str
    role: str
    text: str
    createdAt: str
    likes: int = 0
    moderated: bool = False
    hidden: bool = False


class NewCommunityThread(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=3, max_length=60, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=4, max_length=120)
    description: str = Field(min_length=10, max_length=500)
    author: str = Field(default="usuario-demo", min_length=2, max_length=60)


class NewCommunityMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(min_length=1, max_length=1000)
    author: str = Field(default="usuario-demo", min_length=2, max_length=60)
    role: str = Field(default="estudiante", min_length=2, max_length=40)


class ModerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    action: str = Field(pattern="^(hide|show|flag)$")


class TutorMessage(BaseModel):
    id: str
    conversationId: str
    sender: Literal["user", "tutor"]
    text: str
    createdAt: str
    confidence: float | None = None
    sources: list[str] = Field(default_factory=list)
    guardrail: str | None = None


class TutorRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    conversationId: str | None = None
    message: str = Field(min_length=1, max_length=1200)


class TutorConversation(BaseModel):
    conversationId: str
    messages: list[TutorMessage]


def utc_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
