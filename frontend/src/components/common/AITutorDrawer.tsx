import React, { useState } from 'react';
import { Bot, X, Send, RotateCcw } from 'lucide-react';
import type { ThemeMode } from '../../types';
import { useTutor } from '../../hooks/useTutor';
import { tutorSourceLabel } from '../../services/tutorApi';

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
  const { messages, meta, sending, error, send, reset } = useTutor();
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    const text = inputVal.trim();
    if (!text || sending) return;
    setInputVal('');
    void send(text);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 shadow-2xl flex flex-col border-l animate-in slide-in-from-right duration-200">
      <div className={`h-full flex flex-col ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-white' : 'bg-[#06152B] border-edumaster-cyan/40 text-white'
      }`}>
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
              <span className="text-[10px] text-amber-400 font-mono">{tutorSourceLabel(meta)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={reset}
              className={`p-1.5 rounded-lg border transition-colors ${
                isLight ? 'hover:bg-slate-200 border-slate-300' : isMono ? 'hover:bg-[#202532] border-[#2A2F3D]' : 'hover:bg-white/10 border-white/10'
              }`}
              title="Nueva conversación"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-colors ${
                isLight ? 'hover:bg-slate-200 border-slate-300' : isMono ? 'hover:bg-[#202532] border-[#2A2F3D]' : 'hover:bg-white/10 border-white/10'
              }`}
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className={`px-4 py-2 text-[11px] border-b ${
            isLight ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}>
            {error}
          </div>
        )}

        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
          {messages.map(message => (
            <div
              key={message.id}
              className={`p-3 rounded-2xl border ${
                message.sender === 'user'
                  ? (isLight ? 'bg-blue-600 text-white border-blue-700 ml-6' : isMono ? 'bg-white text-zinc-950 font-medium ml-6 border-white' : 'bg-edumaster-blue text-white ml-6 border-edumaster-cyan/40')
                  : (isLight ? 'bg-slate-50 border-slate-200 mr-6' : isMono ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-200 mr-6' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-slate-200 mr-6')
              }`}
            >
              <p className="m-0 whitespace-pre-wrap">{message.text}</p>
              {message.sender === 'tutor' && message.sources && message.sources.length > 0 && (
                <div className={`mt-2 pt-2 border-t flex flex-wrap gap-1 text-[9px] font-mono ${
                  isLight ? 'border-slate-200 text-slate-600' : isMono ? 'border-[#2A2F3D] text-slate-400' : 'border-edumaster-cardBorder/60 text-edumaster-cyan'
                }`}>
                  {message.sources.map(source => <span key={source}>{source}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className={`p-3 border-t flex items-center gap-2 ${
          isLight ? 'border-slate-200 bg-slate-50' : isMono ? 'border-[#2A2F3D] bg-[#1A1D24]' : 'border-edumaster-cardBorder bg-[#0A1F3D]'
        }`}>
          <input
            type="text"
            aria-label="Pregunta al tutor"
            placeholder="Pregunta algo al tutor..."
            value={inputVal}
            onChange={event => setInputVal(event.target.value)}
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
            disabled={sending || !inputVal.trim()}
            className={`p-2 rounded-xl transition-all disabled:opacity-40 ${
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
