import {
  metricCards,
  regionsData,
  skillMasteryData,
  recentActivities,
  mlopsTelemetry,
} from '../data/mockData';
import type { ApiResponse, DashboardSummary } from '../types';
import { requestWithDemo } from './apiClient';

/** Contrato único del dashboard: API real o envelope DEMO local. */
function demoSummary(): DashboardSummary {
  return {
    metrics: metricCards,
    regions: regionsData,
    skills: skillMasteryData,
    activity: recentActivities,
    neural: {
      status: 'detenido',
      epoch: 0,
      loss: 0,
      valMetric: 0,
      modelVersion: `${mlopsTelemetry.activeModelVersion}-demo-local`,
    },
  };
}

export async function getDashboardSummary(signal?: AbortSignal): Promise<ApiResponse<DashboardSummary>> {
  return requestWithDemo<DashboardSummary>(
    '/api/v1/dashboard/summary',
    { signal },
    demoSummary,
  );
}
