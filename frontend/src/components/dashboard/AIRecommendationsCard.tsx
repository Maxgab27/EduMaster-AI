import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  Check,
  X,
  Star,
  Compass,
  Code,
  BookMarked,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import type { ApiMeta, RecommendationItemData, ThemeMode } from '../../types';
import { listRecommendations, sendRecommendationFeedback } from '../../services/recommendationsApi';
import { writeAudit } from '../../services/auditSink';

interface AIRecommendationsCardProps {
  theme?: ThemeMode;
}

type Decision = 'aceptada' | 'descartada';

export const AIRecommendationsCard: React.FC<AIRecommendationsCardProps> = ({ theme = 'monochrome' }) => {
  const [recommendations, setRecommendations] = useState<RecommendationItemData[]>([]);
  const [selectedRec, setSelectedRec] = useState<RecommendationItemData | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  useEffect(() => {
    const controller = new AbortController();
    listRecommendations(controller.signal)
      .then(response => {
        setRecommendations(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las recomendaciones');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const handleFeedback = async (rec: RecommendationItemData, action: Decision) => {
    if (savingId) return;
    setSavingId(rec.id);
    setError(null);
    try {
      const response = await sendRecommendationFeedback({
        prediction_id: rec.prediction_id,
        resource_id: rec.resource_id,
        decision: action,
      });
      setRecommendations(prev =>
        prev.map(item => (item.id === rec.id ? { ...item, status: action } : item)),
      );
      setMeta(response.meta);
      setSelectedRec(null);
      await writeAudit({
        action: 'recommendation.feedback',
        correlationId: response.meta.correlationId,
        onlyDemo: true,
        detail: {
          predictionId: rec.prediction_id,
          resourceId: rec.resource_id,
          decision: action,
          source: response.meta.source,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el feedback');
    } finally {
      setSavingId(null);
    }
  };

  const getRecIcon = (prefix: RecommendationItemData['prefix']) => {
    switch (prefix) {
      case 'Repasa':
        return <Star className="w-3.5 h-3.5 opacity-80" />;
      case 'Completa':
        return <Sparkles className="w-3.5 h-3.5 opacity-80" />;
      case 'Sigue':
        return <BookMarked className="w-3.5 h-3.5 opacity-80" />;
      case 'Realiza':
        return <Code className="w-3.5 h-3.5 opacity-80" />;
      case 'Explora':
        return <Compass className="w-3.5 h-3.5 opacity-80" />;
      default:
        return <Lightbulb className="w-3.5 h-3.5 opacity-80" />;
    }
  };

  const getPrefixColor = (prefix: RecommendationItemData['prefix']) => {
    if (isMono) {
      return 'text-white bg-white/10 border-white/20';
    }
    if (isLight) {
      return 'text-slate-900 bg-slate-200 border-slate-300';
    }
    switch (prefix) {
      case 'Repasa':
        return 'text-amber-300 bg-amber-500/15 border-amber-500/40';
      case 'Completa':
        return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40';
      case 'Sigue':
        return 'text-blue-300 bg-edumaster-blue/20 border-edumaster-blue/40';
      case 'Realiza':
        return 'text-purple-300 bg-edumaster-violet/20 border-edumaster-violet/40';
      case 'Explora':
        return 'text-cyan-300 bg-edumaster-cyan/20 border-edumaster-cyan/40';
      default:
        return 'text-white bg-slate-700/50 border-slate-600';
    }
  };

  return (
    <div className={`flex flex-col h-full border rounded-2xl p-5 relative shadow-panel ${
      isLight ? 'bg-white border-slate-200 text-slate-900' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
    }`}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 opacity-80" />
          <h2 className="text-sm font-bold tracking-tight m-0">Recomendaciones de IA</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold opacity-75 ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'
          }`}>
            {meta ? `${meta.source.toUpperCase()} · ${meta.correlationId.slice(0, 10)}` : 'CARGANDO'}
          </span>
          <button
            onClick={() => {
              setLoading(true);
              setReloadKey(key => key + 1);
            }}
            title="Recargar recomendaciones"
            className={`p-1.5 rounded-lg border ${
              isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <p className={`text-[10px] mb-2 ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>{error}</p>
      )}

      {loading ? (
        <div className={`flex-1 grid place-items-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Cargando recomendaciones del artefacto...
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1 justify-between">
          {recommendations.map(rec => {
            const isAceptada = rec.status === 'aceptada';
            const isDescartada = rec.status === 'descartada';

            return (
              <div
                key={rec.id}
                onClick={() => setSelectedRec(rec)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer group ${
                  isDescartada
                    ? 'opacity-40 line-through bg-black/20 border-transparent'
                    : isAceptada
                    ? (isLight
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : isMono
                        ? 'bg-[#242A38] border-white text-white font-bold'
                        : 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200')
                    : (isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 shadow-sm'
                        : isMono
                        ? 'bg-[#1E222C] border-[#2A2F3D] text-gray-200 hover:bg-[#262B37] hover:border-[#3D4457] shadow-sm'
                        : 'bg-black/30 border-white/10 hover:border-white/30 hover:bg-white/5 shadow-sm')
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-700 shadow-sm'
                      : isMono
                      ? 'bg-[#151821] border-[#2A2F3D] text-white shadow-inner'
                      : 'bg-black/40 border-white/10'
                  }`}>
                    {getRecIcon(rec.prefix)}
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider ${getPrefixColor(rec.prefix)}`}>
                      {rec.prefix}:
                    </span>
                    <span className="text-xs font-semibold truncate">{rec.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-1">
                  {isAceptada ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'border-white/20'
                    }`}>
                      Aceptada
                    </span>
                  ) : isDescartada ? (
                    <span className="text-[10px] opacity-50">Descartada</span>
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-transform group-hover:translate-x-1" />
                  )}
                </div>
              </div>
            );
          })}
          {recommendations.length === 0 && (
            <p className={`text-xs text-center py-8 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              No hay recomendaciones disponibles.
            </p>
          )}
        </div>
      )}

      {selectedRec && (
        <div className={`absolute inset-0 border rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl z-40 animate-in fade-in zoom-in-95 duration-150 shadow-2xl ${
          isLight
            ? 'bg-white/98 border-slate-300 text-slate-900 shadow-2xl'
            : isMono
            ? 'bg-[#1A1D24]/98 border-[#3B4254] text-white shadow-2xl'
            : 'bg-[#0A1F3D]/95 border-edumaster-cyan text-white'
        }`}>
          <div>
            <div className={`flex items-start justify-between border-b pb-2.5 mb-3 ${
              isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'
            }`}>
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase ${getPrefixColor(selectedRec.prefix)}`}>
                  {selectedRec.prefix}
                </span>
                <h3 className="text-sm font-bold mt-1.5 mb-0">{selectedRec.title}</h3>
                <span className="text-[11px] opacity-60 block">{selectedRec.course}</span>
              </div>
              <button
                onClick={() => setSelectedRec(null)}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#12141A] border-[#2A2F3D]' : 'bg-black/40 border-white/10'
              }`}>
                <span className="text-[10px] font-bold block uppercase tracking-wider mb-1 opacity-75">
                  Explicabilidad Pedagógica (Guardrail)
                </span>
                <p className="text-xs m-0 leading-relaxed opacity-90">{selectedRec.rationale}</p>
              </div>

              <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#12141A] border-[#2A2F3D]' : 'bg-black/40 border-white/10'
              }`}>
                <span className="opacity-60">Nivel de Confianza:</span>
                <span className="font-mono font-black tabular-numbers">
                  {(selectedRec.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <p className={`text-[9px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {selectedRec.prediction_id} · {selectedRec.resource_id} · {selectedRec.difficulty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <button
              onClick={() => void handleFeedback(selectedRec, 'aceptada')}
              disabled={savingId !== null}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 ${
                isMono ? 'bg-white text-black hover:bg-zinc-200' : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white shadow-glowBlue'
              }`}
            >
              <Check className="w-4 h-4" />
              Aceptar Sugerencia
            </button>
            <button
              onClick={() => void handleFeedback(selectedRec, 'descartada')}
              disabled={savingId !== null}
              className="py-2 px-3 bg-black/40 hover:bg-white/10 rounded-xl font-semibold text-xs border border-white/10 transition-colors flex items-center gap-1 disabled:opacity-40"
            >
              <X className="w-3.5 h-3.5" />
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
