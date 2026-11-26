import React, { useEffect, useState } from 'react';
import { CheckSquare, ShieldAlert, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import type { ApiAssessment, ApiMeta, ApiSubmission, ThemeMode, UserRole, NavTab } from '../../types';
import { listAssessments, listSubmissions, gradeSubmission, addSubmissionFeedback } from '../../services/assessmentsApi';
import { TeacherSpeedGraderModal } from '../teacher/TeacherSpeedGraderModal';
import { getDemoActor } from '../../services/apiClient';

interface AssessmentsViewProps {
  theme?: ThemeMode;
  role?: UserRole;
  onNavigateTab?: (tab: NavTab) => void;
}

interface SignatureReceipt {
  submissionId: string;
  signedBy: string;
  signatureHash?: string;
  auditLogId?: string;
  actorSource?: string;
  source: string;
  correlationId: string;
}

function score(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : value.toFixed(1);
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({ 
  theme = 'monochrome', 
  role = 'estudiante',
  onNavigateTab 
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';
  const canGrade = role !== 'estudiante';

  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // SpeedGrader modal state
  const [activeSubmission, setActiveSubmission] = useState<ApiSubmission | null>(null);
  const [isSpeedGraderOpen, setIsSpeedGraderOpen] = useState(false);
  const [lastSignature, setLastSignature] = useState<SignatureReceipt | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleOpenSpeedGrader = (sub: ApiSubmission) => {
    setActiveSubmission(sub);
    setIsSpeedGraderOpen(true);
    setActionNotice(null);
  };

  const handleGradeConfirmed = async (
    submissionId: string,
    officialScore: number,
    feedback: string,
    signedBy: string,
  ) => {
    setActionNotice(null);
    try {
      const response = await gradeSubmission(submissionId, { officialScore, feedback, signedBy });
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === submissionId
            ? {
                ...sub,
                officialScore: response.data.officialScore,
                status: 'graded' as const,
                signedBy: response.data.signedBy,
                feedback: feedback || sub.feedback,
              }
            : sub,
        ),
      );
      setLastSignature({
        submissionId,
        signedBy: response.data.signedBy || signedBy,
        signatureHash: response.data.signatureHash ?? undefined,
        auditLogId: response.data.auditLogId ?? undefined,
        actorSource: response.data.actorSource ?? undefined,
        source: response.meta.source,
        correlationId: response.meta.correlationId,
      });
      setActionNotice(
        `Entrega ${submissionId} firmada por ${response.data.signedBy || signedBy}. Hash SHA-256 inmutable registrado.`,
      );
    } catch (err) {
      setActionNotice(err instanceof Error ? err.message : 'Error al confirmar calificación');
    }
  };

  const handleFeedbackSaved = async (submissionId: string, feedback: string) => {
    try {
      await addSubmissionFeedback(submissionId, { feedback, signedBy: getDemoActor().name });
      setSubmissions(prev =>
        prev.map(sub => (sub.id === submissionId ? { ...sub, feedback } : sub)),
      );
    } catch {
      // Manejo silencioso en fallback
    }
  };

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

                    {canGrade && (
                      <button
                        onClick={() => handleOpenSpeedGrader(submission)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0 ${
                          submission.status === 'graded'
                            ? isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-slate-200'
                            : isLight ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20' : isMono ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white shadow-glowBlue'
                        }`}
                        title="Calificar con rúbrica interactiva y firma criptográfica SHA-256"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        {submission.status === 'graded' ? 'Re-calificar' : 'Calificar (SpeedGrader)'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {submissions.length === 0 && (
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No hay entregas registradas.</p>
              )}
            </div>

            {/* Recibo Criptográfico de Última Firma Docente */}
            {lastSignature && (
              <div className={`mt-5 p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in ${
                isLight 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm' 
                  : isMono 
                  ? 'bg-[#18261E] border-[#2A4835] text-emerald-200' 
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-glowCyan'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-xs">
                      Comprobante de Calificación Firmada (Human-in-the-Loop)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Ley 29733 Auditada
                    </span>
                  </div>
                  <p className="text-[11px] opacity-85 m-0 font-mono">
                    ID Entrega: {lastSignature.submissionId} · Docente: {lastSignature.signedBy} · Fuente: {lastSignature.actorSource || 'header'}
                  </p>
                  {lastSignature.signatureHash && (
                    <p className="text-[10px] font-mono opacity-80 m-0 break-all">
                      Hash SHA-256: <strong className="text-emerald-400">{lastSignature.signatureHash}</strong>
                    </p>
                  )}
                </div>

                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('governance')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shrink-0 ${
                      isLight 
                        ? 'bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100' 
                        : isMono 
                        ? 'bg-white text-zinc-950 font-black border-white hover:bg-zinc-200' 
                        : 'bg-emerald-500/20 border-emerald-500/50 text-white hover:bg-emerald-500/30'
                    }`}
                  >
                    Ver en Registro de Auditoría
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {actionNotice && !lastSignature && (
              <div className={`mt-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                isLight ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {actionNotice}
              </div>
            )}
          </div>

          {/* Modal Interactivo de SpeedGrader */}
          <TeacherSpeedGraderModal
            isOpen={isSpeedGraderOpen}
            submission={activeSubmission}
            onClose={() => setIsSpeedGraderOpen(false)}
            onGradeConfirmed={handleGradeConfirmed}
            onFeedbackSaved={handleFeedbackSaved}
            theme={theme}
          />
        </>
      )}
    </div>
  );
};
