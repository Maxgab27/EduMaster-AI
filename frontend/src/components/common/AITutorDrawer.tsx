import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, User, ShieldCheck } from 'lucide-react';
import { ThemeMode } from '../../types';

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  theme = 'monochrome'
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'tutor'; text: string; time: string }[]>([
    {
      sender: 'tutor',
      text: '¡Hola! Estoy listo para responder tus dudas técnicas sobre redes neuronales, rúbricas o tareas en tiempo real.',
      time: 'Ahora'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal;
    setInputVal('');
    setMessages(prev => [...prev, { sender: 'user', text: userText, time: 'Ahora' }]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'tutor',
          text: `Analizando tu consulta: "${userText}". Según la Guía Curricular, recuerda que para estabilizar el entrenamiento con pérdidas multitarea es crucial calibrar los pesos λ (por ejemplo, λ₁=0.30 para finalización y λ₃=0.25 para riesgo).`,
          time: 'Ahora'
        }
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 shadow-2xl flex flex-col border-l animate-in slide-in-from-right duration-200">
      <div className={`h-full flex flex-col ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-white' : 'bg-[#06152B] border-edumaster-cyan/40 text-white'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'border-slate-200 bg-slate-50' : isMono ? 'border-[#2A2F3D] bg-[#1A1D24]' : 'border-edumaster-cardBorder bg-[#0A1F3D]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-blue-600 text-white' : isMono ? 'bg-white text-zinc-950 font-bold' : 'bg-edumaster-cyan text-slate-950 font-bold'
            }`}>
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold m-0">Tutor Pedagógico IA</h3>
              <span className="text-[10px] text-emerald-400 font-mono">Conectado en vivo</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight ? 'hover:bg-slate-200 border-slate-300' : isMono ? 'hover:bg-[#202532] border-[#2A2F3D]' : 'hover:bg-white/10 border-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border ${
                m.sender === 'user'
                  ? (isLight ? 'bg-blue-600 text-white border-blue-700 ml-6' : isMono ? 'bg-white text-zinc-950 font-medium ml-6 border-white' : 'bg-edumaster-blue text-white ml-6 border-edumaster-cyan/40')
                  : (isLight ? 'bg-slate-50 border-slate-200 mr-6' : isMono ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-200 mr-6' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-slate-200 mr-6')
              }`}
            >
              <p className="m-0">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className={`p-3 border-t flex items-center gap-2 ${
          isLight ? 'border-slate-200 bg-slate-50' : isMono ? 'border-[#2A2F3D] bg-[#1A1D24]' : 'border-edumaster-cardBorder bg-[#0A1F3D]'
        }`}>
          <input
            type="text"
            placeholder="Pregunta algo al tutor..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none ${
              isLight 
                ? 'bg-white border-slate-300 text-slate-900' 
                : isMono 
                ? 'bg-[#12151D] border-[#2A2F3D] text-white' 
                : 'bg-[#06152B] border-edumaster-cardBorder text-white'
            }`}
          />
          <button
            type="submit"
            className={`p-2 rounded-xl transition-all ${
              isLight ? 'bg-slate-900 text-white' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
