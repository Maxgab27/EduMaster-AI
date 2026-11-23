import React, { useEffect, useState } from 'react';
import { Cpu, GitBranch, Database, Layers, RefreshCw } from 'lucide-react';
import type { ApiMeta, ModelMetricsSummary, NeuralStatusPayload, ThemeMode } from '../../types';
import { getModelMetrics, getNeuralStatus } from '../../services/neuralApi';

interface NeuralInspectorViewProps {
  theme?: ThemeMode;
}

type Section = 'architecture' | 'baselines' | 'mlops';

type Row = Record<string, unknown>;

const BASELINE_LABELS: Record<string, string> = {
  logistic_regression: 'Regresión logística calibrada (L2)',
  gradient_boosting_stumps: 'Gradient boosting con stumps',
  random_forest: 'Random forest',
  decision_tree: 'Árbol de decisión',
  dummy: 'Baseline constante',
};

function asRow(value: unknown): Row {
  return value && typeof value === 'object' ? (value as Row) : {};
}

function metric(row: Row, task: string, key: string): string {
  const value = asRow(row[task])[key];
  return typeof value === 'number' ? value.toFixed(4) : '—';
}

function baselineRows(metrics: ModelMetricsSummary | null): { name: string; row: Row; mtl?: boolean }[] {
  if (!metrics) return [];
  const rows: { name: string; row: Row; mtl?: boolean }[] = [];
  if (metrics.mtl_test) {
    rows.push({ name: 'MTL (4 cabezas, demo)', row: metrics.mtl_test, mtl: true });
  }
  Object.entries(metrics.baselines_test ?? {}).forEach(([key, value]) => {
    rows.push({ name: BASELINE_LABELS[key] ?? key, row: asRow(value) });
  });
  return rows;
}

export const NeuralInspectorView: React.FC<NeuralInspectorViewProps> = ({ theme = 'monochrome' }) => {
  const [activeTab, setActiveTab] = useState<Section>('architecture');
  const [status, setStatus] = useState<NeuralStatusPayload | null>(null);
  const [metrics, setMetrics] = useState<ModelMetricsSummary | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getNeuralStatus(controller.signal), getModelMetrics(controller.signal)])
      .then(([statusResponse, metricsResponse]) => {
        setStatus(statusResponse.data);
        setMetrics(metricsResponse.data);
        setMeta(statusResponse.meta);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar la telemetría del modelo');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const rows = baselineRows(metrics);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <Cpu className={`w-5 h-5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
            Inspector de Redes Neuronales & MLOps Governance
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Implementación DEMO en Python puro, con baselines obligatorios y decisión de publicación trazable.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            {meta ? `${meta.source} · ${meta.correlationId.slice(0, 14)}` : 'sin fuente'}
          </span>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadKey(key => key + 1);
            }}
            className={`p-2 rounded-xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'
            }`}
            title="Recargar telemetría"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className={`flex p-0.5 rounded-xl border text-xs ${
            isLight ? 'bg-slate-100 border-slate-300' : isMono ? 'bg-[#1C202B] border-[#3B4254]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
          }`}>
            {([
              ['architecture', 'Arquitectura'],
              ['baselines', 'Evaluación'],
              ['mlops', 'Gobernanza'],
            ] as [Section, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  activeTab === key
                    ? (isLight ? 'bg-white shadow text-slate-900 font-extrabold' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                    : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-2xl border text-xs ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={`p-10 rounded-2xl border text-center text-xs animate-pulse ${
          isLight ? 'bg-white border-slate-200 text-slate-500' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-400' : 'glass-panel border-edumaster-cardBorder text-slate-400'
        }`}>
          Cargando artefactos desde {meta?.source === 'api' ? 'la API' : 'el adaptador DEMO'}...
        </div>
      ) : (
        <>
          {status && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Modelo', status.model_name],
                ['Versión', status.model_version],
                ['Épocas', String(status.trained_epochs)],
                ['Fuente', status.evaluation_source],
              ].map(([label, value]) => (
                <div key={label} className={`p-3 rounded-xl border ${
                  isLight ? 'bg-white border-slate-200' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
                }`}>
                  <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
                  <span className={`font-mono text-xs font-bold break-all ${isLight ? 'text-slate-900' : 'text-white'}`}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className={`p-5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
              }`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-blue-700' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`}>
                  Función de pérdida multitarea (documento §9.3)
                </h3>
                <div className={`p-3 rounded-xl border font-mono text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : isMono ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-200' : 'bg-[#06152B] border-edumaster-cardBorder text-slate-200'
                }`}>
                  L_total = λ₁·BCE(finalización) + λ₂·CE(dominio) + λ₃·BCE(riesgo) + λ₄·RankingLoss(recs)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                  {[
                    ['completion', 'λ₁ Finalización'],
                    ['mastery', 'λ₂ Dominio'],
                    ['dropout_risk', 'λ₃ Riesgo'],
                    ['ranking', 'λ₄ Ranking'],
                  ].map(([key, label]) => (
                    <div key={key} className={`p-2 rounded-lg border text-center ${isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'}`}>
                      <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
                      <span className={`font-mono font-bold ${isLight ? 'text-blue-700' : 'text-edumaster-cyan'}`}>
                        {status?.lambdas?.[key] ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold flex items-center gap-2">
                    <Layers className={`w-4 h-4 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-blue'}`} />
                    Arquitectura conceptual documentada
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>dataset/synthetic_demo_v1</span>
                </div>
                <pre className={`p-4 rounded-xl border text-[11px] font-mono overflow-x-auto leading-relaxed ${
                  isLight ? 'bg-slate-900 text-emerald-400 border-slate-800' : isMono ? 'bg-[#0E1117] text-zinc-200 border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder text-slate-300'
                }`}>
{`Componentes compartidos (documento §9.3):
- representación tabular de 7 features autorizadas
- secuencia de eventos con codificación ordinal acotada
- fusión en una capa compartida
- cabeza A: finalización (BCE)
- cabeza B: dominio (CrossEntropy ordinal)
- cabeza C: riesgo de desconexión (BCE)
- cabeza D: ranking de recursos (RankingLoss)

Ejecución DEMO: Python puro, sin PyTorch.
Umbrales y temperatura se leen del artefacto API.`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'baselines' && (
            <div className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold m-0">Evaluación comparativa sobre dataset sintético</h3>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {metrics?.label ?? 'Sin artefacto local'}
                </span>
              </div>

              {rows.length === 0 ? (
                <div className={`p-6 rounded-xl border text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'
                }`}>
                  No hay informe de evaluación disponible en modo DEMO local. Conecta la API para cargar `evaluation.json`.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[11px] ${isLight ? 'border-slate-200 text-slate-500' : isMono ? 'border-[#2A2F3D] text-zinc-400' : 'border-edumaster-cardBorder text-slate-400'}`}>
                        <th className="pb-3">Modelo</th>
                        <th className="pb-3">Finalización PR/ROC</th>
                        <th className="pb-3">Dominio macro-F1</th>
                        <th className="pb-3">Riesgo PR-AUC</th>
                        <th className="pb-3">Recs nDCG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(row => (
                        <tr key={row.name} className={`border-b ${row.mtl ? (isLight ? 'bg-blue-50/70 font-semibold' : 'bg-edumaster-blue/10 font-semibold') : ''} ${isLight ? 'border-slate-100' : isMono ? 'border-[#2A2F3D]/60' : 'border-edumaster-cardBorder/50'}`}>
                          <td className="py-3 font-bold">{row.name}</td>
                          <td className="py-3 font-mono">{metric(row.row, 'completion', 'pr_auc')} / {metric(row.row, 'completion', 'roc_auc')}</td>
                          <td className="py-3 font-mono">{metric(row.row, 'mastery', 'macro_f1')}</td>
                          <td className="py-3 font-mono">{metric(row.row, 'dropout_risk', 'pr_auc')}</td>
                          <td className="py-3 font-mono">{metric(row.row, 'recommendation', 'ndcg_at_k')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className={`text-[11px] mt-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Brier, calibración, F1, recall y matrices de confusión están disponibles en `evaluation.json`; la tabla resume las métricas comparables.
              </p>
            </div>
          )}

          {activeTab === 'mlops' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`p-5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
              }`}>
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <GitBranch className={`w-4 h-4 ${isLight ? 'text-purple-600' : isMono ? 'text-zinc-200' : 'text-edumaster-violet'}`} />
                  Decisión de publicación
                </h3>
                <div className={`p-3 rounded-xl border text-xs ${
                  isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  {status?.publication_decision ?? metrics?.publication_decision ?? 'DEMO: pendiente de evaluación.'}
                </div>
                <div className={`mt-3 space-y-2 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <div>• Sin PyTorch, Redis, Celery ni MLflow en el despliegue DEMO.</div>
                  <div>• Backend ligero para Railway 1 GB; frontend estático para Vercel.</div>
                  <div>• Persistencia opcional en Supabase REST; sin ORM pesado.</div>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
              }`}>
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Database className={`w-4 h-4 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-blue'}`} />
                  Artefacto y guardrails
                </h3>
                <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-slate-300'
                }`}>
                  <div>schema: {status?.feature_schema_version ?? '—'}</div>
                  <div>train_loss: {status?.last_train_loss ?? '—'}</div>
                  <div>val_loss: {status?.last_val_loss ?? '—'}</div>
                  <div>umbral_completion: {status?.decision_thresholds?.completion ?? '—'}</div>
                  <div>umbral_riesgo: {status?.decision_thresholds?.dropout_risk ?? '—'}</div>
                  <div>temp_completion: {status?.temperature?.completion ?? '—'}</div>
                </div>
                <p className={`text-[11px] mt-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Las probabilidades son estimaciones DEMO. No sustituyen la firma docente ni autorizan medidas punitivas.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
