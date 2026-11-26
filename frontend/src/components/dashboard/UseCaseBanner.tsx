import React from 'react';
import { Sparkles, AlertTriangle, CheckSquare, Award, ArrowRight } from 'lucide-react';
import { NavTab, ThemeMode } from '../../types';

interface UseCaseBannerProps {
  onNavigateTab: (tab: NavTab) => void;
  theme?: ThemeMode;
  onQuickGrade?: () => void;
}

export const UseCaseBanner: React.FC<UseCaseBannerProps> = ({
  onNavigateTab,
  theme = 'monochrome',
}) => {
  const isLight = theme === 'light';
  const isMono = theme === 'monochrome';

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border transition-all backdrop-blur-2xl shadow-xl mb-6 relative overflow-hidden ${
      isLight 
        ? 'bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border-blue-200 text-slate-900 shadow-blue-500/5' 
        : isMono 
        ? 'bg-gradient-to-r from-white/[0.08] via-white/[0.05] to-white/[0.08] border-white/20 text-white shadow-2xl' 
        : 'bg-gradient-to-r from-edumaster-blue/30 via-edumaster-cyan/20 to-edumaster-violet/30 border-edumaster-cyan/40 text-white shadow-glowCyan'
    }`}>
      {/* Resplandor decorativo de fondo */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-edumaster-cyan/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-sm ${
              isLight 
                ? 'bg-blue-600 text-white border-blue-600' 
                : isMono 
                ? 'bg-white text-zinc-950 font-black border-white' 
                : 'bg-edumaster-cyan text-slate-950 font-black border-edumaster-cyan shadow-glowCyan'
            }`}>
              <Sparkles className="w-3 h-3 animate-pulse" />
              Flujo del Caso de Uso Principal
            </span>
            <span className="text-[11px] font-mono font-bold opacity-75">
              EduMaster.ai Enterprise · MTL & Human-in-the-Loop
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black tracking-tight mt-1 mb-0.5">
            Detección Temprana de Deserción Escolar & Calificación Asistida con IA
          </h2>
          <p className="text-xs opacity-80 m-0 max-w-2xl leading-relaxed">
            Sigue los 3 pasos de la demostración para comprobar en vivo la inferencia de riesgo, la intervención docente con firma SHA-256 y la verificación QR:
          </p>
        </div>

        {/* 3 Pasos Interactivos con 1 Clic */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          {/* Paso 1: Triaje de Riesgo */}
          <button
            onClick={() => onNavigateTab('analytics')}
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-sm group hover:scale-[1.02] active:scale-95 ${
              isLight
                ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                : isMono
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-200 hover:bg-rose-500/25'
            }`}
          >
            <div className="w-5 h-5 rounded-lg bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">
              1
            </div>
            <div className="text-left">
              <span className="text-[10px] block opacity-70 leading-none">Paso 1 · Inferencia</span>
              <span className="font-extrabold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                Alumnos en Riesgo (74.7%)
              </span>
            </div>
          </button>

          {/* Paso 2: Calificación Docente SpeedGrader */}
          <button
            onClick={() => onNavigateTab('assessments')}
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-sm group hover:scale-[1.02] active:scale-95 ${
              isLight
                ? 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                : isMono
                ? 'bg-white text-zinc-950 font-black border-white hover:bg-zinc-200'
                : 'bg-edumaster-blue border-edumaster-cyan/50 text-white hover:bg-edumaster-blue/80 shadow-glowBlue'
            }`}
          >
            <div className="w-5 h-5 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
              2
            </div>
            <div className="text-left">
              <span className="text-[10px] block opacity-70 leading-none">Paso 2 · Human-in-the-Loop</span>
              <span className="font-extrabold flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-emerald-400" />
                SpeedGrader & Firma SHA-256
              </span>
            </div>
          </button>

          {/* Paso 3: Certificados & QR */}
          <button
            onClick={() => onNavigateTab('certificates')}
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-sm group hover:scale-[1.02] active:scale-95 ${
              isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : isMono
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25'
            }`}
          >
            <div className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
              3
            </div>
            <div className="text-left">
              <span className="text-[10px] block opacity-70 leading-none">Paso 3 · Verificación</span>
              <span className="font-extrabold flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-400" />
                Certificado con QR
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
