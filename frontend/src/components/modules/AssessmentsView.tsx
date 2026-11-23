import React, { useEffect, useState } from 'react';
import { CheckSquare, ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';
import type { ApiAssessment, ApiMeta, ApiSubmission, ThemeMode, UserRole } from '../../types';
import { listAssessments, listSubmissions } from '../../services/assessmentsApi';

interface AssessmentsViewProps {
  theme?: ThemeMode;
  role?: UserRole;
}

function score(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : value.toFixed(1);
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({ theme = 'monochrome', role = 'estudiante' }) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';
  const canGrade = role !== 'estudiante';

  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([listAssessments(controller.signal), listSubmissions(controller.signal)])
      .then(([assessmentResponse, submissionResponse]) => {
        setAssessments(assessmentResponse.data);
        setSubmissions(submissionResponse.data);
        setMeta(assessmentResponse.meta);
        setError(null);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las evaluaciones');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <CheckSquare className={`w-5 h-5 ${isLight ? 'text-emerald-600' : isMono ? 'text-zinc-200' : 'text-emerald-400'}`} />
            Evaluaciones, Rúbricas y Evidencias Académicas
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Comparador de nota oficial vs estimación IA. Fuente: {meta ? meta.source.toUpperCase() : '...'}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md border ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            DEMO · SIN VALOR OFICIAL
          </span>
          <button
            onClick={() => { setLoading(true); setReloadKey(key => key + 1); }}
            title="Recargar evaluaciones"
            className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
        isLight
          ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
          : isMono
          ? 'bg-[#181C26] border-[#3B4254] text-zinc-200'
          : 'bg-[#0A1F3D] border-edumaster-blue/40 text-slate-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <ShieldAlert className={`w-4 h-4 shrink-0 ${isLight ? 'text-blue-700' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
          <span>
            <strong>Principio de Autoridad Docente:</strong> Las predicciones de aprendizaje no modifican actas ni sustituyen el juicio del docente responsable. La nota oficial solo existe cuando está firmada.
          </span>
        </div>
        <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-md border shrink-0 ${
          isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : isMono ? 'bg-[#202532] border-[#3B4254] text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          Regla Auditada
        </span>
      </div>

      {error && (
        <p className={`text-xs p-3 rounded-xl border flex items-center gap-2 ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      {loading ? (
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Cargando evaluaciones...</p>
      ) : (
        <>
          <div className="space-y-4">
            {assessments.map(assessment => (
              <div
                key={assessment.id}
                className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm text-slate-900'
                    : isMono
                    ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100'
                    : 'glass-panel border-edumaster-cardBorder text-slate-100'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                      isLight ? 'bg-blue-50 border-blue-200 text-blue-800' : isMono ? 'bg-[#242A38] border-[#3B4254] text-white' : 'bg-edumaster-blue/20 text-edumaster-cyan border-edumaster-cyan/30'
                    }`}>
                      Ponderación: {assessment.weight}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                      assessment.status === 'Disponible'
                        ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30')
                        : assessment.status === 'En Calificación'
                        ? (isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/20 text-amber-300 border-amber-500/30')
                        : (isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300')
                    }`}>
                      {assessment.status}
                    </span>
                    <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Vence: {assessment.dueDate}</span>
                  </div>
                  <h3 className="text-sm font-black mb-1 leading-snug tracking-tight">{assessment.title}</h3>
                  <p className={`text-xs m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{assessment.course}</p>
                  <p className={`text-[10px] font-mono mt-2 m-0 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                    {assessment.note}
                  </p>
                </div>

                <div className={`flex items-center gap-5 p-3 rounded-xl border shrink-0 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : isMono
                    ? 'bg-[#1C202B] border-[#2A2F3D] text-white'
                    : 'bg-[#06152B] border-edumaster-cardBorder text-white'
                }`}>
                  <div className="text-center">
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Intentos</span>
                    <span className="font-mono font-bold text-xs">{assessment.attempts}</span>
                  </div>
                  <div className={`w-px h-8 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                  <div className="text-center">
                    <span className={`text-[10px] block font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Nota oficial (demo)</span>
                    <span className={`font-mono font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {score(assessment.officialAvg)} / {assessment.maxScore}
                    </span>
                  </div>
                  <div className={`w-px h-8 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                  <div className="text-center">
                    <span className={`text-[10px] block font-bold ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>Score IA (ref.)</span>
                    <span className={`font-mono font-black text-sm ${isLight ? 'text-purple-800' : 'text-purple-300'}`}>
                      {score(assessment.predictiveEst)} / {assessment.maxScore}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`p-6 rounded-3xl border ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-4">
              <div>
                <h2 className="text-sm font-bold m-0">Entregas: estimación asistida vs calificación firmada</h2>
                <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {canGrade
                    ? 'Usa el SpeedGrader del panel docente para firmar la nota oficial.'
                    : 'Solo el docente responsable puede publicar la nota oficial.'}
                </p>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-slate-300'
              }`}>
                {submissions.length} entregas
              </span>
            </div>

            <div className="space-y-3">
              {submissions.map(submission => (
                <div
                  key={submission.id}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#06152B]/60 border-edumaster-cardBorder'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold m-0">{submission.studentName}</p>
                    <p className={`text-[11px] m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {submission.assignmentTitle}
                    </p>
                    <p className={`text-[10px] font-mono mt-1 m-0 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      {submission.id} · {submission.status}
                      {submission.signedBy ? ` · firmado por ${submission.signedBy}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Estimación IA</span>
                      <span className={`font-mono font-bold text-xs ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                        {submission.estimatedAiScore.toFixed(1)}
                      </span>
                    </div>
                    <div className={`w-px h-7 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                    <div className="text-center">
                      <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Nota oficial</span>
                      <span className={`font-mono font-black text-sm ${
                        submission.officialScore === null
                          ? isLight ? 'text-slate-500' : 'text-slate-500'
                          : isLight ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        {submission.officialScore === null ? 'Pendiente' : submission.officialScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {submissions.length === 0 && (
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No hay entregas registradas.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
