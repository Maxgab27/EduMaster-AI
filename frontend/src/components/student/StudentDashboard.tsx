import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  Award, 
  CheckSquare, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  ShieldCheck, 
  Upload,
  TrendingUp
} from 'lucide-react';
import { ThemeMode, StudentTask } from '../../types';
import { studentTasks as initialTasks } from '../../data/mockData';
import { StudentStudyModal } from './StudentStudyModal';
import { StudentCodeSandbox } from './StudentCodeSandbox';
import { AIRecommendationsCard } from '../dashboard/AIRecommendationsCard';

interface StudentDashboardProps {
  theme?: ThemeMode;
  onOpenAITutor?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  theme = 'monochrome',
  onOpenAITutor
}) => {
  const [tasks, setTasks] = useState<StudentTask[]>(initialTasks);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [filterTask, setFilterTask] = useState<'all' | 'urgent' | 'upcoming'>('all');
  const [showSandbox, setShowSandbox] = useState(false);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const handleSimulateSubmit = (taskId: string, taskTitle: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'submitted' } : t));
    setUploadNotice(`¡Evidencia enviada para "${taskTitle}"! (simulación local, sin hash real).`);
    setTimeout(() => setUploadNotice(null), 3500);
  };

  const filteredTasks = tasks.filter(t => {
    if (filterTask === 'all') return true;
    return t.urgency === filterTask;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Continuing Study Hero Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all shadow-xl relative overflow-hidden backdrop-blur-2xl ${
        isLight
          ? 'bg-white/80 border-white/60 text-slate-900 shadow-sm'
          : isMono
          ? 'bg-[#10141F]/80 border-white/10 text-zinc-100 shadow-xl'
          : 'bg-[#06152B]/80 border-white/10 text-white shadow-xl'
      }`}>
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isLight ? 'bg-blue-100 border-blue-300 text-blue-800' : isMono ? 'bg-[#262B37] border-[#3B4254] text-white' : 'bg-edumaster-blue/20 border-edumaster-cyan/40 text-edumaster-cyan'
            }`}>
              CURSO EN CURSO • COHORTE 2026-II
            </span>
            <span className="text-xs opacity-60 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Última sesión hace 2 horas
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-black tracking-tight m-0">
            DL-401: Arquitectura de Redes Neuronales & Transformers
          </h1>
          <p className="text-xs opacity-80 leading-relaxed m-0">
            Módulo 3: Modelado Secuencial con Unidades GRU. Tu avance en este curso es del <strong>68%</strong>.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-48 bg-black/20 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[68%]" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">68%</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
          <button
            onClick={() => setIsStudyModalOpen(true)}
            className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : isMono
                ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                : 'bg-gradient-to-r from-edumaster-blue to-edumaster-cyan text-white shadow-glowBlue'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            Continuar Estudio (Modo Enfoque)
          </button>

          <button
            onClick={() => setShowSandbox(!showSandbox)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 transition-colors ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                : isMono
                ? 'bg-[#222734] border-[#3B4254] text-zinc-200 hover:text-white'
                : 'bg-[#06152B] border-white/20 text-white hover:bg-white/10'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            {showSandbox ? 'Ocultar Terminal' : 'Abrir Terminal Python'}
          </button>
        </div>
      </div>

      {/* Code Sandbox Toggle Section */}
      {showSandbox && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <StudentCodeSandbox theme={theme} />
        </div>
      )}

      {/* Student Personal KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>Horas Dedicadas</span>
            <Clock className="w-4 h-4 text-edumaster-blue" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight">34.5 hrs</div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 m-0">+4.2 hrs esta semana</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>Nota Promedio Oficial</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight">18.6 <span className="text-xs opacity-50 font-normal">/ 20</span></div>
          <p className="text-[11px] opacity-70 mt-1 m-0">Avalado por 4 rúbricas docentes</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>Entregas Pendientes</span>
            <CheckSquare className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight">
            {tasks.filter(t => t.status === 'pending').length}
          </div>
          <p className="text-[11px] text-rose-400 font-medium mt-1 m-0">1 entrega vence hoy</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between opacity-70 text-xs mb-2">
            <span>Habilidades Acreditadas</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight">14 / 20</div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 m-0">70% de la malla completada</p>
        </div>
      </div>

      {uploadNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{uploadNotice}</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">
            Timestamp UTC Registrado
          </span>
        </div>
      )}

      {/* Main Grid: Tasks & Competencies / Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tasks and Deadlines (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Task Center */}
          <div className={`p-6 rounded-3xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-4">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 m-0">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  Centro de Entregas y Evaluaciones
                </h2>
                <p className="text-xs opacity-60 m-0">Subida de evidencias académicas y seguimiento de rúbricas</p>
              </div>

              {/* Filter Tabs */}
              <div className={`flex p-0.5 rounded-xl border text-[11px] ${
                isLight ? 'bg-slate-100 border-slate-300' : isMono ? 'bg-[#202532] border-[#3B4254]' : 'bg-[#06152B] border-edumaster-cardBorder'
              }`}>
                <button
                  onClick={() => setFilterTask('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterTask === 'all'
                      ? (isLight ? 'bg-white shadow text-slate-900 font-bold' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterTask('urgent')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterTask === 'urgent'
                      ? (isLight ? 'bg-white shadow text-slate-900 font-bold' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Urgentes
                </button>
              </div>
            </div>

            {/* Task Items */}
            <div className="space-y-3">
              {filteredTasks.map(t => (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    t.status === 'graded'
                      ? (isLight ? 'bg-slate-50 border-slate-200 opacity-80' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#06152B]/60 border-white/10')
                      : t.urgency === 'urgent'
                      ? (isLight ? 'bg-amber-50/70 border-amber-300' : isMono ? 'bg-[#1F1C1B] border-[#4A3B2C]' : 'bg-amber-500/10 border-amber-500/30')
                      : (isLight ? 'bg-white border-slate-200' : isMono ? 'bg-[#1A1E29] border-[#2A2F3D]' : 'bg-[#0A1F3D]/60 border-edumaster-cardBorder')
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        t.urgency === 'urgent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        Vence: {t.dueDate}
                      </span>
                      <span className="text-[10px] opacity-60 font-mono">Ponderación: {t.weight}</span>
                    </div>
                    <h3 className="text-xs font-bold m-0">{t.title}</h3>
                    <p className="text-[11px] opacity-60 m-0">{t.course}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {t.status === 'graded' ? (
                      <div className="text-right">
                        <span className="text-[10px] opacity-60 block">Nota Oficial</span>
                        <span className="text-sm font-black font-mono text-emerald-400">{t.grade} / 20</span>
                      </div>
                    ) : t.status === 'submitted' ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Entregado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSimulateSubmit(t.id, t.title)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isLight 
                            ? 'bg-slate-900 text-white hover:bg-slate-800' 
                            : isMono 
                            ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' 
                            : 'bg-edumaster-blue text-white hover:opacity-90'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Subir Entrega
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Pedagogical Recommendations: conectadas al artefacto MTL + catálogo */}
          <AIRecommendationsCard theme={theme} />
        </div>

        {/* Right Column: Personal Skills Radar & AI Tutor Helper (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Personal Skill Mastery */}
          <div className={`p-6 rounded-3xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit mb-4">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 m-0">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Mi Dominio de Competencias
                </h2>
                <p className="text-xs opacity-60 m-0">Separación estricta: nota docente vs predicción</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Redes Neuronales & Transformers', level: 'Nivel 4: Avanzado', pct: 85, docentValidated: true },
                { name: 'Modelado Secuencial (GRU / LSTM)', level: 'Nivel 3: Aplicar', pct: 68, docentValidated: true },
                { name: 'DataOps & Split Temporal con DVC', level: 'Nivel 2: Practicar', pct: 52, docentValidated: false },
                { name: 'Despliegue FastAPI & Model Registry', level: 'Nivel 2: Practicar', pct: 44, docentValidated: false },
                { name: 'Privacidad y Ley 29733', level: 'Nivel 4: Avanzado', pct: 92, docentValidated: true }
              ].map((skill, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{skill.name}</span>
                    <span className="font-mono text-[11px] opacity-75">{skill.pct}%</span>
                  </div>
                  <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        skill.pct > 80 ? 'bg-emerald-400' : skill.pct > 60 ? 'bg-blue-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${skill.pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] opacity-60">
                    <span>{skill.level}</span>
                    {skill.docentValidated && (
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Validado por Docente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Contextual AI Tutor Card */}
          <div className={`p-6 rounded-3xl border transition-all ${
            isLight
              ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-200 text-slate-900'
              : isMono
              ? 'bg-[#181C26] border-[#3B4254] text-zinc-100'
              : 'bg-gradient-to-br from-[#0A1F3D] to-[#06152B] border-edumaster-cyan/30 text-white'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-blue-600 text-white' : isMono ? 'bg-white text-zinc-950 font-bold' : 'bg-edumaster-cyan text-slate-950'
              }`}>
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-sm font-bold m-0">Tutor Pedagógico 24/7</h3>
                <p className="text-[11px] opacity-70 m-0">Asistencia cognitiva fundamentada en la guía curricular</p>
              </div>
            </div>

            <p className="text-xs opacity-80 leading-relaxed mb-4">
              ¿Tienes dudas con el laboratorio de hoy sobre tensores de entrada o la prueba de auto-atención? Pregúntame con tus dudas concretas.
            </p>

            <div className="space-y-2">
              <button
                onClick={onOpenAITutor}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isLight
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : isMono
                    ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200'
                    : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white shadow-glowBlue'
                }`}
              >
                Abrir Consulta con el Tutor
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Mode Study Modal */}
      <StudentStudyModal
        isOpen={isStudyModalOpen}
        onClose={() => setIsStudyModalOpen(false)}
        theme={theme}
      />
    </div>
  );
};
