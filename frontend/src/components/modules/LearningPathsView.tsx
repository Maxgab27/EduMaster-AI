import React, { useEffect, useState } from 'react';
import { Map, CheckCircle2, ArrowRight, Clock, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import type { ApiLearningPath, ApiMeta, ApiPathStep, ThemeMode } from '../../types';
import { listPaths, updatePathProgress } from '../../services/learningPathsApi';
import { writeAudit } from '../../services/auditSink';

interface LearningPathsViewProps {
  theme?: ThemeMode;
}

export const LearningPathsView: React.FC<LearningPathsViewProps> = ({ theme = 'monochrome' }) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const [paths, setPaths] = useState<ApiLearningPath[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyStep, setBusyStep] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    listPaths(controller.signal)
      .then(response => {
        setPaths(response.data);
        setMeta(response.meta);
        setSelectedPath(prev => prev && response.data.some(path => path.id === prev) ? prev : response.data[0]?.id ?? null);
        setError(null);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las rutas');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const current = paths.find(path => path.id === selectedPath) ?? paths[0] ?? null;

  const handleContinue = async (step: ApiPathStep) => {
    if (!current || busyStep) return;
    setBusyStep(step.id);
    setError(null);
    setNotice(null);
    try {
      const response = await updatePathProgress(current.id, {
        stepId: step.id,
        completed: true,
        source: 'manual',
      });
      setPaths(prev => prev.map(path => (path.id === current.id ? response.data : path)));
      await writeAudit({
        action: 'learning_path.progress_changed',
        correlationId: response.meta.correlationId,
        onlyDemo: true,
        detail: { pathId: current.id, stepId: step.id, completed: true, source: 'manual' },
      });
      setNotice(`Hito "${step.name}" completado. Progreso actual: ${response.data.progress}%.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el progreso');
    } finally {
      setBusyStep(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <Map className={`w-5 h-5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
            Planes y Rutas de Aprendizaje Curriculares
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Progreso por hito persistido en {meta ? meta.source.toUpperCase() : '...'}. Cambios auditados con correlación.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            {meta ? `${meta.source.toUpperCase()} · ${meta.correlationId.slice(0, 10)}` : 'CARGANDO'}
          </span>
          <button
            onClick={() => { setLoading(true); setReloadKey(key => key + 1); }}
            title="Recargar rutas"
            className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <p className={`text-xs p-3 rounded-xl border flex items-center gap-2 ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {notice && (
        <p className={`text-xs p-3 rounded-xl border ${
          isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          {notice}
        </p>
      )}

      {!loading && paths.length > 1 && (
        <div className="flex gap-2 w-full sm:w-auto">
          {paths.map(path => {
            const isSelected = current?.id === path.id;
            return (
              <button
                key={path.id}
                onClick={() => {
                  setSelectedPath(path.id);
                  setNotice(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? (isLight
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : isMono
                        ? 'bg-white border-white text-zinc-950 font-black'
                        : 'bg-edumaster-blue border-edumaster-cyan text-white shadow-glowBlue')
                    : (isLight
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        : isMono
                        ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-300 hover:text-white'
                        : 'bg-[#0A1F3D] border-edumaster-cardBorder text-slate-300 hover:text-white')
                }`}
              >
                {path.title.split(' ').slice(0, 2).join(' ')}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Cargando rutas desde {meta ? meta.source : 'la fuente configurada'}...</p>
      ) : !current ? (
        <p className={`text-xs p-4 rounded-xl border ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          No hay rutas disponibles.
        </p>
      ) : (
        <div className={`p-6 border rounded-2xl transition-colors ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-900'
            : isMono
            ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100'
            : 'glass-panel border-edumaster-cardBorder text-slate-100'
        }`}>
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b ${
            isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder'
          }`}>
            <div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : isMono
                  ? 'bg-[#242A38] border-[#3B4254] text-white'
                  : 'bg-edumaster-blue/20 border-edumaster-cyan/40 text-edumaster-cyan'
              }`}>
                Ruta DEMO · plan curricular
              </span>
              <h2 className="text-lg font-black mt-2 mb-1 tracking-tight">{current.title}</h2>
              <p className={`text-xs m-0 max-w-2xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {current.description}
              </p>
            </div>

            <div className={`flex items-center gap-6 shrink-0 p-4 rounded-xl border ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : isMono
                ? 'bg-[#1C202B] border-[#2A2F3D] text-white'
                : 'bg-[#06152B] border-edumaster-cardBorder text-white'
            }`}>
              <div>
                <span className={`text-[10px] block font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Duración total
                </span>
                <span className="text-xs font-bold font-mono flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 opacity-70" /> {current.duration}
                </span>
              </div>
              <div>
                <span className={`text-[10px] block font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Progreso de ruta
                </span>
                <span className={`text-xs font-black font-mono mt-0.5 block ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}>
                  {current.progress}%
                </span>
              </div>
              <div>
                <span className={`text-[10px] block font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Cursos
                </span>
                <span className="text-xs font-bold font-mono mt-0.5 block">{current.coursesCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${
              isLight ? 'text-slate-700' : isMono ? 'text-zinc-300' : 'text-slate-300'
            }`}>
              Secuencia de hitos y prerrequisitos
            </h3>

            <div className="space-y-3">
              {current.steps.map((step, index) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      isCompleted
                        ? (isLight
                            ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-sm'
                            : isMono
                            ? 'bg-[#18231C] border-[#2A4733] text-white'
                            : 'bg-emerald-950/30 border-emerald-500/50 text-white')
                        : isCurrent
                        ? (isLight
                            ? 'bg-blue-50/80 border-blue-400 text-slate-900 shadow-sm'
                            : isMono
                            ? 'bg-[#1C2436] border-[#384A6E] text-white'
                            : 'bg-edumaster-blue/20 border-edumaster-cyan text-white shadow-glowBlue')
                        : (isLight
                            ? 'bg-slate-100/70 border-slate-200 text-slate-700'
                            : isMono
                            ? 'bg-[#12151D] border-[#222734] text-zinc-400'
                            : 'bg-[#06152B]/60 border-slate-800 text-slate-400')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCompleted
                          ? (isLight ? 'bg-emerald-600 text-white' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-emerald-500 text-slate-950')
                          : isCurrent
                          ? (isLight ? 'bg-blue-600 text-white' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-cyan text-slate-950 font-black')
                          : (isLight ? 'bg-slate-300 text-slate-700' : 'bg-[#202532] text-zinc-400')
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isCurrent ? index + 1 : <Lock className="w-3.5 h-3.5 opacity-70" />}
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${
                          isCompleted || isCurrent
                            ? (isLight ? 'text-slate-900 font-extrabold' : 'text-white')
                            : (isLight ? 'text-slate-700 font-medium' : 'text-zinc-300')
                        }`}>
                          {step.name}
                        </span>
                        <span className={`text-[11px] block mt-0.5 ${
                          isCompleted
                            ? (isLight ? 'text-emerald-800 font-semibold' : 'text-emerald-300')
                            : isCurrent
                            ? (isLight ? 'text-blue-800 font-semibold' : 'text-blue-300')
                            : (isLight ? 'text-slate-500' : 'text-zinc-500')
                        }`}>
                          {isCompleted
                            ? 'Hito completado'
                            : isCurrent
                            ? 'Módulo actual · listo para registrar avance'
                            : 'Bloqueado por prerrequisitos'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                        isCompleted
                          ? (isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : isMono ? 'bg-[#223326] border-[#2A4733] text-emerald-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300')
                          : isCurrent
                          ? (isLight ? 'bg-blue-100 border-blue-300 text-blue-900' : isMono ? 'bg-[#253048] border-[#384A6E] text-blue-300' : 'bg-blue-500/20 border-blue-400 text-blue-300')
                          : (isLight ? 'bg-slate-200 border-slate-300 text-slate-600' : isMono ? 'bg-[#1A1D27] border-[#222734] text-zinc-500' : 'bg-white/5 border-white/10 text-slate-500')
                      }`}>
                        {step.score || 'Pendiente'}
                      </span>

                      {isCurrent && (
                        <button
                          onClick={() => void handleContinue(step)}
                          disabled={busyStep === step.id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 ${
                            isLight
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : isMono
                              ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200'
                              : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white shadow-glowBlue'
                          }`}
                        >
                          {busyStep === step.id ? 'Registrando...' : 'Continuar'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
