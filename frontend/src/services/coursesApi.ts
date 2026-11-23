import type { ApiCourse, ApiResponse, NewCourseInput } from '../types';
import { requestWithDemo } from './apiClient';
import { readSlice, writeSlice } from './demoStore';

const COURSES_KEY = 'phase3Courses';
const ENROLLMENTS_KEY = 'phase3Enrollments';

interface Enrollment {
  id: string;
  courseId: string;
  actor: string;
  createdAt: string;
}

const DEMO_COURSES: ApiCourse[] = [
  {
    id: 'crs-1',
    code: 'DL-401',
    title: 'Arquitectura de Redes Neuronales & Transformers',
    instructor: 'Dr. Alejandro Morales',
    level: 'Avanzado',
    description: 'Arquitecturas profundas, atención multi-cabeza y entrenamiento con regularización.',
    students: 4820,
    capacity: 6000,
    completionRate: 84,
    status: 'Publicado',
    tags: ['PyTorch', 'Transformers', 'Deep Learning'],
    createdAt: '2026-11-01T00:00:00Z',
    enrolled: false,
  },
  {
    id: 'crs-2',
    code: 'ML-201',
    title: 'Machine Learning con Baselines Interpretables',
    instructor: 'Dra. Elena Silva',
    level: 'Intermedio',
    description: 'Modelos base interpretables, validación temporal y métricas calibradas.',
    students: 6150,
    capacity: 7000,
    completionRate: 79,
    status: 'Publicado',
    tags: ['Scikit-Learn', 'XGBoost', 'LightGBM'],
    createdAt: '2026-11-01T00:00:00Z',
    enrolled: false,
  },
  {
    id: 'crs-3',
    code: 'OPS-301',
    title: 'MLOps: Despliegue con FastAPI, MLflow y DVC',
    instructor: 'Ing. Carlos Mendoza',
    level: 'Avanzado',
    description: 'Versionado de datos y modelos, despliegue ligero y rollback controlado.',
    students: 3290,
    capacity: 5000,
    completionRate: 91,
    status: 'Publicado',
    tags: ['MLOps', 'FastAPI', 'Docker', 'DVC'],
    createdAt: '2026-11-01T00:00:00Z',
    enrolled: false,
  },
  {
    id: 'crs-4',
    code: 'DAT-101',
    title: 'DataOps & Ingesta de Eventos en Tiempo Real',
    instructor: 'Mg. Patricia Ruiz',
    level: 'Básico',
    description: 'Ingesta de eventos, calidad de datos y tuberías reproducibles.',
    students: 5410,
    capacity: 6500,
    completionRate: 88,
    status: 'Publicado',
    tags: ['PostgreSQL', 'Eventos', 'Outbox'],
    createdAt: '2026-11-01T00:00:00Z',
    enrolled: false,
  },
  {
    id: 'crs-5',
    code: 'SEC-501',
    title: 'Privacidad de Datos y Cumplimiento Ley 29733',
    instructor: 'Abg. Roberto Castillo',
    level: 'Intermedio',
    description: 'Disociación de identidad, consentimiento y buenas prácticas de seguridad.',
    students: 2180,
    capacity: 3500,
    completionRate: 95,
    status: 'Publicado',
    tags: ['Legal Tech', 'Ley 29733', 'Anonimización'],
    createdAt: '2026-11-01T00:00:00Z',
    enrolled: false,
  },
];

function courses(): ApiCourse[] {
  return readSlice<ApiCourse[]>(COURSES_KEY, DEMO_COURSES);
}

function enrollments(): Enrollment[] {
  return readSlice<Enrollment[]>(ENROLLMENTS_KEY, []);
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function withEnrollmentState(course: ApiCourse, all: Enrollment[]): ApiCourse {
  const extra = all.filter(item => item.courseId === course.id).length;
  return {
    ...course,
    students: course.students + extra,
    enrolled: all.some(item => item.courseId === course.id && item.actor === 'demo-user'),
  };
}

export function listCourses(signal?: AbortSignal): Promise<ApiResponse<ApiCourse[]>> {
  return requestWithDemo<ApiCourse[]>('/api/v1/courses', { signal }, () => {
    const all = enrollments();
    return courses().map(course => withEnrollmentState(course, all));
  });
}

export function createCourse(payload: NewCourseInput): Promise<ApiResponse<ApiCourse>> {
  return requestWithDemo<ApiCourse>(
    '/api/v1/courses',
    { method: 'POST', body: JSON.stringify(payload) },
    () => {
      const record: ApiCourse = {
        ...payload,
        id: nextId('crs'),
        students: 0,
        completionRate: 0,
        createdAt: new Date().toISOString(),
        enrolled: false,
      };
      writeSlice(COURSES_KEY, [record, ...courses()]);
      return record;
    },
  );
}

export function updateCourse(
  id: string,
  payload: NewCourseInput,
): Promise<ApiResponse<ApiCourse>> {
  return requestWithDemo<ApiCourse>(
    `/api/v1/courses/${encodeURIComponent(id)}`,
    { method: 'PUT', body: JSON.stringify(payload) },
    () => {
      const current = courses();
      const index = current.findIndex(course => course.id === id);
      if (index === -1) throw new Error('Curso no encontrado en el store DEMO');
      const updated: ApiCourse = { ...current[index], ...payload };
      const next = [...current];
      next[index] = updated;
      writeSlice(COURSES_KEY, next);
      return withEnrollmentState(updated, enrollments());
    },
  );
}

export function enrollCourse(id: string): Promise<ApiResponse<ApiCourse>> {
  return requestWithDemo<ApiCourse>(
    `/api/v1/courses/${encodeURIComponent(id)}/enroll`,
    { method: 'POST' },
    () => {
      const current = courses();
      const course = current.find(item => item.id === id);
      if (!course) throw new Error('Curso no encontrado en el store DEMO');
      const all = enrollments();
      const already = all.some(item => item.courseId === id && item.actor === 'demo-user');
      if (!already) {
        const count = all.filter(item => item.courseId === id).length;
        if (course.capacity && course.students + count >= course.capacity) {
          throw new Error('Cupo completo');
        }
        writeSlice(ENROLLMENTS_KEY, [
          ...all,
          {
            id: nextId('enr'),
            courseId: id,
            actor: 'demo-user',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      return withEnrollmentState(course, enrollments());
    },
  );
}
