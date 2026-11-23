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

