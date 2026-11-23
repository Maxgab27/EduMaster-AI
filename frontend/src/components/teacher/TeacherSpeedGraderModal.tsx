import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  Code2, 
  Award
} from 'lucide-react';
import { ThemeMode, PendingSubmission } from '../../types';

interface TeacherSpeedGraderModalProps {
  submission: PendingSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onGradeConfirmed: (submissionId: string, officialScore: number, feedback: string) => void;
  theme?: ThemeMode;
}

interface TeacherSpeedGraderModalContentProps {
  submission: PendingSubmission;
  onClose: () => void;
  onGradeConfirmed: (submissionId: string, officialScore: number, feedback: string) => void;
  theme: ThemeMode;
}

const TeacherSpeedGraderModalContent: React.FC<TeacherSpeedGraderModalContentProps> = ({
  submission,
  onClose,
  onGradeConfirmed,
  theme
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  // State for rubric scores
  const [rubricScores, setRubricScores] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    submission.rubricScores.forEach((r, idx) => {
      initial[idx] = r.score;
    });
    return initial;
  });

  const [feedback, setFeedback] = useState(submission.feedback);

  const calculateTotal = () => {
    let sum = 0;
    Object.values(rubricScores).forEach(val => {
      sum += val;
    });
    return Number(sum.toFixed(1));
  };

  const handleScoreChange = (index: number, val: number) => {
    setRubricScores(prev => ({
      ...prev,
      [index]: val
    }));
  };

  const handleGenerateAiFeedback = () => {
    setFeedback(
      `[Borrador Sugerido por IA • Verificado por Docente]:\n` +
      `La implementación de CrossAttention es matemáticamente rigurosa. El escalado (1/√d_k) previene la saturación del softmax en tensores de alta dimensión. ` +
      `Como mejora formativa recomendada, incorpora una capa de Dropout tras la proyección out_proj para mejorar la generalización en secuencias largas.`
    );
  };

  const handleConfirm = () => {
    onGradeConfirmed(submission.id, calculateTotal(), feedback);
    onClose();
  };

  const totalScore = calculateTotal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl transition-colors ${
        isLight 
          ? 'bg-white border-slate-300 text-slate-900' 
          : isMono 
          ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' 
          : 'bg-[#06152B] border-edumaster-cyan/40 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'border-slate-200 bg-slate-50' : isMono ? 'border-[#2A2F3D] bg-[#1A1D24]' : 'border-edumaster-cardBorder bg-[#0A1F3D]'
        }`}>
          <div className="flex items-center gap-3">
            <img
              src={submission.avatar}
              alt={submission.studentName}
              className="w-10 h-10 rounded-full object-cover border border-inherit"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold m-0">{submission.studentName}</h2>
                <span className="text-[10px] font-mono opacity-60">ID: {submission.studentId}</span>
              </div>
              <p className="text-xs opacity-70 m-0">
                {submission.assignmentTitle} • {submission.course}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] opacity-60 uppercase font-mono block">Calificación Rúbrica</span>
              <span className={`text-lg font-black font-mono ${
                totalScore >= 16 ? 'text-emerald-400' : totalScore >= 12 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {totalScore} <span className="text-xs opacity-60 font-normal">/ 20</span>
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

        {/* Human in the loop rule notice */}
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
              <strong>Principio de Autoridad Docente (SOP 70-75):</strong> La IA sugiere una nota estimada de ({submission.estimatedAiScore} pts), pero tú como docente tienes la potestad legal y académica exclusiva de validar cada criterio.
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-current">
            Human-in-the-Loop
          </span>
        </div>

        {/* SpeedGrader Two-Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Code / Submission Viewer (55%) */}
          <div className="w-[55%] border-r border-inherit flex flex-col overflow-hidden">
            <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono shrink-0 ${
              isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : isMono ? 'bg-[#1A1E29] text-zinc-400 border-[#2A2F3D]' : 'bg-[#06152B] text-slate-400 border-edumaster-cardBorder'
            }`}>
              <span className="flex items-center gap-1.5 font-bold">
                <Code2 className="w-3.5 h-3.5 text-blue-500" />
                Evidencia de Código Entregada • {submission.submittedAt}
              </span>
              <span>Python 3.12</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed">
              <pre className={`p-4 rounded-2xl border overflow-x-auto m-0 ${
                isLight 
                  ? 'bg-slate-50 text-slate-900 border-slate-200' 
                  : isMono 
                  ? 'bg-[#0E1117] text-zinc-200 border-[#2A2F3D]' 
                  : 'bg-[#040D1A] text-emerald-300 border-emerald-500/20'
              }`}>
                {submission.codeSnippet}
              </pre>
            </div>
          </div>

          {/* Right: Rubric Assessment & Official Sign-off (45%) */}
          <div className="w-[45%] flex flex-col overflow-y-auto p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70 m-0">
                  Rúbrica Oficial de Evaluación
                </h3>
                <span className="text-[11px] font-mono opacity-60">4 Criterios (Total 20 pts)</span>
              </div>

              {/* Rubric Criteria List */}
              <div className="space-y-3">
                {submission.rubricScores.map((criterion, idx) => {
                  const currentVal = rubricScores[idx] ?? criterion.score;
                  return (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#181C26] border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span>{criterion.criteria}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {currentVal} / {criterion.maxPts} pts
                        </span>
                      </div>

                      {/* Score quick selection buttons */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {[0, 2.5, 3.5, 4.5, 5].map((val) => {
                          const isSelected = currentVal === val;
                          return (
                            <button
                              key={val}
                              onClick={() => handleScoreChange(idx, val)}
                              className={`py-1 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                                isSelected
                                  ? (isLight ? 'bg-slate-900 text-white border-slate-900' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white border-edumaster-cyan')
                                  : (isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' : isMono ? 'bg-[#202532] border-[#3B4254] hover:bg-[#2A3142] text-zinc-300' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300')
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teacher Feedback with AI Assistant */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold opacity-75">
                  Retroalimentación Pedagógica Docente
                </label>
                <button
                  onClick={handleGenerateAiFeedback}
                  className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    isLight ? 'text-blue-600 hover:underline' : isMono ? 'text-zinc-200 hover:underline' : 'text-edumaster-cyan hover:underline'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Sugerir borrador con IA
                </button>
              </div>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className={`w-full p-3 rounded-2xl border text-xs leading-relaxed focus:outline-none transition-colors ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-900' 
                    : isMono 
                    ? 'bg-[#0E1117] border-[#2A2F3D] text-zinc-200' 
                    : 'bg-[#040D1A] border-edumaster-cardBorder text-slate-200'
                }`}
                placeholder="Escribe la retroalimentación para el estudiante..."
              />
            </div>

            {/* Official Confirmation Buttons */}
            <div className="pt-2">
              <button
                onClick={handleConfirm}
                className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  isLight
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : isMono
                    ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                    : 'bg-gradient-to-r from-edumaster-blue to-emerald-500 text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                Firmar y Publicar Nota Oficial ({totalScore} / 20)
              </button>
              <p className="text-[10px] text-center opacity-50 mt-2 m-0">
                Se guardará registro inmutable en audit_logs bajo la firma digital del docente.
              </p>
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
  theme = 'monochrome'
}) => {
  if (!isOpen || !submission) return null;

  return (
    <TeacherSpeedGraderModalContent
      submission={submission}
      onClose={onClose}
      onGradeConfirmed={onGradeConfirmed}
      theme={theme}
    />
  );
};
