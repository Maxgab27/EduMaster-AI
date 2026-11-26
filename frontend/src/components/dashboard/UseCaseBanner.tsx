import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckSquare, Award, ArrowRight, FileText, X, Printer, ShieldCheck, BrainCircuit } from 'lucide-react';
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
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);

  return (
    <>
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

          {/* 3 Pasos Interactivos con 1 Clic + Ficha Técnica */}
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
              onClick={() => {
                localStorage.setItem('edumaster_target_submission_id', 'sub-102');
                onNavigateTab('assessments');
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-sm group hover:scale-[1.02] active:scale-95 ${
                isLight
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                  : isMono
                  ? 'bg-white text-zinc-950 font-black border-white hover:bg-zinc-200'
                  : 'bg-edumaster-blue border-edumaster-cyan/50 text-white hover:bg-edumaster-blue/80 shadow-glowBlue'
              }`}
              title="Abre directamente SpeedGrader con la entrega de Mateo Vargas para calificar con firma SHA-256"
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

            {/* Botón de Ficha Técnica & Guion de Sustentación */}
            <button
              onClick={() => setIsPitchModalOpen(true)}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0 ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                  : isMono
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  : 'bg-white/10 hover:bg-white/20 text-edumaster-cyan border-edumaster-cyan/30'
              }`}
              title="Ver Ficha Técnica del Proyecto y Guion de Sustentación"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ficha Técnica</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Ficha Técnica & Guion de Sustentación */}
      {isPitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-5 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'bg-[#06152B] border-edumaster-cyan/40 text-white shadow-glowCyan'
          }`}>
            {/* Header del Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-inherit">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-edumaster-cyan/20 text-edumaster-cyan border border-edumaster-cyan/40">
                    SENATI · ENTREGABLE FINAL 2026-II
                  </span>
                  <span className="text-xs opacity-60 font-mono">Caso de Uso Estratégico</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black mt-1 m-0">
                  Ficha Técnica &amp; Guion Ejecutivo de Sustentación
                </h2>
              </div>
              <button
                onClick={() => setIsPitchModalOpen(false)}
                className="p-1.5 rounded-xl border hover:opacity-80 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido: Los 4 Ejes del Caso de Uso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className={`p-4 rounded-2xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'}`}>
                <div className="flex items-center gap-2 font-black text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>1. Diagnóstico del Problema</span>
                </div>
                <p className="opacity-80 leading-relaxed m-0">
                  Deserción estudiantil silenciosa por falta de acompañamiento temprano en asignaturas técnicas de alta complejidad (Deep Learning, MLOps).
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'}`}>
                <div className="flex items-center gap-2 font-black text-edumaster-cyan">
                  <BrainCircuit className="w-4 h-4" />
                  <span>2. Motor de Machine Learning (MTL)</span>
                </div>
                <p className="opacity-80 leading-relaxed m-0">
                  Cabeza C del modelo multitarea. Inferencia vectorial en 8.4 ms mediante sigmoide logística: <strong>P = σ(W·X + b)</strong> sobre 5 características académicas.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'}`}>
                <div className="flex items-center gap-2 font-black text-indigo-400">
                  <CheckSquare className="w-4 h-4" />
                  <span>3. Human-in-the-Loop &amp; SpeedGrader</span>
                </div>
                <p className="opacity-80 leading-relaxed m-0">
                  La IA no califica ni reprueba al alumno; el docente valida la rúbrica formativa y sella la nota con firma criptográfica <strong>SHA-256 de 64 caracteres</strong>.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'}`}>
                <div className="flex items-center gap-2 font-black text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>4. Cumplimiento Ley N.° 29733</span>
                </div>
                <p className="opacity-80 leading-relaxed m-0">
                  Art. 19: Prohibida la toma de decisiones punitivas automatizadas. Registro inmutable en logs de auditoría para trazabilidad institucional.
                </p>
              </div>
            </div>

            {/* Guion de Sustentación de 2 Minutos */}
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-500/10 border-blue-500/30'}`}>
              <h3 className="text-sm font-black text-blue-400 m-0 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Guion de Sustentación Recomendado (Pitch de 2 Minutos)
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs opacity-90 leading-relaxed m-0">
                <li>
                  <strong>Introducción:</strong> <em>"EduMaster.ai resuelve el abandono estudiantil en cursos de IA antes de que el estudiante deserte, no después de desaprobarlo."</em>
                </li>
                <li>
                  <strong>Inferencia con ML:</strong> <em>"En la pestaña Análisis procesamos una cohorte de 20 estudiantes. El modelo vectorial calcula en 8.4 ms el riesgo y desglosa los factores causales dominantes."</em>
                </li>
                <li>
                  <strong>Intervención Humana (SpeedGrader):</strong> <em>"El docente hace clic en 'Intervenir', revisa el código con rúbrica asistida, retroalimenta al alumno y firma con hash SHA-256 auditable."</em>
                </li>
                <li>
                  <strong>Cierre y Certificación:</strong> <em>"Al cambiar al rol Estudiante, comprobamos la privacidad bajo la Ley 29733 y cómo el alumno recuperado culmina con su certificado QR inmutable."</em>
                </li>
              </ol>
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-inherit">
              <span className="text-[11px] font-mono opacity-60">
                Modelo: edumaster-mtl-v2.4-calibrated · PR-AUC: 0.914 · Brier: 0.082
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPitchModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-edumaster-cyan text-slate-950 hover:opacity-90"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
