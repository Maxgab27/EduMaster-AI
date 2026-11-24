import type {
  ApiAssessment,
  ApiResponse,
  ApiSubmission,
  GradeSubmissionInput,
  SubmissionFeedbackInput,
} from '../types';
import { pendingSubmissions } from '../data/mockData';
import { requestCoreWithDemo, requestWithDemo } from './apiClient';
import { readSlice, writeSlice } from './demoStore';

const SUBMISSIONS_KEY = 'phase3Submissions';

const DEMO_ASSESSMENTS: ApiAssessment[] = [
  {
    id: 'as-1',
    title: 'Examen Práctico: Backpropagation en NumPy',
    course: 'DL-401: Arquitectura de Redes Neuronales',
    dueDate: '20 Nov 2026',
    maxScore: 20,
    weight: '30%',
    attempts: 142,
    officialAvg: 17.4,
    predictiveEst: 16.9,
    status: 'Disponible',
    note: 'DEMO · promedios sintéticos de muestra, no evidencia oficial.',
  },
  {
    id: 'as-2',
    title: 'Proyecto Integrador: Feature Store & DVC',
    course: 'OPS-301: MLOps Enterprise',
    dueDate: '24 Nov 2026',
    maxScore: 20,
    weight: '40%',
    attempts: 89,
    officialAvg: 18.1,
    predictiveEst: 17.8,
    status: 'En Calificación',
    note: 'DEMO · promedios sintéticos de muestra, no evidencia oficial.',
  },
  {
    id: 'as-3',
    title: 'Cuestionario: Pérdida Multitarea y Regularización',
    course: 'ML-201: Machine Learning con Baselines',
    dueDate: '15 Nov 2026',
    maxScore: 20,
    weight: '15%',
    attempts: 310,
    officialAvg: 15.8,
    predictiveEst: 16.0,
    status: 'Cerrado',
    note: 'DEMO · promedios sintéticos de muestra, no evidencia oficial.',
  },
];

const DEMO_SUBMISSIONS: ApiSubmission[] = pendingSubmissions.map((item, index) => ({
  id: item.id,
  studentId: item.studentId,
  studentName: item.studentName,
  avatar: item.avatar,
  course: item.course,
  assignmentTitle: item.assignmentTitle,
  submittedAt: `2026-11-2${2 - index}T0${2 - index}:15:00Z`,
  estimatedAiScore: item.estimatedAiScore,
  officialScore: item.officialScore ?? null,
  status: 'pending',
  codeSnippet: item.codeSnippet,
  rubricScores: item.rubricScores,
  feedback: item.feedback,
  signedBy: null,
  gradedAt: null,
  predictionId: `PRED-DEMO-SUB${101 + index}`,
}));

function submissions(): ApiSubmission[] {
  return readSlice<ApiSubmission[]>(SUBMISSIONS_KEY, DEMO_SUBMISSIONS);
}

function saveSubmissions(next: ApiSubmission[]): void {
  writeSlice(SUBMISSIONS_KEY, next.slice(-200));
}

function updateSubmission(
  id: string,
  transform: (item: ApiSubmission) => ApiSubmission,
): ApiSubmission {
  const current = submissions();
  const index = current.findIndex(item => item.id === id);
  if (index === -1) throw new Error('Entrega no encontrada en el store DEMO');
  const updated = transform(current[index]);
  const next = [...current];
  next[index] = updated;
  saveSubmissions(next);
  return updated;
}

export function listAssessments(signal?: AbortSignal): Promise<ApiResponse<ApiAssessment[]>> {
  return requestWithDemo<ApiAssessment[]>('/api/v1/assessments', { signal }, () => DEMO_ASSESSMENTS);
}

export function listSubmissions(signal?: AbortSignal): Promise<ApiResponse<ApiSubmission[]>> {
  return requestCoreWithDemo<ApiSubmission[]>(
    '/api/v1/compat/submissions',
    { signal },
    () => submissions(),
  );
}

export function gradeSubmission(
  id: string,
  payload: GradeSubmissionInput,
): Promise<ApiResponse<ApiSubmission>> {
  return requestCoreWithDemo<ApiSubmission>(
    `/api/v1/compat/submissions/${encodeURIComponent(id)}/grade`,
    { method: 'POST', body: JSON.stringify(payload) },
    () => updateSubmission(id, item => {
      const maximum = item.rubricScores.reduce((sum, row) => sum + row.maxPts, 0) || 20;
      if (payload.officialScore > maximum) {
        throw new Error(`La nota oficial no puede superar ${maximum} puntos según la rúbrica.`);
      }
      return {
        ...item,
        officialScore: payload.officialScore,
        feedback: payload.feedback,
        signedBy: payload.signedBy,
        gradedAt: new Date().toISOString(),
        status: 'graded',
      };
    }),
  );
}

export function addSubmissionFeedback(
  id: string,
  payload: SubmissionFeedbackInput,
): Promise<ApiResponse<ApiSubmission>> {
  return requestCoreWithDemo<ApiSubmission>(
    `/api/v1/compat/submissions/${encodeURIComponent(id)}/feedback`,
    { method: 'POST', body: JSON.stringify(payload) },
    () => updateSubmission(id, item => ({
      ...item,
      feedback: payload.feedback,
      status: item.status === 'pending' ? 'in_review' : item.status,
    })),
  );
}
