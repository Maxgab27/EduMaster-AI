import type { ApiLearningPath, ApiResponse, ApiPathStep, PathProgressInput } from '../types';
import { requestWithDemo } from './apiClient';
import { readSlice, writeSlice } from './demoStore';

const PATHS_KEY = 'phase3LearningPaths';
const PROGRESS_KEY = 'phase3PathProgress';

interface ProgressRecord extends PathProgressInput {
  id: string;
  pathId: string;
  actor: string;
  updatedAt: string;
}

const DEMO_PATHS: ApiLearningPath[] = [
  {
    id: 'dl-engineer',
    title: 'Especialista en Deep Learning & Redes Neuronales',
    description: 'Dominio de arquitecturas Transformer, GRU, convolucionales y MLOps con PyTorch.',
    duration: '120 horas',
    coursesCount: 6,
    progress: 33,
    steps: [
      { id: 'dl-1', name: 'Álgebra Lineal & Optimización Tensorial', courseId: 'crs-1', status: 'completed', score: '98/100' },
      { id: 'dl-2', name: 'Redes Neuronales Densas & Backpropagation', courseId: 'crs-1', status: 'completed', score: '95/100' },
      { id: 'dl-3', name: 'Modelado Secuencial con GRU & LSTM', courseId: 'crs-1', status: 'current', score: 'En progreso' },
      { id: 'dl-4', name: 'Transformers & Mecanismos de Auto-Atención', courseId: 'crs-1', status: 'locked', score: 'Pendiente' },
      { id: 'dl-5', name: 'Arquitecturas Multitarea & Loss Ponderada', courseId: 'crs-3', status: 'locked', score: 'Pendiente' },
      { id: 'dl-6', name: 'Despliegue con FastAPI & MLflow', courseId: 'crs-3', status: 'locked', score: 'Pendiente' },
    ],
  },
  {
    id: 'data-scientist',
    title: 'Científico de Datos & DataOps Enterprise',
    description: 'Ingesta de eventos, split temporal estricto, feature stores y mitigación de fugas.',
    duration: '95 horas',
    coursesCount: 5,
    progress: 25,
    steps: [
      { id: 'ds-1', name: 'Ingeniería de Características en Tiempo Real', courseId: 'crs-4', status: 'completed', score: '92/100' },
      { id: 'ds-2', name: 'Split Temporal y Validación sin Data Leakage', courseId: 'crs-4', status: 'current', score: 'En progreso' },
      { id: 'ds-3', name: 'Modelos Baselines Interpretables (XGBoost)', courseId: 'crs-2', status: 'locked', score: 'Pendiente' },
      { id: 'ds-4', name: 'Gobernanza de Datos & Ley 29733', courseId: 'crs-5', status: 'locked', score: 'Pendiente' },
    ],
  },
];

function paths(): ApiLearningPath[] {
  return readSlice<ApiLearningPath[]>(PATHS_KEY, DEMO_PATHS);
}

function progressRows(): ProgressRecord[] {
  return readSlice<ProgressRecord[]>(PROGRESS_KEY, []);
}

function computePath(path: ApiLearningPath, rows: ProgressRecord[]): ApiLearningPath {
  type DraftStep = Omit<ApiPathStep, 'status'> & { status: ApiPathStep['status'] | 'pending' };
  const byStep = new Map(rows.filter(row => row.actor === 'demo-user').map(row => [row.stepId, row]));
  const steps: DraftStep[] = path.steps.map(step => {
    const override = byStep.get(step.id);
    const done = override ? override.completed : step.status === 'completed';
    return {
      ...step,
      status: done ? 'completed' : 'pending',
      score: done ? (step.score && !step.score.includes('progreso') ? step.score : 'Completado') : '',
    };
  });

  const firstPending = steps.findIndex(step => step.status === 'pending');
  steps.forEach((step, index) => {
    if (step.status !== 'pending') return;
    if (index === firstPending) {
      step.status = 'current';
      step.score = 'En progreso';
    } else {
      step.status = 'locked';
      step.score = 'Pendiente';
    }
  });

  const finalSteps = steps as ApiPathStep[];
  const completed = finalSteps.filter(step => step.status === 'completed').length;
  return {
    ...path,
    steps: finalSteps,
    progress: finalSteps.length ? Math.round((completed / finalSteps.length) * 100) : 0,
  };
}

export function listPaths(signal?: AbortSignal): Promise<ApiResponse<ApiLearningPath[]>> {
  return requestWithDemo<ApiLearningPath[]>('/api/v1/learning-paths', { signal }, () => {
    const rows = progressRows();
    return paths().map(path => computePath(path, rows));
  });
}

export function updatePathProgress(
  pathId: string,
  payload: PathProgressInput,
): Promise<ApiResponse<ApiLearningPath>> {
  return requestWithDemo<ApiLearningPath>(
    `/api/v1/learning-paths/${encodeURIComponent(pathId)}/progress`,
    { method: 'POST', body: JSON.stringify(payload) },
    () => {
      const current = paths();
      const path = current.find(item => item.id === pathId);
      if (!path) throw new Error('Ruta no encontrada en el store DEMO');
      if (!path.steps.some(step => step.id === payload.stepId)) {
        throw new Error('Paso no encontrado en el store DEMO');
      }

      const rows = progressRows();
      const index = rows.findIndex(
        row => row.pathId === pathId && row.stepId === payload.stepId && row.actor === 'demo-user',
      );
      const record: ProgressRecord = {
        id: index === -1
          ? `prg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
          : rows[index].id,
        pathId,
        stepId: payload.stepId,
        actor: 'demo-user',
        completed: payload.completed,
        source: payload.source,
        updatedAt: new Date().toISOString(),
      };
      const next = index === -1 ? [...rows, record] : rows.map((row, i) => (i === index ? record : row));
      writeSlice(PROGRESS_KEY, next);
      return computePath(path, next);
    },
  );
}
