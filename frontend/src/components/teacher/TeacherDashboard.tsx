import React, { useState } from 'react';
import { 
  Users, 
  CheckSquare, 
  AlertTriangle, 
  Award, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  Clock, 
  Mail, 
  CheckCircle2, 
  ShieldAlert, 
  BarChart3,
  ExternalLink,
  BrainCircuit
} from 'lucide-react';
import { ThemeMode, PendingSubmission, AtRiskStudent } from '../../types';
import { pendingSubmissions as initialSubmissions, atRiskStudents as initialRisks } from '../../data/mockData';
import { TeacherSpeedGraderModal } from './TeacherSpeedGraderModal';

interface TeacherDashboardProps {
  theme?: ThemeMode;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ theme = 'monochrome' }) => {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>(initialSubmissions);
  const [risks, setRisks] = useState<AtRiskStudent[]>(initialRisks);
  const [activeSubmission, setActiveSubmission] = useState<PendingSubmission | null>(null);
  const [isSpeedGraderOpen, setIsSpeedGraderOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const handleOpenGrader = (sub: PendingSubmission) => {
    setActiveSubmission(sub);
    setIsSpeedGraderOpen(true);
  };

  const handleGradeConfirmed = (submissionId: string, officialScore: number, feedback: string) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          status: 'graded',
          officialScore,
          feedback
        };
      }
      return s;
    }));

    setActionNotice(`✓ Nota oficial de ${officialScore}/20 publicada y firmada para el estudiante. Registrado en audit_logs.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSendIntervention = (studentName: string) => {
    setActionNotice(`✓ Mensaje personalizado de mentoría y enlace de apoyo enviado a ${studentName}.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Teacher Top Welcome & Action Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all shadow-md ${
        isLight
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-200 text-slate-900'
          : isMono
          ? 'bg-[#181C26] border-[#3B4254] text-zinc-100'
          : 'bg-gradient-to-r from-[#06152B] via-[#0A2540] to-[#0A1F3D] border-emerald-500/30 text-white'
      }`}>
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : isMono ? 'bg-[#262B37] border-[#3B4254] text-white' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}>
              ESPACIO DOCENTE • PERIODO 2026-II
            </span>
            <span className="text-xs opacity-60">Dr. Alejandro Morales</span>
          </div>

          <h1 className="text-xl md:text-2xl font-black tracking-tight m-0">
            Panel de Gestión Pedagógica & Calificación Rápida
          </h1>
          <p className="text-xs opacity-80 leading-relaxed m-0">
            Supervisión directa de <strong>142 estudiantes</strong>. Tienes <strong>{pendingCount} entregas pendientes</strong> con propuesta algorítmica lista para tu aprobación humana.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {pendingCount > 0 && (
            <button
              onClick={() => handleOpenGrader(submissions.find(s => s.status === 'pending') || submissions[0])}
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

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">
            Regla Human-in-the-Loop Cumplida
          </span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>Alumnos a Cargo</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight">142</div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 m-0">En 3 cohortes activas</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>Por Calificar (SpeedGrader)</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight">{pendingCount}</div>
          <p className="text-[11px] opacity-70 mt-1 m-0">Con borrador IA preparado</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>En Riesgo de Deserción</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-rose-400">
            {risks.filter(r => r.riskScore > 65).length}
          </div>
          <p className="text-[11px] text-rose-400 font-medium mt-1 m-0">Cabeza C (Riesgo &gt; 65%)</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>Promedio de Cohorte</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight">17.4 <span className="text-xs opacity-60 font-normal">/ 20</span></div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 m-0">+0.6 pts vs periodo anterior</p>
        </div>
      </div>

      {/* Main Grid: SpeedGrader Tray (7 Cols) & Early Risk Warning (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SpeedGrader Pending Submissions */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-6 rounded-3xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-4">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 m-0">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  Bandeja de Calificación Rápida (SpeedGrader)
                </h2>
                <p className="text-xs opacity-60 m-0">
                  Evidencias entregadas por los alumnos con sugerencia de rúbrica asistida
                </p>
              </div>

              <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : isMono ? 'bg-[#222734] border-[#3B4254] text-zinc-300' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              }`}>
                {pendingCount} Pendientes
              </span>
            </div>

            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    sub.status === 'graded'
                      ? (isLight ? 'bg-slate-50 border-slate-200 opacity-75' : isMono ? 'bg-[#181C26] border-[#2A2F3D]' : 'bg-[#06152B]/60 border-white/10')
                      : (isLight ? 'bg-white border-slate-200 hover:border-slate-300' : isMono ? 'bg-[#1C202B] border-[#2A2F3D] hover:border-[#3B4254]' : 'bg-[#0A1F3D] border-edumaster-cardBorder hover:border-edumaster-cyan/50')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={sub.avatar}
                      alt={sub.studentName}
                      className="w-10 h-10 rounded-full object-cover border border-inherit shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold m-0">{sub.studentName}</h3>
                        <span className="text-[10px] opacity-60 font-mono">• {sub.submittedAt}</span>
                      </div>
                      <p className="text-[11px] opacity-80 m-0 font-medium">{sub.assignmentTitle}</p>
                      <p className="text-[10px] opacity-60 m-0">{sub.course}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      {sub.status === 'graded' ? (
                        <div>
                          <span className="text-[10px] opacity-60 block">Nota Oficial</span>
                          <span className="text-sm font-black font-mono text-emerald-400">
                            {sub.officialScore} / 20
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] opacity-60 block flex items-center gap-1 justify-end">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            Propuesta IA
                          </span>
                          <span className="text-xs font-bold font-mono text-amber-400">
                            {sub.estimatedAiScore} / 20 pts
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenGrader(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        sub.status === 'graded'
                          ? (isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : isMono ? 'bg-[#262B37] text-zinc-300 hover:text-white' : 'bg-white/10 text-slate-200 hover:bg-white/20')
                          : (isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : isMono ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white')
                      }`}
                    >
                      {sub.status === 'graded' ? 'Ver / Editar' : 'Calificar con Rúbrica'}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Early Warning Triage (Cabeza C) */}
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
                <p className="text-xs opacity-60 m-0">
                  Inferencia predictiva Cabeza C (Brier Score Calibrado)
                </p>
              </div>

              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                Alerta Temprana
              </span>
            </div>

            <div className="space-y-3">
              {risks.map((student) => (
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
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                    isLight ? 'bg-white/80 border-slate-200 text-slate-800' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-300' : 'bg-[#06152B] border-white/10 text-slate-300'
                  }`}>
                    <strong>Sugerencia Pedagógica:</strong> {student.suggestedAction}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleSendIntervention(student.name)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                        isLight
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : isMono
                          ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200'
                          : 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      Enviar Mensaje de Mentoría
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
                <strong>Gobernanza Ética:</strong> Esta alerta no califica negativamente al estudiante; sirve como indicador de apoyo para prevenir deserción prematura.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SpeedGrader Modal Component */}
      <TeacherSpeedGraderModal
        submission={activeSubmission}
        isOpen={isSpeedGraderOpen}
        onClose={() => setIsSpeedGraderOpen(false)}
        onGradeConfirmed={handleGradeConfirmed}
        theme={theme}
      />
    </div>
  );
};
