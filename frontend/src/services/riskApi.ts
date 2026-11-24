/** Servicios del caso de uso real: triaje de riesgo e inferencia de la Cabeza C. */
import { atRiskStudents } from '../data/mockData';
import type { ApiResponse, AtRiskStudent } from '../types';
import type { DropoutRiskResponse, StudentInferenceRequest } from './api';
import { requestCoreWithDemo } from './apiClient';

export function listAtRiskStudents(signal?: AbortSignal): Promise<ApiResponse<AtRiskStudent[]>> {
  return requestCoreWithDemo<AtRiskStudent[]>(
    '/api/v1/compat/students/at-risk',
    { signal },
    () => atRiskStudents,
  );
}

export function predictDropoutRisk(
  payload: StudentInferenceRequest,
): Promise<ApiResponse<DropoutRiskResponse>> {
  return requestCoreWithDemo<DropoutRiskResponse>(
    '/api/v1/compat/inference/dropout-risk',
    { method: 'POST', body: JSON.stringify(payload) },
    () => ({
      student_id: payload.student_id,
      probability: 0.5,
      risk_level: 'Moderado',
      confidence: 0.94,
      calibrated_brier_score: 0.082,
      dominant_factors: ['DEMO local · sin motor configurado'],
      recommended_pedagogical_action: 'Revisar el caso con el docente antes de intervenir.',
      evaluated_at: new Date().toISOString(),
    }),
  );
}
