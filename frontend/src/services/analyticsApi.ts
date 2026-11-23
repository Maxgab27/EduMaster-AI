import type { AnalyticsProgress, AnalyticsSkillMastery } from '../types';
import { requestWithDemo } from './apiClient';

export const COHORT_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'MATEMATICA', label: 'Matemática' },
  { value: 'LENGUA', label: 'Lengua' },
  { value: 'TECNOLOGIA', label: 'Tecnología' },
  { value: 'CIENCIAS', label: 'Ciencias' },
];

const DEMO_BASE: AnalyticsProgress['series'] = [
  { label: 'Semana 1', completion: 0.41, activeStudents: 38, assessments: 21 },
  { label: 'Semana 2', completion: 0.48, activeStudents: 42, assessments: 25 },
  { label: 'Semana 3', completion: 0.55, activeStudents: 47, assessments: 29 },
  { label: 'Semana 4', completion: 0.61, activeStudents: 51, assessments: 33 },
  { label: 'Semana 5', completion: 0.67, activeStudents: 55, assessments: 37 },
  { label: 'Semana 6', completion: 0.72, activeStudents: 58, assessments: 40 },
];

const COHORT_OFFSET: Record<string, number> = {
  MATEMATICA: -0.04,
  LENGUA: 0.03,
  TECNOLOGIA: 0.06,
  CIENCIAS: -0.01,
};

function demoProgress(cohort: string): AnalyticsProgress {
  const offset = COHORT_OFFSET[cohort] ?? 0;
  return {
    label: 'DEMO · progreso semanal derivado de eventos sintéticos',
    cohort,
    series: DEMO_BASE.map((point, index) => ({
      ...point,
      completion: Math.min(1, Math.max(0, Number((point.completion + offset + index * 0.002).toFixed(4)))),
    })),
  };
}

const DEMO_SKILLS: AnalyticsSkillMastery = {
  label: 'DEMO · dominio agregado por competencia; no es nota oficial',
  skills: [
    { skill: 'MATEMATICA', level: 0.68, certifiedByDocent: true, evidenceCount: 61 },
    { skill: 'LENGUA', level: 0.74, certifiedByDocent: true, evidenceCount: 58 },
    { skill: 'TECNOLOGIA', level: 0.79, certifiedByDocent: true, evidenceCount: 64 },
    { skill: 'CIENCIAS', level: 0.66, certifiedByDocent: true, evidenceCount: 57 },
  ],
};

export function getAnalyticsProgress(cohort = 'todos', signal?: AbortSignal) {
  return requestWithDemo<AnalyticsProgress>(
    '/api/v1/analytics/progress',
    { query: { cohort }, signal },
    () => demoProgress(cohort),
  );
}

export function getAnalyticsSkillMastery(signal?: AbortSignal) {
  return requestWithDemo<AnalyticsSkillMastery>(
    '/api/v1/analytics/skill-mastery',
    { signal },
    () => DEMO_SKILLS,
  );
}
