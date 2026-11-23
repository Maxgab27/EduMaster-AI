import { initialRecommendations } from '../data/mockData';
import type { FeedbackResultData, RecommendationItemData } from '../types';
import { requestWithDemo } from './apiClient';
import { readSlice, writeSlice } from './demoStore';

const STATUS_KEY = 'recommendationStatus';
type Decision = 'aceptada' | 'descartada' | 'completada' | 'util' | 'no_util';

function demoRecommendations(): RecommendationItemData[] {
  const status = readSlice<Record<string, string>>(STATUS_KEY, {});
  return initialRecommendations.map(rec => ({
    id: rec.id,
    prediction_id: 'PRED-DEMO-LOCAL',
    resource_id: rec.id.toUpperCase(),
    prefix: rec.prefix,
    title: rec.title,
    course: rec.course,
    difficulty: rec.difficulty,
    rationale: `${rec.rationale} (DEMO local, sin inferencia del artefacto).`,
    confidence: rec.confidence,
    score: rec.confidence,
    available: true,
    status: status[rec.id] ?? rec.status,
  }));
}

export function listRecommendations(signal?: AbortSignal) {
  return requestWithDemo<RecommendationItemData[]>(
    '/api/v1/recommendations',
    { signal },
    demoRecommendations,
  );
}

export function sendRecommendationFeedback(
  payload: { prediction_id: string; resource_id: string; decision: Decision; comment?: string },
  signal?: AbortSignal,
) {
  return requestWithDemo<FeedbackResultData>(
    '/api/v1/recommendations/feedback',
    { method: 'POST', body: JSON.stringify(payload), signal },
    () => {
      const status = readSlice<Record<string, string>>(STATUS_KEY, {});
      const rec = demoRecommendations().find(item => item.resource_id === payload.resource_id);
      if (rec) {
        status[rec.id] = payload.decision;
        writeSlice(STATUS_KEY, status);
      }
      return {
        feedback_id: `FB-LOCAL-${Date.now().toString(36)}`,
        prediction_id: payload.prediction_id,
        resource_id: payload.resource_id,
        decision: payload.decision,
        recorded_at: new Date().toISOString(),
        note: 'DEMO · feedback local; no entrena al modelo automaticamente.',
      };
    },
  );
}
