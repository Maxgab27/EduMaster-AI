import React from 'react';
import { CheckSquare, ShieldAlert, Award, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { ThemeMode } from '../../types';

interface AssessmentsViewProps {
  theme?: ThemeMode;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({ theme = 'monochrome' }) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const assessments = [
    {
      id: 'as-1',
      title: 'Examen Práctico: Implementación de Backpropagation en NumPy',
      course: 'DL-401: Arquitectura de Redes Neuronales',
      dueDate: '20 Nov 2026',
      maxScore: '20 pts',
      weight: '30%',
      attempts: 142,
      officialAvg: '17.4',
      predictiveEst: '16.9',
      status: 'Disponible'
    },
    {
      id: 'as-2',
      title: 'Proyecto Integrador: Pipeline de Feature Store & DVC',
      course: 'OPS-301: MLOps Enterprise',
      dueDate: '24 Nov 2026',
      maxScore: '20 pts',
      weight: '40%',
      attempts: 89,
      officialAvg: '18.1',
      predictiveEst: '17.8',
      status: 'En Calificación'
    },
    {
      id: 'as-3',
      title: 'Cuestionario Teórico: Funciones de Pérdida Multitarea y Regularización',
      course: 'ML-201: Machine Learning con Baselines',
      dueDate: '15 Nov 2026',
      maxScore: '20 pts',
      weight: '15%',
      attempts: 310,
      officialAvg: '15.8',
      predictiveEst: '16.0',
      status: 'Cerrado'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black flex items-center gap-2 m-0">
          <CheckSquare className={`w-5 h-5 ${isLight ? 'text-emerald-600' : isMono ? 'text-zinc-200' : 'text-emerald-400'}`} />
          Evaluaciones, Rúbricas y Evidencias Académicas
        </h1>
        <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Separación técnica obligatoria entre calificación docente oficial y estimaciones predictivas de IA.
        </p>
      </div>

      {/* Compliance Note */}
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
            <strong>Principio de Autoridad Docente:</strong> Las predicciones de aprendizaje no modifican actas ni sustituyen el juicio del docente responsable.
          </span>
        </div>
        <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-md border ${
          isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : isMono ? 'bg-[#202532] border-[#3B4254] text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          Regla Auditada
        </span>
      </div>

      {/* List of Assessments */}
      <div className="space-y-4">
        {assessments.map(a => (
          <div
            key={a.id}
            className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
              isLight 
                ? 'bg-white border-slate-200 shadow-sm text-slate-900' 
                : isMono 
                ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' 
                : 'glass-panel border-edumaster-cardBorder text-slate-100'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  isLight ? 'bg-blue-50 border-blue-200 text-blue-800' : isMono ? 'bg-[#242A38] border-[#3B4254] text-white' : 'bg-edumaster-blue/20 text-edumaster-cyan border-edumaster-cyan/30'
                }`}>
                  Ponderación: {a.weight}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  a.status === 'Disponible' 
                    ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30') 
                    : a.status === 'En Calificación'
                    ? (isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/20 text-amber-300 border-amber-500/30')
                    : (isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300')
                }`}>
                  {a.status}
                </span>
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Vence: {a.dueDate}</span>
              </div>

              <h3 className="text-sm font-black mb-1 leading-snug tracking-tight">{a.title}</h3>
              <p className={`text-xs m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{a.course}</p>
            </div>

            {/* Score Comparison Columns */}
            <div className={`flex items-center gap-5 p-3 rounded-xl border shrink-0 ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-800' 
                : isMono 
                ? 'bg-[#1C202B] border-[#2A2F3D] text-white' 
                : 'bg-[#06152B] border-edumaster-cardBorder text-white'
            }`}>
              <div className="text-center">
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Intentos</span>
                <span className="font-mono font-bold text-xs">{a.attempts}</span>
              </div>
              <div className={`w-px h-8 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
              <div className="text-center">
                <span className={`text-[10px] block font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Nota Oficial</span>
                <span className={`font-mono font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{a.officialAvg} / 20</span>
              </div>
              <div className={`w-px h-8 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
              <div className="text-center">
                <span className={`text-[10px] block font-bold ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>Score IA (Ref)</span>
                <span className={`font-mono font-black text-sm ${isLight ? 'text-purple-800' : 'text-purple-300'}`}>{a.predictiveEst} / 20</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
