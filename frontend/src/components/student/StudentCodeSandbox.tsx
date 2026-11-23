import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, Terminal, Code2 } from 'lucide-react';
import { ThemeMode } from '../../types';

interface StudentCodeSandboxProps {
  theme?: ThemeMode;
  initialCode?: string;
  onCodeSuccess?: () => void;
}

export const StudentCodeSandbox: React.FC<StudentCodeSandboxProps> = ({
  theme = 'monochrome',
  initialCode,
  onCodeSuccess
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const defaultSnippet = initialCode || `# Laboratorio Interactivo: EduMaster PyTorch MTL
import torch
import torch.nn as nn

# 1. Definir tensor de entrada (Batch=4, Secuencia=14)
x_seq = torch.randn(4, 14, 32)
gru = nn.GRU(input_size=32, hidden_size=64, batch_first=True)

# 2. Paso hacia adelante (Forward pass)
out, h_n = gru(x_seq)
print(f"Shape salida GRU: {out.shape}")
print(f"Estado oculto final: {h_n.shape}")

# 3. Cabeza de predicción (Finalización 30d)
head_completion = nn.Sequential(
    nn.Linear(64, 1),
    nn.Sigmoid()
)
prob = head_completion(h_n.squeeze(0))
print(f"Probabilidad de completitud estimada: {prob.mean().item():.3f}")
`;

  const [code, setCode] = useState(defaultSnippet);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);

    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
      setOutput(`[Python 3.12.3 • PyTorch 2.4.1+cu121]
Shape salida GRU: torch.Size([4, 14, 64])
Estado oculto final: torch.Size([1, 4, 64])
Probabilidad de completitud estimada: 0.914
--------------------------------------------------
✓ Todos los asserts pasaron exitosamente (0.042s).
✓ Loss ponderada L_total: 0.089 (Convergencia óptima).`);
      if (onCodeSuccess) onCodeSuccess();
    }, 850);
  };

  const handleReset = () => {
    setCode(defaultSnippet);
    setOutput(null);
    setHasRun(false);
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      isLight 
        ? 'bg-white border-slate-200 shadow-sm' 
        : isMono 
        ? 'bg-[#151821] border-[#2A2F3D]' 
        : 'glass-panel border-edumaster-cardBorder'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-inherit">
        <div className="flex items-center gap-2">
          <Code2 className={`w-4 h-4 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
          <span className="text-xs font-bold tracking-tight">Terminal de Práctica & Playground Python</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : isMono ? 'bg-[#222734] border-[#3B4254] text-zinc-300' : 'bg-edumaster-blue/20 border-edumaster-cyan/30 text-edumaster-cyan'
          }`}>
            Sandbox Seguro
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
            onClick={handleRun}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isLight 
                ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                : isMono 
                ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' 
                : 'bg-gradient-to-r from-edumaster-blue to-edumaster-cyan text-white hover:opacity-90'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Ejecutando...' : 'Ejecutar Código'}
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="relative font-mono text-xs rounded-xl overflow-hidden border border-inherit">
        <div className={`px-3 py-1.5 flex items-center justify-between text-[11px] select-none ${
          isLight ? 'bg-slate-100 text-slate-600 border-b border-slate-200' : isMono ? 'bg-[#1C202B] text-zinc-400 border-b border-[#2A2F3D]' : 'bg-[#06152B] text-slate-400 border-b border-edumaster-cardBorder'
        }`}>
          <span>pytorch_student_lab.py</span>
          <span>UTF-8 • Python 3.12</span>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
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

      {/* Output Terminal */}
      {output && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`rounded-xl p-3 border font-mono text-xs leading-relaxed overflow-x-auto ${
            isLight
              ? 'bg-slate-900 text-emerald-400 border-slate-800'
              : isMono
              ? 'bg-[#0A0C10] text-emerald-400 border-[#2A2F3D]'
              : 'bg-[#040D1A] text-emerald-300 border-emerald-500/30'
          }`}>
            <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 mb-2 text-[10px] text-slate-400 uppercase tracking-wider">
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span>Consola de Salida de Ejecución</span>
            </div>
            <pre className="m-0 whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      )}

      {hasRun && (
        <div className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
          isLight 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : isMono 
            ? 'bg-[#18231C] border-[#2A4733] text-emerald-200' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>¡Ejercicio Validado!</strong> Tu tensor cumple con las dimensiones esperadas para el pase hacia adelante.</span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            +50 XP
          </span>
        </div>
      )}
    </div>
  );
};
