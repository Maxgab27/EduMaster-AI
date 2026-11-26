import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldAlert,
  Code2,
  Award,
  AlertCircle,
  Save,
} from 'lucide-react';
import type { ApiSubmission, ThemeMode } from '../../types';
import { getDemoActor } from '../../services/apiClient';

interface TeacherSpeedGraderModalProps {
  submission: ApiSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onGradeConfirmed: (
    submissionId: string,
    officialScore: number,
    feedback: string,
    signedBy: string,
  ) => void | Promise<void>;
  onFeedbackSaved?: (
    submissionId: string,
    feedback: string,
    signedBy: string,
  ) => void | Promise<void>;
  theme?: ThemeMode;
}

interface ContentProps {
  submission: ApiSubmission;
  onClose: () => void;
  onGradeConfirmed: TeacherSpeedGraderModalProps['onGradeConfirmed'];
  onFeedbackSaved?: TeacherSpeedGraderModalProps['onFeedbackSaved'];
  theme: ThemeMode;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

const TeacherSpeedGraderModalContent: React.FC<ContentProps> = ({
  submission,
  onClose,
  onGradeConfirmed,
  onFeedbackSaved,
  theme,
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const [rubricScores, setRubricScores] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    submission.rubricScores.forEach((row, index) => {
      initial[index] = row.score;
    });
    return initial;
  });
  const [feedback, setFeedback] = useState(submission.feedback);
  const [signedBy, setSignedBy] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxTotal = submission.rubricScores.reduce((sum, row) => sum + row.maxPts, 0) || 20;
  const totalScore = Number(
    submission.rubricScores
      .reduce((sum, row, index) => sum + (rubricScores[index] ?? row.score), 0)
      .toFixed(1),
  );

  const demoActor = getDemoActor();
  const canSign = signedBy.trim().length >= 2
    && feedback.trim().length >= 5
    && totalScore <= maxTotal
    && !saving;

  const handleScoreChange = (index: number, value: number) => {
    setRubricScores(prev => ({ ...prev, [index]: value }));
  };

  const handleGenerateAiFeedback = () => {
    setFeedback(
      `[Borrador DEMO · requiere revisión docente]\n` +
      `La implementación presenta una estructura tensorial coherente. Valida el escalado de la atención y documenta el uso de dropout tras la proyección final. ` +
      `Este texto es una sugerencia automática: no constituye calificación oficial ni firma.`,
    );
  };

  const handleConfirm = async () => {
    if (!canSign) return;
    setSaving(true);
    setError(null);
    try {
      await onGradeConfirmed(submission.id, totalScore, feedback.trim(), signedBy.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo firmar la calificación');
    } finally {
      setSaving(false);
    }
  };

  const handleFeedbackOnly = async () => {
    if (!onFeedbackSaved || !signedBy.trim() || feedback.trim().length < 5 || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onFeedbackSaved(submission.id, feedback.trim(), signedBy.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la retroalimentación');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
    isLight
      ? 'bg-slate-50 border-slate-200 text-slate-900'
      : isMono
      ? 'bg-[#0E1117] border-[#2A2F3D] text-zinc-200'
      : 'bg-[#040D1A] border-edumaster-cardBorder text-slate-200'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xl animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl transition-colors backdrop-blur-2xl ${
        isLight
          ? 'bg-white/90 border-white/60 text-slate-900 shadow-2xl'
          : isMono
          ? 'bg-[#10141F]/90 border-white/15 text-zinc-100 shadow-2xl'
          : 'bg-[#06152B]/90 border-white/20 text-slate-100 shadow-2xl'
      }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'border-slate-200 bg-slate-50' : isMono ? 'border-[#2A2F3D] bg-[#1A1D24]' : 'border-edumaster-cardBorder bg-[#0A1F3D]'
        }`}>
          <div className="flex items-center gap-3">
            {submission.avatar ? (
              <img
                src={submission.avatar}
                alt={submission.studentName}
                className="w-10 h-10 rounded-full object-cover border border-inherit"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border border-inherit ${
                isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white'
              }`}>
                {initials(submission.studentName)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold m-0">{submission.studentName}</h2>
                <span className="text-[10px] font-mono opacity-60">ID: {submission.studentId}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  submission.status === 'graded'
                    ? 'border-emerald-500/40 text-emerald-400'
                    : submission.status === 'in_review'
                    ? 'border-amber-500/40 text-amber-400'
                    : 'border-white/20 opacity-70'
                }`}>
                  {submission.status}
                </span>
              </div>
              <p className="text-xs opacity-70 m-0">
                {submission.assignmentTitle} • {submission.course}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] opacity-60 uppercase font-mono block">Rúbrica calculada</span>
              <span className={`text-lg font-black font-mono ${
                totalScore > maxTotal
                  ? 'text-rose-400'
                  : totalScore >= maxTotal * 0.8
                  ? 'text-emerald-400'
                  : totalScore >= maxTotal * 0.6
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}>
                {totalScore} <span className="text-xs opacity-60 font-normal">/ {maxTotal}</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors ${
                isLight ? 'hover:bg-slate-200 border-slate-300 text-slate-700' : isMono ? 'hover:bg-[#202532] border-[#2A2F3D] text-zinc-300' : 'hover:bg-white/10 border-white/10 text-slate-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`px-6 py-2 border-b flex items-center justify-between text-xs ${
          isLight
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : isMono
            ? 'bg-[#1C1A16] border-[#3D3425] text-amber-200'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              <strong>Autoridad docente:</strong> la IA estimó {submission.estimatedAiScore} pts, pero la nota oficial solo existe con tu firma. El backend rechaza notas por encima de la rúbrica y sin <code>signedBy</code>.
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-current shrink-0">
            Human-in-the-loop
          </span>
        </div>

        {error && (
          <div className={`px-6 py-2 text-xs flex items-center gap-2 ${
            isLight ? 'bg-rose-50 text-rose-700' : 'bg-rose-500/10 text-rose-300'
          }`}>
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[55%] border-r border-inherit flex flex-col overflow-hidden">
            <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono shrink-0 ${
              isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : isMono ? 'bg-[#1A1E29] text-zinc-400 border-[#2A2F3D]' : 'bg-[#06152B] text-slate-400 border-edumaster-cardBorder'
            }`}>
              <span className="flex items-center gap-1.5 font-bold">
                <Code2 className="w-3.5 h-3.5 text-blue-500" />
                Evidencia entregada • {submission.submittedAt}
              </span>
              <span>{submission.predictionId ?? 'sin predicción'}</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed">
              <pre className={`p-4 rounded-2xl border overflow-x-auto m-0 ${
                isLight
                  ? 'bg-slate-50 text-slate-900 border-slate-200'
                  : isMono
                  ? 'bg-[#0E1117] text-zinc-200 border-[#2A2F3D]'
                  : 'bg-[#040D1A] text-emerald-300 border-emerald-500/20'
              }`}>
                {submission.codeSnippet || 'Sin código adjunto.'}
              </pre>
            </div>
          </div>

          <div className="w-[45%] flex flex-col overflow-y-auto p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70 m-0">
                  Rúbrica oficial de evaluación
                </h3>
                <span className="text-[11px] font-mono opacity-60">
                  {submission.rubricScores.length} criterios · {maxTotal} pts
                </span>
              </div>
              <div className="space-y-3">
                {submission.rubricScores.map((criterion, index) => {
                  const currentValue = rubricScores[index] ?? criterion.score;
                  const options = [0, 0.5, 0.7, 0.9, 1]
                    .map(factor => Number((criterion.maxPts * factor).toFixed(1)));
                  return (
                    <div
                      key={index}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#181C26] border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span>{criterion.criteria}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {currentValue} / {criterion.maxPts} pts
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {options.map(value => (
                          <button
                            key={value}
                            onClick={() => handleScoreChange(index, value)}
                            className={`py-1 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                              currentValue === value
                                ? (isLight ? 'bg-slate-900 text-white border-slate-900' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white border-edumaster-cyan')
                                : (isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' : isMono ? 'bg-[#202532] border-[#3B4254] hover:bg-[#2A3142] text-zinc-300' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300')
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold opacity-75">Retroalimentación pedagógica</label>
                <button
                  onClick={handleGenerateAiFeedback}
                  className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    isLight ? 'text-blue-600 hover:underline' : isMono ? 'text-zinc-200 hover:underline' : 'text-edumaster-cyan hover:underline'
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> Sugerir borrador DEMO
                </button>
              </div>
              <textarea
                value={feedback}
                onChange={event => setFeedback(event.target.value)}
                rows={4}
                className={`${inputClass} leading-relaxed`}
                placeholder="Escribe la retroalimentación para el estudiante..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold opacity-75">Firma docente obligatoria</label>
              <input
                value={signedBy}
                onChange={event => setSignedBy(event.target.value)}
                className={inputClass}
                placeholder="Nombre y apellido del docente responsable"
                aria-label="Firma docente"
              />
              <p className={`text-[10px] m-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Se registrará en <code>signedBy</code> y en la auditoría. Sin firma, la API responde 422.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => void handleConfirm()}
                disabled={!canSign}
                className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40 ${
                  isLight
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : isMono
                    ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                    : 'bg-gradient-to-r from-edumaster-blue to-emerald-500 text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                {saving ? 'Registrando...' : `Firmar y publicar nota (${totalScore} / ${maxTotal})`}
              </button>
              {onFeedbackSaved && (
                <button
                  onClick={() => void handleFeedbackOnly()}
                  disabled={saving || signedBy.trim().length < 2 || feedback.trim().length < 5}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-colors disabled:opacity-40 ${
                    isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-white/15 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" /> Guardar feedback sin publicar nota
                </button>
              )}
              <div className={`p-2 rounded-xl border text-[10px] space-y-0.5 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                <p className="m-0 font-mono">X-Actor enviado: {demoActor.name} · {demoActor.role}</p>
                {submission.signatureHash && <p className="m-0 font-mono">SHA-256: {submission.signatureHash.slice(0, 16)}…</p>}
                {submission.auditLogId && <p className="m-0 font-mono">audit_log_id: {submission.auditLogId}</p>}
                {submission.actorSource && <p className="m-0 font-mono">actor_source: {submission.actorSource}</p>}
                <p className="m-0 opacity-70">Acción auditada con correlationId. DEMO: sin publicación en actas institucionales.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TeacherSpeedGraderModal: React.FC<TeacherSpeedGraderModalProps> = ({
  submission,
  isOpen,
  onClose,
  onGradeConfirmed,
  onFeedbackSaved,
  theme = 'monochrome',
}) => {
  if (!isOpen || !submission) return null;

  return (
    <TeacherSpeedGraderModalContent
      submission={submission}
      onClose={onClose}
      onGradeConfirmed={onGradeConfirmed}
      onFeedbackSaved={onFeedbackSaved}
      theme={theme}
    />
  );
};
