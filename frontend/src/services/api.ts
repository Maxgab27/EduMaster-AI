/**
 * Cliente API oficial de EduMaster.ai Enterprise
 * Conecta con el backend en FastAPI (Railway / Local) y maneja fallback resiliente.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
  engine: string;
  protocol: string;
}

export interface StudentInferenceRequest {
  student_id: string;
  sessions_14d: number;
  late_submissions_30d: number;
  unexcused_absences: number;
  avg_quiz_score: number;
  hours_active_weekly: number;
}

export interface DropoutRiskResponse {
  student_id: string;
  probability: number;
  risk_level: string;
  confidence: number;
  calibrated_brier_score: number;
  dominant_factors: string[];
  recommended_pedagogical_action: string;
  evaluated_at: string;
}

export interface GradeSubmissionPayload {
  submission_id: string;
  official_score: number;
  teacher_feedback: string;
  teacher_id?: string;
  rubric_scores?: Record<string, number>;
}

export interface GradeSubmissionResponse {
  status: string;
  submission_id: string;
  official_score: number;
  signature_hash: string;
  signed_by: string;
  signed_at: string;
  audit_log_id: string;
  message: string;
}

export interface ApiAuditLogEntry {
  id: string;
  user_id: string;
  user_role: string;
  action: string;
  resource: string;
  ip_address: string;
  timestamp: string;
  payload_hash: string;
  details?: Record<string, any>;
}

export const apiService = {
  /**
   * Verifica la conectividad con el backend en Railway o local.
   */
  async checkHealth(): Promise<HealthStatus | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  /**
   * Ejecuta la inferencia de la Cabeza C (Dropout Risk) en el motor PyTorch MTL.
   */
  async predictDropoutRisk(payload: StudentInferenceRequest): Promise<DropoutRiskResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/inference/dropout-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.warn('Fallo en inferencia en vivo, usando cálculo local:', err);
      return null;
    }
  },

  /**
   * SOP 70-75: Firma y publica la calificación oficial del docente en audit_logs.
   */
  async submitTeacherGrade(payload: GradeSubmissionPayload): Promise<GradeSubmissionResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/grades/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.warn('Fallo al registrar firma en el backend en vivo:', err);
      return null;
    }
  },

  /**
   * Obtiene los registros inmutables de auditoría (Ley 29733 / ARCO).
   */
  async getAuditLogs(limit: number = 30): Promise<ApiAuditLogEntry[] | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/audit/logs?limit=${limit}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  /**
   * Obtiene la lista de estudiantes priorizados por riesgo de abandono.
   */
  async getAtRiskStudents(cohort: string = '2026-II'): Promise<any[] | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/students/at-risk?cohort=${encodeURIComponent(cohort)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
};
