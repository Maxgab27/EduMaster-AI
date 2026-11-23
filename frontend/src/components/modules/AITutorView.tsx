import React, { useState } from 'react';
import { Bot, Send, User, ShieldCheck } from 'lucide-react';
import { ThemeMode } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  confidence?: number;
  sources?: string[];
}

interface AITutorViewProps {
  theme?: ThemeMode;
}

export const AITutorView: React.FC<AITutorViewProps> = ({ theme = 'monochrome' }) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'tutor',
      text: '¡Hola! Soy el Asistente Pedagógico de EduMaster.ai. He analizado las trayectorias de la cohorte actual. Puedo asistirte en la explicación de tópicos complejos, diseño de actividades de refuerzo o diagnóstico de vacíos de aprendizaje.',
      timestamp: '10:00 AM',
      confidence: 0.98,
      sources: ['Guía Curricular v2.1', 'Histórico de Evaluaciones']
    },
    {
      id: 'm2',
      sender: 'user',
      text: '¿Por qué la tasa de error en la Cabeza B (Dominio de Habilidades) sube en la cohorte de Fin de Semana?',
      timestamp: '10:02 AM'
    },
    {
      id: 'm3',
      sender: 'tutor',
      text: 'Tras contrastar las variables `sessions_14d` y `late_submissions_30d`, se observa que el 42% de los estudiantes del grupo de fin de semana no completó la actividad práctica formativa N° 3 antes de rendir el examen sumativo. Te recomiendo habilitar un laboratorio práctico asíncrono con feedback guiado.',
      timestamp: '10:02 AM',
      confidence: 0.94,
      sources: ['Módulo PyTorch MTL', 'Rúbrica N° 3 de Laboratorio']
    }
  ]);

  const [inputVal, setInputVal] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: inputVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      const replyMsg: Message = {
        id: `t-${Date.now()}`,
        sender: 'tutor',
        text: `He recibido tu consulta sobre: "${userMsg.text}". El motor de inferencia calcula una sugerencia adaptativa basada en competencias prioritarias y recomienda revisar el capítulo 4 de Transformers con ponderación λ=0.35.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.92,
        sources: ['Base de Conocimiento Curricular', 'Model Registry MTL']
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 700);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black flex items-center gap-2 m-0">
          <Bot className={`w-5 h-5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
          IA Tutor Pedagógico & Motor Explicativo
        </h1>
        <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Asistente cognitivo con explicabilidad fundamentada, guardrails éticos y trazabilidad de fuentes.
        </p>
      </div>

      {/* Chat Container */}
      <div className={`border rounded-2xl flex flex-col h-[520px] overflow-hidden transition-colors ${
        isLight 
          ? 'bg-white border-slate-200 shadow-sm' 
          : isMono 
          ? 'bg-[#151821] border-[#2A2F3D]' 
          : 'glass-panel border-edumaster-cardBorder'
      }`}>
        {/* Chat Messages Log */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-2xl ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                m.sender === 'user' 
                  ? (isLight ? 'bg-slate-900 text-white' : isMono ? 'bg-white text-zinc-950 font-bold' : 'bg-edumaster-blue text-white')
                  : (isLight ? 'bg-blue-600 text-white' : isMono ? 'bg-[#262B37] text-white border border-[#3B4254]' : 'bg-edumaster-violet text-white shadow-glowViolet')
              }`}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`rounded-2xl p-4 text-xs leading-relaxed border ${
                m.sender === 'user'
                  ? (isLight 
                      ? 'bg-slate-900 text-white border-slate-900 rounded-tr-none' 
                      : isMono 
                      ? 'bg-white text-zinc-950 font-medium border-white rounded-tr-none' 
                      : 'bg-edumaster-blue text-white rounded-tr-none border-edumaster-blue')
                  : (isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                      : isMono
                      ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-100 rounded-tl-none'
                      : 'bg-[#0A1F3D] border-edumaster-cardBorder text-slate-200 rounded-tl-none shadow-panel')
              }`}>
                <p className="m-0">{m.text}</p>

                {m.sender === 'tutor' && (
                  <div className={`mt-3 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] ${
                    isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder/60'
                  }`}>
                    {m.confidence && (
                      <span className={`font-mono flex items-center gap-1 font-bold ${
                        isLight ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        <ShieldCheck className="w-3 h-3" /> Confianza: {(m.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                    {m.sources && (
                      <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        <span>Fuentes:</span>
                        {m.sources.map(s => (
                          <span key={s} className={`px-1.5 py-0.5 rounded border font-mono ${
                            isLight 
                              ? 'bg-slate-100 border-slate-200 text-slate-800' 
                              : isMono 
                              ? 'bg-[#242A38] border-[#3B4254] text-zinc-200' 
                              : 'bg-[#06152B] px-1.5 py-0.5 text-edumaster-cyan border-edumaster-cardBorder'
                          }`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className={`p-3 border-t flex gap-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
        }`}>
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Pregunta sobre rutas, cohortes, brechas de competencias o explicaciones..."
            className={`flex-1 rounded-xl px-4 py-2 text-xs focus:outline-none transition-colors border ${
              isLight 
                ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-800' 
                : isMono 
                ? 'bg-[#12141A] border-[#2A2F3D] text-white placeholder-zinc-500 focus:border-white' 
                : 'bg-[#06152B] border-edumaster-cardBorder text-white placeholder-slate-400 focus:border-edumaster-cyan'
            }`}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isLight 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : isMono 
                ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' 
                : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white shadow-glowBlue'
            }`}
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
