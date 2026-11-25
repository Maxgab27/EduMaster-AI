import React, { useEffect, useState } from 'react';
import { BarChart3, Download, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import type {
  AnalyticsProgress,
  AnalyticsSkillMastery,
  ApiMeta,
  ThemeMode,
} from '../../types';
import { COHORT_OPTIONS, getAnalyticsProgress, getAnalyticsSkillMastery } from '../../services/analyticsApi';
import { writeAudit } from '../../services/auditSink';

interface AnalyticsViewProps {
  theme?: ThemeMode;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ theme = 'monochrome' }) => {
  const [cohort, setCohort] = useState('todos');
  const [progress, setProgress] = useState<AnalyticsProgress | null>(null);
  const [skills, setSkills] = useState<AnalyticsSkillMastery | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getAnalyticsProgress(cohort, controller.signal),
      getAnalyticsSkillMastery(controller.signal),
    ])
      .then(([progressResponse, skillsResponse]) => {
        setProgress(progressResponse.data);
        setSkills(skillsResponse.data);
        setMeta(progressResponse.meta);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar la analítica');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [cohort, reloadKey]);

  const handleExport = async () => {
    if (!progress || !skills) return;
    const cutoff = new Date().toISOString();
    const source = progress.label || meta?.source || 'demo';
    const correlation = meta?.correlationId || 'local';
    const context = [cohort, cutoff, source, correlation];
    const rows = [
      ['seccion', 'campo', 'valor', 'cohorte', 'fecha_corte_utc', 'fuente', 'correlation_id'],
      ['metadata', 'exportacion', 'CSV DEMO · datos sintéticos', ...context],
      ...progress.series.map(point => ['progreso', point.label, percent(point.completion), ...context]),
      ...progress.series.map(point => ['progreso_activos', point.label, String(point.activeStudents), ...context]),
      ...progress.series.map(point => ['evaluaciones', point.label, String(point.assessments), ...context]),
      ...skills.skills.map(skill => ['dominio', skill.skill, percent(skill.level), ...context]),
    ];
    const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `analitica-${cohort}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice(`CSV generado con ${rows.length - 2} filas de datos · cohorte ${cohort} · corte ${cutoff.slice(0, 10)} · fuente ${source.slice(0, 14)}… · ID ${correlation.slice(0, 14)}.`);
    await writeAudit({
      action: 'analytics.export_csv',
      detail: { cohort, rows: rows.length - 1 },
    });
  };

  const maxStudents = Math.max(1, ...(progress?.series.map(point => point.activeStudents) ?? [1]));
  const maxAssessments = Math.max(1, ...(progress?.series.map(point => point.assessments) ?? [1]));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <BarChart3 className={`w-5 h-5 ${isLight ? 'text-purple-600' : isMono ? 'text-zinc-200' : 'text-edumaster-violet'}`} />
            Analítica Educativa & Desempeño Institucional
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Series y dominio calculados desde eventos sintéticos. No son notas oficiales ni evidencia pedagógica.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={cohort}
            onChange={event => {
              setLoading(true);
              setError(null);
              setCohort(event.target.value);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
              isLight ? 'bg-white border-slate-300 text-slate-800' : isMono ? 'bg-[#202532] border-[#3B4254] text-zinc-200' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-slate-200'
            }`}
          >
            {COHORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <span className={`text-[10px] font-mono px-2 py-1.5 rounded border ${
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
            className={`p-2 rounded-xl border transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'
            }`}
            title="Recargar filtro"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => void handleExport()}
            disabled={!progress || !skills}
            className={`px-3 py-1.5 border text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40 ${
              isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : isMono ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' : 'bg-edumaster-blue text-white hover:bg-edumaster-blue/80'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
          isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

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
          Calculando series desde {meta?.source === 'api' ? 'la API' : 'el adaptador DEMO'}...
        </div>
      ) : progress && skills ? (
        <>
          <div className={`p-4 rounded-2xl border text-xs ${
            isLight ? 'bg-blue-50 border-blue-200 text-blue-900' : isMono ? 'bg-[#1C2436] border-[#384A6E] text-white' : 'bg-[#0A1F3D] border-edumaster-cyan/40 text-slate-200'
          }`}>
            <strong>Fuente:</strong> {progress.label} · <strong>Corte:</strong> {COHORT_OPTIONS.find(option => option.value === cohort)?.label ?? cohort}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
            }`}>
              <h3 className="text-sm font-bold m-0 mb-1">Progreso semanal de finalización</h3>
              <p className={`text-[11px] mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Promedio de completion_ratio por ventana; no equivale a nota oficial.
              </p>
              <div className="space-y-3">
                {progress.series.map(point => (
                  <div key={point.label}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-bold">{point.label}</span>
                      <span className="font-mono">{percent(point.completion)}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/10'}`}>
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: percent(point.completion) }} />
                    </div>
                    <div className={`flex justify-between text-[10px] mt-1 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span>{point.activeStudents} activos</span>
                      <span>{point.assessments} evaluaciones</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
            }`}>
              <h3 className="text-sm font-bold m-0 mb-1">Actividad derivada de eventos</h3>
              <p className={`text-[11px] mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Estudiantes activos y evaluaciones por semana, sobre la misma serie DEMO.
              </p>
              <div className={`h-44 flex items-end gap-2 pt-4 border-b px-2 ${isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder'}`}>
                {progress.series.map(point => (
                  <div key={point.label} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className={`text-[9px] font-mono opacity-0 group-hover:opacity-100 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {point.activeStudents}
                    </span>
                    <div
                      className={`w-full rounded-t-md ${isLight ? 'bg-blue-600' : isMono ? 'bg-white' : 'bg-gradient-to-t from-edumaster-blue to-edumaster-cyan'}`}
                      style={{ height: `${Math.max(6, (point.activeStudents / maxStudents) * 120)}px` }}
                    />
                    <span className={`text-[9px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      {point.label.replace('Semana ', 'S')}
                    </span>
                  </div>
                ))}
              </div>
              <div className={`mt-3 h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/10'}`}>
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${Math.round((progress.series.at(-1)?.assessments ?? 0) / maxAssessments * 100)}%` }}
                />
              </div>
              <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Última semana: {progress.series.at(-1)?.assessments ?? 0} evaluaciones registradas.
              </p>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
          }`}>
            <h3 className="text-sm font-bold m-0 mb-1">Dominio por competencia</h3>
            <p className={`text-[11px] mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{skills.label}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b text-[11px] ${isLight ? 'border-slate-200 text-slate-500' : isMono ? 'border-[#2A2F3D] text-zinc-400' : 'border-edumaster-cardBorder text-slate-400'}`}>
                    <th className="pb-3">Competencia</th>
                    <th className="pb-3">Nivel agregado</th>
                    <th className="pb-3">Evidencias</th>
                    <th className="pb-3">Certificación docente</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.skills.map(skill => (
                    <tr key={skill.skill} className={`border-b ${isLight ? 'border-slate-100' : isMono ? 'border-[#2A2F3D]/60' : 'border-edumaster-cardBorder/50'}`}>
                      <td className="py-3 font-bold">{skill.skill}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-24 h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/10'}`}>
                            <div
                              className={`h-full rounded-full ${skill.level >= 0.75 ? 'bg-emerald-500' : skill.level >= 0.6 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: percent(skill.level) }}
                            />
                          </div>
                          <span className="font-mono">{percent(skill.level)}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono">{skill.evidenceCount}</td>
                      <td className="py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${
                          skill.certifiedByDocent
                            ? isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}>
                          {skill.certifiedByDocent ? 'Sí' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`p-4 rounded-xl border text-[11px] flex items-start gap-2 ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : isMono ? 'bg-[#1C1812] border-[#3D3320] text-amber-200' : 'bg-[#06152B] border-amber-500/30 text-amber-300'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>
              <strong>Guardrail:</strong> el riesgo y el dominio son estimaciones DEMO. No deben usarse para sancionar ni para emitir notas oficiales sin revisión docente.
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
};
