import React, { useState } from 'react';
import { Bot, Send, User, ShieldCheck, RotateCcw } from 'lucide-react';
import type { ThemeMode } from '../../types';
import { useTutor } from '../../hooks/useTutor';
import { tutorSourceLabel } from '../../services/tutorApi';

interface AITutorViewProps {
  theme?: ThemeMode;
}

function formatTime(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export const AITutorView: React.FC<AITutorViewProps> = ({ theme = 'monochrome' }) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';
  const { messages, meta, sending, error, send, reset } = useTutor();
  const [inputVal, setInputVal] = useState('');

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    const text = inputVal.trim();
    if (!text || sending) return;
    setInputVal('');
    void send(text);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <Bot className={`w-5 h-5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
            IA Tutor Pedagógico & Motor Explicativo
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Respuestas gobernadas por reglas trazables, con fuentes y guardrails. Sin LLM externo ni datos institucionales.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            {tutorSourceLabel(meta)}
          </span>
          <button
            onClick={reset}
            title="Nueva conversación"
            className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'}`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className={`p-3 rounded-xl border text-xs ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {error}
        </div>
      )}

      <div className={`border rounded-2xl flex flex-col h-[520px] overflow-hidden transition-colors ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm'
          : isMono
          ? 'bg-[#151821] border-[#2A2F3D]'
          : 'glass-panel border-edumaster-cardBorder'
      }`}>
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 max-w-2xl ${message.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                message.sender === 'user'
                  ? (isLight ? 'bg-slate-900 text-white' : isMono ? 'bg-white text-zinc-950 font-bold' : 'bg-edumaster-blue text-white')
                  : (isLight ? 'bg-blue-600 text-white' : isMono ? 'bg-[#262B37] text-white border border-[#3B4254]' : 'bg-edumaster-violet text-white shadow-glowViolet')
              }`}>
                {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`rounded-2xl p-4 text-xs leading-relaxed border ${
                message.sender === 'user'
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
                <p className="m-0 whitespace-pre-wrap">{message.text}</p>

                {message.sender === 'tutor' && (
                  <div className={`mt-3 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] ${
                    isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder/60'
                  }`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      {typeof message.confidence === 'number' && (
                        <span className={`font-mono flex items-center gap-1 font-bold ${
                          isLight ? 'text-emerald-700' : 'text-emerald-400'
                        }`}>
                          <ShieldCheck className="w-3 h-3" /> Confianza: {(message.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                      {message.sources && message.sources.length > 0 && (
                        <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <span>Fuentes:</span>
                          {message.sources.map(source => (
                            <span key={source} className={`px-1.5 py-0.5 rounded border font-mono ${
                              isLight
                                ? 'bg-slate-100 border-slate-200 text-slate-800'
                                : isMono
                                ? 'bg-[#242A38] border-[#3B4254] text-zinc-200'
                                : 'bg-[#06152B] text-edumaster-cyan border-edumaster-cardBorder'
                            }`}>
                              {source}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className={`p-3 border-t flex gap-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
        }`}>
          <input
            type="text"
            aria-label="Pregunta al tutor"
            value={inputVal}
            onChange={event => setInputVal(event.target.value)}
            placeholder="Pregunta sobre riesgo, dominio, certificación, comunidad o gobernanza..."
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
            disabled={sending || !inputVal.trim()}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40 ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : isMono
                ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200'
                : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white shadow-glowBlue'
            }`}
          >
            <span>{sending ? 'Enviando...' : 'Enviar'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
