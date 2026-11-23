import type { ModelMetricsSummary, NeuralStatusPayload } from '../types';
import { requestWithDemo } from './apiClient';

const DEMO_STATUS: NeuralStatusPayload = {
  model_name: 'edumaster_mtl_network',
  model_version: '0.1.0-demo',
  feature_schema_version: 'v1-demo',
  status: 'inferencia',
  trained_epochs: 7,
  last_train_loss: 1.0252,
  last_val_loss: null,
  temperature: { completion: 1, dropout_risk: 1 },
  decision_thresholds: { completion: 0.45, dropout_risk: 0.5 },
  lambdas: { completion: 1, mastery: 1, dropout_risk: 1, ranking: 0.5 },
  publication_decision:
    'DEMO: no publicar. Comparar en dataset real, validar calibracion/equidad/coste y obtener aprobacion de responsable tecnico y dueno funcional.',
  evaluation_source: 'synthetic_demo_v1',
};

export function getNeuralStatus(signal?: AbortSignal) {
  return requestWithDemo<NeuralStatusPayload>(
    '/api/v1/neural/status',
    { signal },
    () => DEMO_STATUS,
  );
}

export function getModelMetrics(signal?: AbortSignal) {
  return requestWithDemo<ModelMetricsSummary | null>(
    '/api/v1/ml/models',
    { signal },
    () => null,
  );
}
