import React, { useState } from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  Code2, 
  Bookmark, 
  Clock, 
  Sparkles
} from 'lucide-react';
import { ThemeMode } from '../../types';
import { StudentCodeSandbox } from './StudentCodeSandbox';

interface StudentStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const StudentStudyModal: React.FC<StudentStudyModalProps> = ({
  isOpen,
  onClose,
  theme = 'monochrome'
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'sandbox' | 'notes'>('content');
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem('edumaster_student_notes') || 
`# Mis Apuntes: Arquitectura de Redes Neuronales & Transformers
- La atención FlashAttention-2 reduce accesos a memoria HBM a O(N).
- Función de pérdida ponderada: L_total = λ₁·BCE + λ₂·CE + λ₃·BCE + λ₄·Rank.
- El tensor de entrada requiere normalización Min-Max para variables ordinales.`;
  });
  const [notesSaved, setNotesSaved] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(2);

  if (!isOpen) return null;

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const lessons = [
    { id: 1, title: '1. Fundamentos Matemáticos del Backpropagation', duration: '18 min', completed: true },
    { id: 2, title: '2. Inicialización de Pesos Xavier & He Normal', duration: '22 min', completed: true },
    { id: 3, title: '3. Redes Recurrentes GRU y Modelado Secuencial', duration: '28 min', completed: false, current: true },
    { id: 4, title: '4. Mecanismo de Atención de Producto Escalar', duration: '35 min', completed: false },
    { id: 5, title: '5. Calibración de Probabilidades con Brier Score', duration: '25 min', completed: false },
  ];

  const handleSaveNotes = () => {
    localStorage.setItem('edumaster_student_notes', notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-6xl h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl transition-colors ${
        isLight 
          ? 'bg-white border-slate-300 text-slate-900' 
          : isMono 
          ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' 
          : 'bg-[#06152B] border-edumaster-cyan/40 text-slate-100'
      }`}>
        {/* Top Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'border-slate-200 bg-slate-50' : isMono ? 'border-[#2A2F3D] bg-[#1A1D24]' : 'border-edumaster-cardBorder bg-[#0A1F3D]'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
              isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : isMono ? 'bg-[#242A38] border-[#3B4254] text-white' : 'bg-edumaster-blue/20 border-edumaster-cyan/40 text-edumaster-cyan'
            }`}>
              DL-401 • MODO ENFOQUE
            </span>
            <div>
              <h2 className="text-sm font-bold m-0 tracking-tight">Arquitectura de Redes Neuronales & Transformers</h2>
              <p className="text-[11px] opacity-60 m-0">Lección 3: Redes Recurrentes GRU y Modelado Secuencial</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switchers */}
            <div className={`flex p-1 rounded-xl border text-xs ${
              isLight ? 'bg-slate-200 border-slate-300' : isMono ? 'bg-[#202532] border-[#3B4254]' : 'bg-[#06152B] border-edumaster-cardBorder'
            }`}>
              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'content'
                    ? (isLight ? 'bg-white shadow text-slate-900 font-bold' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                Contenido
              </button>
              <button
                onClick={() => setActiveTab('sandbox')}
                className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
                  activeTab === 'sandbox'
                    ? (isLight ? 'bg-white shadow text-slate-900 font-bold' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Terminal
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
                  activeTab === 'notes'
                    ? (isLight ? 'bg-white shadow text-slate-900 font-bold' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Mis Notas
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors ${
                isLight ? 'hover:bg-slate-200 border-slate-300 text-slate-700' : isMono ? 'hover:bg-[#202532] border-[#2A2F3D] text-zinc-300' : 'hover:bg-white/10 border-white/10 text-slate-200'
              }`}
              title="Cerrar reproductor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === 'content' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Simulated Video Player / Interactive Presentation */}
                <div className={`relative aspect-video rounded-2xl border overflow-hidden flex flex-col justify-between p-6 select-none shadow-lg ${
                  isLight 
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700' 
                    : isMono 
                    ? 'bg-[#0E1117] border-[#2A2F3D] text-white' 
                    : 'bg-gradient-to-br from-[#06152B] to-[#0A1F3D] border-edumaster-cyan/30 text-white'
                }`}>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                      Masterclass Video • HD 1080p
                    </span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Sesión Sincronizada
                    </span>
                  </div>

                  {/* Play Overlay */}
                  <div className="text-center my-auto z-10 flex flex-col items-center">
                    <button className="w-16 h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform group">
                      <Play className="w-7 h-7 fill-current translate-x-0.5 group-hover:text-blue-600 transition-colors" />
                    </button>
                    <p className="text-xs font-semibold text-slate-200 mt-3 tracking-wide">
                      Reproducir: Dinámica de Puertas de Actualización y Reset en GRU
                    </p>
                  </div>

                  {/* Player Progress Bar */}
                  <div className="z-10 space-y-1.5">
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[45%]" />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-300">
                      <span>12:40</span>
                      <span>28:00</span>
                    </div>
                  </div>
                </div>

                {/* Technical Reading & Code Summary */}
                <div className={`p-6 rounded-2xl border space-y-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#181C26] border-[#2A2F3D]' : 'bg-[#0A1F3D]/80 border-edumaster-cardBorder'
                }`}>
                  <h3 className="text-base font-bold m-0 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Puntos Clave del Módulo (Documento Técnico)
                  </h3>
                  <p className="text-xs leading-relaxed opacity-80 m-0">
                    La unidad <strong>GRU (Gated Recurrent Unit)</strong> resuelve el problema del desvanecimiento del gradiente en series temporales de aprendizaje sin la sobrecarga de parámetros de una LSTM tradicional. Al fusionar el estado de celda y el estado oculto, reduce en un 25% el coste de entrenamiento:
                  </p>
                  
                  <div className={`p-3 rounded-xl font-mono text-xs border ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : isMono ? 'bg-[#0F1218] border-[#2A2F3D] text-zinc-200' : 'bg-[#06152B] border-white/10 text-emerald-300'
                  }`}>
                    z_t = σ(W_z · [h_(t-1), x_t]) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Puerta de actualización<br/>
                    r_t = σ(W_r · [h_(t-1), x_t]) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Puerta de reset<br/>
                    h~_t = tanh(W · [r_t * h_(t-1), x_t]) # Candidato a estado
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs opacity-70">
                      ¿Listo para probar las dimensiones del tensor?
                    </span>
                    <button
                      onClick={() => setActiveTab('sandbox')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        isLight ? 'bg-slate-900 text-white' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      Abrir Terminal de Práctica
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sandbox' && (
              <div className="max-w-4xl mx-auto">
                <StudentCodeSandbox theme={theme} />
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold m-0">Tus Apuntes Personales de Estudio</h3>
                    <p className="text-xs opacity-60 m-0">Se guardan automáticamente en tu dispositivo para consulta offline</p>
                  </div>
                  <button
                    onClick={handleSaveNotes}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isLight ? 'bg-slate-900 text-white' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white'
                    }`}
                  >
                    Guardar Notas
                  </button>
                </div>

                {notesSaved && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Notas sincronizadas en tu almacenamiento local.</span>
                  </div>
                )}

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={14}
                  className={`w-full p-4 rounded-2xl border font-mono text-xs leading-relaxed focus:outline-none transition-colors ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-800' 
                      : isMono 
                      ? 'bg-[#0E1117] border-[#2A2F3D] text-zinc-100' 
                      : 'bg-[#040D1A] border-edumaster-cardBorder text-slate-200'
                  }`}
                  placeholder="Escribe tus notas aquí..."
                />
              </div>
            )}
          </div>

          {/* Right Syllabus Sidebar */}
          <div className={`w-80 border-l p-4 flex flex-col justify-between shrink-0 overflow-y-auto ${
            isLight ? 'border-slate-200 bg-slate-50' : isMono ? 'border-[#2A2F3D] bg-[#171A23]' : 'border-edumaster-cardBorder bg-[#081930]'
          }`}>
            <div>
              <div className="pb-3 border-b border-inherit mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Plan de Estudio del Módulo
                </span>
                <div className="flex items-center justify-between text-xs font-semibold mt-1">
                  <span>Progreso de la Unidad</span>
                  <span className="font-mono text-emerald-400 font-bold">40%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                {lessons.map((lesson, idx) => {
                  const isCurrent = idx === currentLessonIndex;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                        isCurrent
                          ? (isLight ? 'bg-white shadow-sm border border-slate-300 font-bold text-slate-900' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white shadow-glowBlue')
                          : 'opacity-70 hover:opacity-100 hover:bg-black/10'
                      }`}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] shrink-0 mt-0.5 ${
                          isCurrent ? 'border-current font-bold' : 'border-inherit'
                        }`}>
                          {lesson.id}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="m-0 truncate leading-tight">{lesson.title}</p>
                        <span className="text-[10px] opacity-60 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" /> {lesson.duration}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`pt-3 border-t border-inherit mt-4 text-center`}>
              <button
                onClick={onClose}
                className={`w-full py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isLight 
                    ? 'border-slate-300 hover:bg-slate-200 text-slate-800' 
                    : isMono 
                    ? 'border-[#3B4254] hover:bg-[#202532] text-zinc-200' 
                    : 'border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                Cerrar y Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
