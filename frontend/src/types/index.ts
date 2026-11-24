// Types for EduMaster.ai Enterprise Platform

export type ThemeMode = 'monochrome' | 'cyber' | 'light';

export type NavTab = 
  | 'dashboard'
  | 'learning-paths'
  | 'courses'
  | 'analytics'
  | 'ai-tutor'
  | 'assessments'
  | 'certificates'
  | 'community'
  | 'settings'
  | 'neural-inspector'
  | 'governance';

export type UserRole = 
  | 'superadmin'
  | 'admin'
  | 'coordinador'
  | 'docente'
  | 'estudiante'
  | 'analista'
  | 'mle'
  | 'auditor';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  role: UserRole;
  avatar: string;
  organization: string;
  onlineCount: number;
}

export interface MetricCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext?: string;
  iconName: string;
}

export type NeuralStatus = 
  | 'detenido'
  | 'cargando'
  | 'entrenando'
  | 'validando'
  | 'publicado'
  | 'inferencia'
  | 'error';

export interface NeuralNode {
  id: string;
  name: string;
  layer: 'input' | 'embedding' | 'analysis' | 'output';
  value: number;
  activation: string;
  shape: string;
  description: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  levels: {
    aprender: number;
    practicar: number;
    aplicar: number;
    avanzado: number;
    experto: number;
  };
  certifiedByDocent: boolean;
}

export interface Recommendation {
  id: string;
  prefix: 'Repasa' | 'Completa' | 'Sigue' | 'Realiza' | 'Explora';
  title: string;
  course: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  rationale: string;
  confidence: number;
  status: 'nueva' | 'aceptada' | 'descartada';
}

export interface ActivityEvent {
  id: string;
  icon: 'check' | 'award' | 'play' | 'book' | 'target';
  title: string;
  description: string;
  timeAgo: string;
  user: string;
  status: 'success' | 'info' | 'warning';
}

export interface RegionProgress {
  region: string;
  students: number;
  change: string;
  color: string;
}

export interface StudentTask {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  urgency: 'urgent' | 'upcoming' | 'completed';
  weight: string;
  points: number;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
}

export interface PendingSubmission {
  id: string;
  studentId: string;
  studentName: string;
  avatar: string;
  course: string;
  assignmentTitle: string;
  submittedAt: string;
  estimatedAiScore: number;
  officialScore?: number;
  status: 'pending' | 'graded';
  codeSnippet: string;
  rubricScores: {
    criteria: string;
    maxPts: number;
    score: number;
  }[];
  feedback: string;
}

export interface AtRiskStudent {
  id: string;
  name: string;
  avatar: string;
  course: string;
  riskScore: number; // 0-100%
  daysInactive: number;
  missingAssignments: number;
  lastActive: string;
  suggestedAction: string;
  status: 'critical' | 'warning' | 'normal';
  interventionSent?: boolean;
}

// --- Fase 3: contratos de cursos, rutas, evaluaciones y sandbox -------------

export type CourseLevel = 'Básico' | 'Intermedio' | 'Avanzado';

export interface ApiCourse {
  id: string;
  code: string;
  title: string;
  instructor: string;
  level: CourseLevel;
  description: string;
  students: number;
  capacity: number;
  completionRate: number;
  status: 'Publicado' | 'Borrador';
  tags: string[];
  createdAt: string;
  enrolled: boolean;
}

export interface NewCourseInput {
  code: string;
  title: string;
  instructor: string;
  level: CourseLevel;
  description: string;
  capacity: number;
  status: 'Publicado' | 'Borrador';
  tags: string[];
}

export interface ApiPathStep {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'locked';
  score: string;
  courseId: string | null;
}

export interface ApiLearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  coursesCount: number;
  progress: number;
  steps: ApiPathStep[];
}

export interface PathProgressInput {
  stepId: string;
  completed: boolean;
  source: 'manual' | 'recommendation';
}

export interface ApiAssessment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  maxScore: number;
  weight: string;
  attempts: number;
  officialAvg: number | null;
  predictiveEst: number | null;
  status: 'Disponible' | 'En Calificación' | 'Cerrado';
  note: string;
}

export interface ApiRubricScore {
  criteria: string;
  maxPts: number;
  score: number;
}

export interface ApiSubmission {
  id: string;
  studentId: string;
  studentName: string;
  avatar: string | null;
  course: string;
  assignmentTitle: string;
  submittedAt: string;
  estimatedAiScore: number;
  officialScore: number | null;
  status: 'pending' | 'in_review' | 'graded';
  codeSnippet: string;
  rubricScores: ApiRubricScore[];
  feedback: string;
  signedBy: string | null;
  gradedAt: string | null;
  predictionId: string | null;
  /** Campos devueltos por la firma real del backend (ausentes en modo DEMO). */
  signatureHash?: string;
  auditLogId?: string;
  actorSource?: 'header' | 'body_unverified';
}

export interface GradeSubmissionInput {
  officialScore: number;
  feedback: string;
  signedBy: string;
}

export interface SubmissionFeedbackInput {
  feedback: string;
  signedBy: string;
}

export interface SandboxAttempt {
  id: string;
  studentId: string;
  code: string;
  output: string;
  status: 'simulado' | 'bloqueado';
  findings: string[];
  guardrail: string;
  createdAt: string;
}

export interface NewSandboxAttemptInput {
  code: string;
  studentId: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  ipAddress: string;
  status: 'success' | 'flagged' | 'denied';
  correlationId: string;
}

export interface ArcoRequest {
  id: string;
  folio: string;
  applicant: string;
  type: 'Acceso' | 'Rectificación' | 'Cancelación' | 'Oposición';
  status: 'En Proceso' | 'Atendida' | 'Observada';
  submittedDate: string;
  deadline: string;
  legalRepresentative: string;
}

// --- API contracts (contract-first; demo adapter lives in services/) ---

export interface ApiMeta {
  source: 'demo' | 'api';
  generatedAt: string;
  correlationId: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface DashboardSummary {
  metrics: MetricCardData[];
  regions: RegionProgress[];
  skills: SkillCategory[];
  activity: ActivityEvent[];
  neural: {
    status: NeuralStatus;
    epoch: number;
    loss: number;
    valMetric: number;
    modelVersion: string;
    publicationDecision?: string;
  };
}

// --- Fase 1: contratos de solo lectura ---

export interface ProgressPoint {
  label: string;
  completion: number;
  activeStudents: number;
  assessments: number;
}

export interface AnalyticsProgress {
  label: string;
  cohort: string;
  series: ProgressPoint[];
}

export interface SkillMasteryAggregate {
  skill: string;
  level: number;
  certifiedByDocent: boolean;
  evidenceCount: number;
}

export interface AnalyticsSkillMastery {
  label: string;
  skills: SkillMasteryAggregate[];
}

export interface CertificateRecord {
  id: string;
  folio: string;
  student: string;
  course: string;
  issuedAt: string;
  grade: string;
  hash: string;
  status: string;
  verificationUrl: string;
  /** QR real en data URL PNG; se genera desde la URL de verificación. */
  qrDataUrl?: string | null;
  /** Campo heredado del antiguo QR ilustrativo DEMO. */
  qrSvg?: string | null;
}

export interface CertificateVerification {
  valid: boolean;
  folio: string;
  student: string;
  course: string;
  issuedAt: string;
  grade: string;
  hash: string;
  status: string;
  verifiedAt: string;
  message: string;
}

export interface ApiAuditLog {
  id: string;
  correlation_id: string;
  action: string;
  actor: string;
  detail: Record<string, unknown>;
  timestamp: string;
  // Fase 4: campos opcionales para no romper registros DEMO antiguos.
  role?: string;
  actor_id?: string;
  tenant_id?: string;
  method?: string | null;
  path?: string | null;
  ip_address?: string | null;
  status?: 'success' | 'denied';
}

export interface NeuralStatusPayload {
  model_name: string;
  model_version: string;
  feature_schema_version: string;
  status: string;
  trained_epochs: number;
  last_train_loss: number | null;
  last_val_loss: number | null;
  temperature: Record<string, number>;
  decision_thresholds: Record<string, number>;
  lambdas: Record<string, number>;
  publication_decision: string;
  evaluation_source: string;
}

export interface ModelMetricsSummary {
  label?: string;
  model?: {
    name?: string;
    version?: string;
    trained_epochs?: number;
    lambdas?: Record<string, number>;
  };
  mtl_test?: Record<string, unknown>;
  baselines_test?: Record<string, Record<string, unknown>>;
  publication_decision?: string;
}

// --- Fase 2: comunidad, tutor, recomendaciones y notificaciones ---

export interface CommunityThread {
  id: string;
  name: string;
  title: string;
  description: string;
  members: number;
  pinned: boolean;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
}

export interface CommunityMessage {
  id: string;
  threadId: string;
  author: string;
  role: string;
  text: string;
  createdAt: string;
  likes: number;
  moderated: boolean;
  hidden: boolean;
}

export interface TutorMessageData {
  id: string;
  conversationId: string;
  sender: 'user' | 'tutor';
  text: string;
  createdAt: string;
  confidence?: number | null;
  sources?: string[];
  guardrail?: string | null;
}

export interface TutorConversationData {
  conversationId: string;
  messages: TutorMessageData[];
}

export interface RecommendationItemData {
  id: string;
  prediction_id: string;
  resource_id: string;
  prefix: 'Repasa' | 'Completa' | 'Sigue' | 'Realiza' | 'Explora';
  title: string;
  course: string;
  difficulty: string;
  rationale: string;
  confidence: number;
  score: number;
  available: boolean;
  status: string;
}

export interface FeedbackResultData {
  feedback_id: string;
  prediction_id: string;
  resource_id: string;
  decision: string;
  recorded_at: string;
  note: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  createdAt: string;
  read: boolean;
  actor: string;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  digest: string;
  categories: string[];
}

// --- Fase 4: configuración institucional y preferencias ---

export type SettingsTheme = ThemeMode;

export interface AppSettings {
  theme: SettingsTheme;
  organization: string;
  tenantId: string;
  /** Informativo en DEMO: no activa RLS real sin OIDC/Postgres policies. */
  rlsEnabled: boolean;
  retentionDays: number;
  minorsProtection: boolean;
  consentOnFirstLogin: boolean;
  arcoPortal: boolean;
  updatedAt: string;
  updatedBy: string;
}

export type SettingsUpdate = Pick<
  AppSettings,
  | 'theme'
  | 'organization'
  | 'rlsEnabled'
  | 'retentionDays'
  | 'minorsProtection'
  | 'consentOnFirstLogin'
  | 'arcoPortal'
>;

export type SettingsPreferences = NotificationPreferences;

