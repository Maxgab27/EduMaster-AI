import React, { useState } from 'react';
import { Map, CheckCircle2, ArrowRight, Clock, Lock } from 'lucide-react';
import { ThemeMode } from '../../types';

interface LearningPathsViewProps {
  theme?: ThemeMode;
}

export const LearningPathsView: React.FC<LearningPathsViewProps> = ({ theme = 'monochrome' }) => {
  const [selectedPath, setSelectedPath] = useState('dl-engineer');

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const paths = [
    {
      id: 'dl-engineer',
      title: 'Especialista en Deep Learning & Redes Neuronales',
      desc: 'Dominio de arquitecturas Transformer, GRU, convolucionales y MLOps con PyTorch.',
      duration: '120 horas',
      coursesCount: 6,
      progress: 68,
      steps: [
        { name: 'Álgebra Lineal & Optimización Tensorial', status: 'completed', score: '98/100' },
        { name: 'Redes Neuronales Densas & Backpropagation', status: 'completed', score: '95/100' },
        { name: 'Modelado Secuencial con GRU & LSTM', status: 'current', score: 'En progreso' },
        { name: 'Transformers & Mecanismos de Auto-Atención', status: 'locked', score: 'Pendiente' },
        { name: 'Arquitecturas Multitarea & Loss Ponderada', status: 'locked', score: 'Pendiente' },
        { name: 'Despliegue Productivo con FastAPI & MLflow', status: 'locked', score: 'Pendiente' },
      ]
    },
    {
      id: 'data-scientist',
      title: 'Científico de Datos & DataOps Enterprise',
      desc: 'Ingesta de eventos, split temporal estricto, feature stores y mitigación de fugas.',
      duration: '95 horas',
      coursesCount: 5,
      progress: 40,
      steps: [
        { name: 'Ingeniería de Características en Tiempo Real', status: 'completed', score: '92/100' },
        { name: 'Split Temporal y Validación sin Data Leakage', status: 'current', score: 'En progreso' },
        { name: 'Modelos Baselines Interpretables (XGBoost)', status: 'locked', score: 'Pendiente' },
        { name: 'Gobernanza de Datos & Cumplimiento Ley 29733', status: 'locked', score: 'Pendiente' },
      ]
    }
  ];

  const current = paths.find(p => p.id === selectedPath) || paths[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <Map className={`w-5 h-5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
            Planes y Rutas de Aprendizaje Curriculares
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Secuencias pedagógicas orientadas al dominio progresivo de competencias evaluables.
          </p>
        </div>

        {/* Path Selector Tabs */}
        <div className="flex gap-2 w-full sm:w-auto">
          {paths.map(p => {
            const isSelected = selectedPath === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPath(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? (isLight
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : isMono
                        ? 'bg-white border-white text-zinc-950 font-black'
                        : 'bg-edumaster-blue border-edumaster-cyan text-white shadow-glowBlue')
                    : (isLight
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        : isMono
                        ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-300 hover:text-white'
                        : 'bg-[#0A1F3D] border-edumaster-cardBorder text-slate-300 hover:text-white')
                }`}
              >
                {p.title.split(' ')[0]} {p.title.split(' ')[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Path Card */}
      <div className={`p-6 border rounded-2xl transition-colors ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm text-slate-900'
          : isMono
          ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100'
          : 'glass-panel border-edumaster-cardBorder text-slate-100'
      }`}>
        {/* Top Details & Progress */}
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
              Ruta Oficial Acreditada
            </span>
            <h2 className="text-lg font-black mt-2 mb-1 tracking-tight">{current.title}</h2>
            <p className={`text-xs m-0 max-w-2xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {current.desc}
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
                Duración Total
              </span>
              <span className="text-xs font-bold font-mono flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 opacity-70" /> {current.duration}
              </span>
            </div>
            <div>
              <span className={`text-[10px] block font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Progreso Ruta
              </span>
              <span className={`text-xs font-black font-mono mt-0.5 block ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}>
                {current.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Path Step Milestones */}
        <div className="mt-6">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${
            isLight ? 'text-slate-700' : isMono ? 'text-zinc-300' : 'text-slate-300'
          }`}>
            Secuencia de Cursos y Prerrequisitos
          </h3>

          <div className="space-y-3">
            {current.steps.map((st, i) => {
              const isCompleted = st.status === 'completed';
              const isCurrent = st.status === 'current';

              return (
                <div
                  key={st.name}
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
                    {/* Step Icon Badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCompleted
                        ? (isLight ? 'bg-emerald-600 text-white' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-emerald-500 text-slate-950')
                        : isCurrent
                        ? (isLight ? 'bg-blue-600 text-white' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-cyan text-slate-950 font-black')
                        : (isLight ? 'bg-slate-300 text-slate-700' : 'bg-[#202532] text-zinc-400')
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isCurrent ? i + 1 : <Lock className="w-3.5 h-3.5 opacity-70" />}
                    </div>

                    <div>
                      <span className={`text-xs font-bold block ${
                        isCompleted
                          ? (isLight ? 'text-slate-900 font-extrabold' : 'text-white')
                          : isCurrent
                          ? (isLight ? 'text-slate-900 font-extrabold' : 'text-white')
                          : (isLight ? 'text-slate-700 font-medium' : 'text-zinc-300')
                      }`}>
                        {st.name}
                      </span>
                      <span className={`text-[11px] block mt-0.5 ${
                        isCompleted
                          ? (isLight ? 'text-emerald-800 font-semibold' : 'text-emerald-300')
                          : isCurrent
                          ? (isLight ? 'text-blue-800 font-semibold' : 'text-blue-300')
                          : (isLight ? 'text-slate-500' : 'text-zinc-500')
                      }`}>
                        {isCompleted 
                          ? 'Competencia certificada por docente' 
                          : isCurrent 
                          ? 'Módulo en curso' 
                          : 'Bloqueado por prerrequisitos'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Score badge with crisp contrast */}
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                      isCompleted
                        ? (isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : isMono ? 'bg-[#223326] border-[#2A4733] text-emerald-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300')
                        : isCurrent
                        ? (isLight ? 'bg-blue-100 border-blue-300 text-blue-900' : isMono ? 'bg-[#253048] border-[#384A6E] text-blue-300' : 'bg-blue-500/20 border-blue-400 text-blue-300')
                        : (isLight ? 'bg-slate-200 border-slate-300 text-slate-600' : isMono ? 'bg-[#1A1D27] border-[#222734] text-zinc-500' : 'bg-white/5 border-white/10 text-slate-500')
                    }`}>
                      {st.score}
                    </span>

                    {isCurrent && (
                      <button className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        isLight 
                          ? 'bg-slate-900 text-white hover:bg-slate-800' 
                          : isMono 
                          ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' 
                          : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white shadow-glowBlue'
                      }`}>
                        Continuar <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
