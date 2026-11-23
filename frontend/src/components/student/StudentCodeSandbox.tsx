import React, { useCallback, useEffect, useState } from 'react';
import { Play, RotateCcw, Terminal, Code2, ShieldAlert, AlertCircle, History } from 'lucide-react';
import type { SandboxAttempt, ThemeMode } from '../../types';
import { createAttempt, listAttemptsAsync } from '../../services/sandboxApi';
import { writeAudit } from '../../services/auditSink';

interface StudentCodeSandboxProps {
  theme?: ThemeMode;
  initialCode?: string;
  onCodeSuccess?: (attempt: SandboxAttempt) => void;
}

export const StudentCodeSandbox: React.FC<StudentCodeSandboxProps> = ({
  theme = 'monochrome',
  initialCode,
  onCodeSuccess,
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const defaultSnippet = initialCode || `# Laboratorio DEMO: modelo secuencial GRU
# El servidor NO ejecuta este codigo: solo analiza el texto.
import torch
import torch.nn as nn

x_seq = torch.randn(4, 14, 32)
gru = nn.GRU(input_size=32, hidden_size=64, batch_first=True)
out, h_n = gru(x_seq)
print(f"Shape salida GRU: {out.shape}")

# Para probar el guardrail, escribe eval("2 + 2") en una línea activa.
# Las líneas comentadas se ignoran: solo se analiza el código activo.
`;

  const [code, setCode] = useState(defaultSnippet);
  const [attempt, setAttempt] = useState<SandboxAttempt | null>(null);
  const [history, setHistory] = useState<SandboxAttempt[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHistory = useCallback(() => {
    listAttemptsAsync()
      .then(response => setHistory(response.data))
      .catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setError(null);
    setAttempt(null);
    try {
      const response = await createAttempt({ code, studentId: 'EST-DEMO-0001' });
      setAttempt(response.data);
      refreshHistory();
      await writeAudit({
        action: 'sandbox.attempt.created',
        correlationId: response.meta.correlationId,
        onlyDemo: true,
        detail: { id: response.data.id, status: response.data.status, findings: response.data.findings.length },
      });
      if (response.data.status === 'simulado' && onCodeSuccess) {
        onCodeSuccess(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el análisis');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(defaultSnippet);
    setAttempt(null);
    setError(null);
  };

  const statusClass = attempt?.status === 'bloqueado'
    ? 'border-rose-500/40 text-rose-400'
    : 'border-emerald-500/40 text-emerald-400';

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      isLight
        ? 'bg-white border-slate-200 shadow-sm'
        : isMono
        ? 'bg-[#151821] border-[#2A2F3D]'
        : 'glass-panel border-edumaster-cardBorder'
    }`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-inherit">
        <div className="flex items-center gap-2 flex-wrap">
          <Code2 className={`w-4 h-4 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
          <span className="text-xs font-bold tracking-tight">Laboratorio de Análisis Estático</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusClass}`}>
            SIN EJECUCIÓN REMOTA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : isMono ? 'hover:bg-[#202532] border-[#2A2F3D] text-zinc-300' : 'hover:bg-white/10 border-white/10 text-slate-300'
            }`}
            title="Reiniciar código"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => void handleRun()}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 ${
              isLight
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : isMono
                ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200'
                : 'bg-gradient-to-r from-edumaster-blue to-edumaster-cyan text-white hover:opacity-90'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Analizando...' : 'Analizar código'}
          </button>
        </div>
      </div>

      <div className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 mb-3 ${
        isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : isMono ? 'bg-[#1C1A16] border-[#3D3425] text-amber-200' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      }`}>
        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Guardrail activo: el código no se ejecuta en el navegador ni en el servidor. Los intentos se persisten y se auditan; ningún análisis modifica calificaciones.
        </span>
      </div>

      {error && (
        <p className={`text-xs p-2.5 rounded-xl border flex items-center gap-2 mb-3 ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      <div className="relative font-mono text-xs rounded-xl overflow-hidden border border-inherit">
        <div className={`px-3 py-1.5 flex items-center justify-between text-[11px] select-none ${
          isLight ? 'bg-slate-100 text-slate-600 border-b border-slate-200' : isMono ? 'bg-[#1C202B] text-zinc-400 border-b border-[#2A2F3D]' : 'bg-[#06152B] text-slate-400 border-b border-edumaster-cardBorder'
        }`}>
          <span>laboratorio_gru.py</span>
          <span>UTF-8 • análisis estático</span>
        </div>
        <textarea
          value={code}
          onChange={event => setCode(event.target.value)}
          spellCheck={false}
          rows={11}
          className={`w-full p-3 font-mono text-xs leading-relaxed focus:outline-none resize-none transition-colors ${
            isLight
              ? 'bg-slate-50 text-slate-900 selection:bg-blue-100'
              : isMono
              ? 'bg-[#0E1117] text-zinc-200 selection:bg-zinc-700'
              : 'bg-[#040D1A] text-emerald-300 selection:bg-edumaster-blue/40'
          }`}
        />
      </div>

      {attempt && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`rounded-xl p-3 border font-mono text-xs leading-relaxed overflow-x-auto ${
            isLight
              ? 'bg-slate-900 text-emerald-400 border-slate-800'
              : isMono
              ? 'bg-[#0A0C10] text-emerald-400 border-[#2A2F3D]'
              : 'bg-[#040D1A] text-emerald-300 border-emerald-500/30'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2 text-[10px] uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-3 h-3 text-emerald-400" />
                Resultado del análisis estático
              </span>
              <span className={`font-bold ${attempt.status === 'bloqueado' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {attempt.status}
              </span>
            </div>
            <pre className="m-0 whitespace-pre-wrap">{attempt.output}</pre>
            <ul className="mt-2 pl-4 space-y-0.5 m-0 list-disc">
              {attempt.findings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
            <p className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400 m-0">
              {attempt.guardrail} · intento {attempt.id}
            </p>
          </div>
        </div>
      )}

      <div className="mt-3">
        <div className={`flex items-center gap-2 text-[11px] font-bold mb-2 ${
          isLight ? 'text-slate-600' : 'text-slate-300'
        }`}>
          <History className="w-3.5 h-3.5" /> Historial de intentos
        </div>
        {history.length === 0 ? (
          <p className={`text-[11px] m-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Aún no hay intentos registrados.
          </p>
        ) : (
          <div className="space-y-1.5">
            {history.slice(-3).reverse().map(item => (
              <div
                key={item.id}
                className={`flex items-center justify-between text-[10px] font-mono p-2 rounded-lg border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : isMono ? 'bg-[#181C26] border-[#2A2F3D] text-zinc-400' : 'bg-[#06152B] border-edumaster-cardBorder text-slate-400'
                }`}
              >
                <span>{item.id}</span>
                <span className={item.status === 'bloqueado' ? 'text-rose-400' : 'text-emerald-400'}>
                  {item.status} · {item.findings.length} hallazgo(s)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
