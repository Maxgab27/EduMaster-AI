import React, { useEffect, useState } from 'react';
import {
  Users,
  CheckSquare,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  Mail,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { ApiMeta, ApiSubmission, AtRiskStudent, ThemeMode } from '../../types';
import {
  addSubmissionFeedback,
  gradeSubmission,
  listSubmissions,
} from '../../services/assessmentsApi';
import { listAtRiskStudents } from '../../services/riskApi';
import { writeAudit } from '../../services/auditSink';
import { getDemoActor } from '../../services/apiClient';
import { TeacherSpeedGraderModal } from './TeacherSpeedGraderModal';

interface SignatureReceipt {
  submissionId: string;
  signedBy: string;
  signatureHash?: string;
  auditLogId?: string;
  actorSource?: string;
  source: string;
  correlationId: string;
}

interface TeacherDashboardProps {
  theme?: ThemeMode;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ theme = 'monochrome' }) => {
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [risks, setRisks] = useState<AtRiskStudent[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<ApiSubmission | null>(null);
  const [isSpeedGraderOpen, setIsSpeedGraderOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<SignatureReceipt | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  useEffect(() => {
    const controller = new AbortController();
    listSubmissions(controller.signal)
      .then(response => {
        setSubmissions(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las entregas');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    listAtRiskStudents(controller.signal)
      .then(response => setRisks(response.data))
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el triaje de riesgo');
      });
    return () => controller.abort();
  }, [reloadKey]);

  const pendingCount = submissions.filter(submission => submission.status !== 'graded').length;
  const graded = submissions.filter(submission => submission.officialScore !== null);
  const average = graded.length
    ? (graded.reduce((sum, submission) => sum + (submission.officialScore ?? 0), 0) / graded.length).toFixed(1)
    : '—';

  const handleOpenGrader = (submission: ApiSubmission) => {
    setError(null);
    setActiveSubmission(submission);
    setIsSpeedGraderOpen(true);
  };

  const handleGradeConfirmed = async (
    submissionId: string,
    officialScore: number,
    feedback: string,
    signedBy: string,
  ) => {
    const response = await gradeSubmission(submissionId, { officialScore, feedback, signedBy });
    setSubmissions(prev => prev.map(item => (item.id === submissionId ? response.data : item)));
    setActiveSubmission(response.data);
    await writeAudit({
      action: 'submissions.graded',
      correlationId: response.meta.correlationId,
      onlyDemo: true,
      detail: {
        id: submissionId,
        officialScore,
        estimatedAiScore: response.data.estimatedAiScore,
        signedBy,
      },
    });
    const actor = getDemoActor();
    const hash = response.data.signatureHash ? ` · SHA-256 ${response.data.signatureHash.slice(0, 12)}…` : '';
    const auditRef = response.data.auditLogId ? ` · audit_log_id ${response.data.auditLogId.slice(0, 14)}…` : '';
    const actorRef = response.data.actorSource ? ` · actor_source ${response.data.actorSource}` : ` · X-Actor ${actor.name} (${actor.role}, sin verificar)`;
    setLastSignature({
      submissionId,
      signedBy: response.data.signedBy ?? signedBy,
      signatureHash: response.data.signatureHash,
      auditLogId: response.data.auditLogId,
      actorSource: response.data.actorSource,
      source: response.meta.source,
      correlationId: response.meta.correlationId,
    });
    setActionNotice(
      `✓ Nota ${officialScore}/${response.data.rubricScores.reduce((sum, row) => sum + row.maxPts, 0)} firmada por ${signedBy} y registrada en ${response.meta.source.toUpperCase()}${hash}${auditRef}${actorRef}. Sin publicación en actas reales.`,
    );
  };

  const handleFeedbackSaved = async (
    submissionId: string,
    feedback: string,
    signedBy: string,
  ) => {
    const response = await addSubmissionFeedback(submissionId, { feedback, signedBy });
    setSubmissions(prev => prev.map(item => (item.id === submissionId ? response.data : item)));
    setActiveSubmission(response.data);
    await writeAudit({
      action: 'submissions.feedback',
      correlationId: response.meta.correlationId,
      onlyDemo: true,
      detail: { id: submissionId, signedBy, status: response.data.status },
    });
    setActionNotice(`✓ Feedback de ${signedBy} guardado. Estado: ${response.data.status}. La nota oficial permanece sin publicar.`);
  };

  const handleSendIntervention = (student: AtRiskStudent) => {
    setRisks(prev => prev.map(risk => (risk.id === student.id ? { ...risk, interventionSent: true } : risk)));
    void writeAudit({
      action: 'teacher.intervention_recorded',
      detail: { studentId: student.id, source: 'demo', realMessageSent: false },
    });
    setActionNotice(`✓ Mentoría registrada localmente para ${student.name} (demo: no se envió ningún mensaje real).`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all shadow-md ${
        isLight
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-200 text-slate-900'
          : isMono
          ? 'bg-[#181C26] border-[#3B4254] text-zinc-100'
          : 'bg-gradient-to-r from-[#06152B] via-[#0A2540] to-[#0A1F3D] border-emerald-500/30 text-white'
      }`}>
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : isMono ? 'bg-[#262B37] border-[#3B4254] text-white' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}>
              {meta?.source === 'api' ? 'ESPACIO DOCENTE · API REAL · DATOS SINTÉTICOS' : 'ESPACIO DOCENTE • DEMO'}
            </span>
            <span className="text-xs opacity-60">
              {meta ? `${meta.source.toUpperCase()} · ${meta.correlationId.slice(0, 12)}` : 'cargando fuente...'}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-black tracking-tight m-0">
            Panel de Gestión Pedagógica & Calificación Rápida
          </h1>
          <p className="text-xs opacity-80 leading-relaxed m-0">
            Bandeja DEMO con <strong>{submissions.length} entregas</strong> y <strong>{pendingCount} pendientes de firma</strong>. La IA solo propone; la nota oficial la emite el docente.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => { setLoading(true); setReloadKey(key => key + 1); }}
            title="Recargar entregas"
            className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {pendingCount > 0 && (
            <button
              onClick={() => {
                const next = submissions.find(item => item.status !== 'graded');
                if (next) handleOpenGrader(next);
              }}
              className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 ${
                isLight
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : isMono
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                  : 'bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Iniciar SpeedGrader ({pendingCount})
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className={`text-xs p-3 rounded-xl border flex items-center gap-2 ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded shrink-0">
            Human-in-the-loop
          </span>
        </div>
      )}

      {lastSignature && (
        <div className={`p-3 rounded-2xl border text-[11px] space-y-1 ${
          isLight ? 'bg-white border-slate-200 text-slate-700' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-200' : 'glass-panel border-edumaster-cardBorder text-slate-200'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            <Award className="w-4 h-4 text-emerald-400" /> Comprobante de firma · {lastSignature.submissionId}
          </div>
          <div className="font-mono flex flex-wrap gap-x-4 gap-y-1 opacity-90">
            <span>fuente: {lastSignature.source.toUpperCase()}</span>
            <span>firmado por: {lastSignature.signedBy}</span>
            <span>correlation_id: {lastSignature.correlationId}</span>
            <span>SHA-256: {lastSignature.signatureHash ? `${lastSignature.signatureHash.slice(0, 18)}…` : 'no disponible en DEMO local'}</span>
            <span>audit_log_id: {lastSignature.auditLogId ?? 'no disponible en DEMO local'}</span>
            <span>actor_source: {lastSignature.actorSource ?? 'body_unverified (DEMO)'}</span>
          </div>
          <p className="m-0 opacity-70">El backend solo devuelve hash, audit_log_id y actor_source cuando la firma va por API real; en DEMO local se muestran como no disponibles.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>Entregas registradas</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight">{submissions.length}</div>
          <p className="text-[11px] opacity-70 mt-1 m-0">Dataset DEMO · {meta ? meta.source : '...'}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>Por calificar</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight">{pendingCount}</div>
          <p className="text-[11px] opacity-70 mt-1 m-0">Requieren firma docente</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>En riesgo (DEMO)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-rose-400">
            {risks.filter(risk => risk.riskScore > 65).length}
          </div>
          <p className="text-[11px] text-rose-400 font-medium mt-1 m-0">Cabeza C · riesgo &gt; 65%</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>Promedio oficial (DEMO)</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight">
            {average} <span className="text-xs opacity-60 font-normal">/ 20</span>
          </div>
          <p className="text-[11px] opacity-70 mt-1 m-0">{graded.length} nota(s) firmada(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-6 rounded-3xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-4">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 m-0">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  Bandeja de Calificación Rápida
                </h2>
                <p className="text-xs opacity-60 m-0">
                  Evidencias con propuesta asistida; sin nota oficial hasta la firma.
                </p>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : isMono ? 'bg-[#222734] border-[#3B4254] text-zinc-300' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              }`}>
                {pendingCount} pendientes
              </span>
            </div>

            <div className="space-y-3">
              {loading && (
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Cargando entregas...</p>
              )}
              {submissions.map(submission => (
                <div
                  key={submission.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    submission.status === 'graded'
                      ? (isLight ? 'bg-slate-50 border-slate-200 opacity-80' : isMono ? 'bg-[#181C26] border-[#2A2F3D]' : 'bg-[#06152B]/60 border-white/10')
                      : (isLight ? 'bg-white border-slate-200 hover:border-slate-300' : isMono ? 'bg-[#1C202B] border-[#2A2F3D] hover:border-[#3B4254]' : 'bg-[#0A1F3D] border-edumaster-cardBorder hover:border-edumaster-cyan/50')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {submission.avatar ? (
                      <img
                        src={submission.avatar}
                        alt={submission.studentName}
                        className="w-10 h-10 rounded-full object-cover border border-inherit shrink-0"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border border-inherit shrink-0 ${
                        isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white'
                      }`}>
                        {initials(submission.studentName)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-bold m-0">{submission.studentName}</h3>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          submission.status === 'graded'
                            ? 'border-emerald-500/40 text-emerald-400'
                            : submission.status === 'in_review'
                            ? 'border-amber-500/40 text-amber-400'
                            : 'border-white/20 opacity-70'
                        }`}>
                          {submission.status}
                        </span>
                        <span className="text-[10px] opacity-60 font-mono">• {submission.submittedAt.slice(0, 10)}</span>
                      </div>
                      <p className="text-[11px] opacity-80 m-0 font-medium">{submission.assignmentTitle}</p>
                      <p className="text-[10px] opacity-60 m-0">{submission.course}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      {submission.status === 'graded' && submission.officialScore !== null ? (
                        <div>
                          <span className="text-[10px] opacity-60 block">Nota oficial</span>
                          <span className="text-sm font-black font-mono text-emerald-400">
                            {submission.officialScore} / 20
                          </span>
                          <span className="text-[10px] block opacity-60">{submission.signedBy}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] opacity-60 block flex items-center gap-1 justify-end">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            Propuesta IA (DEMO)
                          </span>
                          <span className="text-xs font-bold font-mono text-amber-400">
                            {submission.estimatedAiScore} / 20 pts
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenGrader(submission)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        submission.status === 'graded'
                          ? (isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : isMono ? 'bg-[#262B37] text-zinc-300 hover:text-white' : 'bg-white/10 text-slate-200 hover:bg-white/20')
                          : (isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : isMono ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white')
                      }`}
                    >
                      {submission.status === 'graded' ? 'Ver / Editar' : 'Calificar con rúbrica'}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {!loading && submissions.length === 0 && (
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No hay entregas registradas.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className={`p-6 rounded-3xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-4">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 m-0">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Triaje de Riesgo de Abandono
                </h2>
                <p className="text-xs opacity-60 m-0">Inferencia Cabeza C sobre datos sintéticos · no califica al estudiante.</p>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                Alerta temprana
              </span>
            </div>

            <div className="space-y-3">
              {risks.map(student => (
                <div
                  key={student.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    student.status === 'critical'
                      ? (isLight ? 'bg-rose-50/70 border-rose-200' : isMono ? 'bg-[#211618] border-[#4A262A]' : 'bg-rose-500/10 border-rose-500/30')
                      : (isLight ? 'bg-amber-50/70 border-amber-200' : isMono ? 'bg-[#201C16] border-[#473B24]' : 'bg-amber-500/10 border-amber-500/30')
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-8 h-8 rounded-full object-cover border border-inherit"
                      />
                      <div>
                        <h3 className="text-xs font-bold m-0">{student.name}</h3>
                        <p className="text-[10px] opacity-60 m-0">{student.course}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold block text-rose-400">
                        Riesgo: {student.riskScore}%
                      </span>
                      <span className="text-[10px] opacity-60">{student.daysInactive} días inactivo</span>
                      {student.interventionSent && (
                        <span className="text-[10px] font-bold block text-emerald-400">Mentoría registrada (demo)</span>
                      )}
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                    isLight ? 'bg-white/80 border-slate-200 text-slate-800' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-300' : 'bg-[#06152B] border-white/10 text-slate-300'
                  }`}>
                    <strong>Sugerencia pedagógica:</strong> {student.suggestedAction}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleSendIntervention(student)}
                      disabled={student.interventionSent}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                        isLight
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : isMono
                          ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200'
                          : 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      {student.interventionSent ? 'Mentoría registrada' : 'Registrar mentoría (demo)'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-3 rounded-2xl border text-[11px] mt-4 flex items-start gap-2 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : isMono ? 'bg-[#181C26] border-[#2A2F3D] text-zinc-400' : 'bg-[#06152B] border-white/10 text-slate-400'
            }`}>
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Gobernanza ética:</strong> esta alerta no califica negativamente al estudiante; sirve como indicador de apoyo.
              </span>
            </div>
          </div>
        </div>
      </div>

      <TeacherSpeedGraderModal
        key={activeSubmission?.id ?? 'none'}
        submission={activeSubmission}
        isOpen={isSpeedGraderOpen}
        onClose={() => setIsSpeedGraderOpen(false)}
        onGradeConfirmed={handleGradeConfirmed}
        onFeedbackSaved={handleFeedbackSaved}
        theme={theme}
      />
    </div>
  );
};
