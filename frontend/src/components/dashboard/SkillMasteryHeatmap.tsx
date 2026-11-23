import React, { useState } from 'react';
import { Target, Brain, ShieldCheck } from 'lucide-react';
import { skillMasteryData } from '../../data/mockData';
import { SkillCategory, ThemeMode } from '../../types';

interface SkillMasteryHeatmapProps {
  theme?: ThemeMode;
}

export const SkillMasteryHeatmap: React.FC<SkillMasteryHeatmapProps> = ({ theme = 'monochrome' }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    category: SkillCategory;
    levelKey: keyof SkillCategory['levels'];
    levelLabel: string;
    value: number;
  } | null>(null);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const levelColumns: { key: keyof SkillCategory['levels']; label: string }[] = [
    { key: 'aprender', label: 'Aprender' },
    { key: 'practicar', label: 'Practicar' },
    { key: 'aplicar', label: 'Aplicar' },
    { key: 'avanzado', label: 'Avanzado' },
    { key: 'experto', label: 'Experto' },
  ];

  const getCellColor = (val: number) => {
    if (isMono) {
      if (val >= 90) return '#FFFFFF';
      if (val >= 75) return '#E2E8F0';
      if (val >= 55) return '#94A3B8';
      if (val >= 35) return '#475569';
      if (val >= 20) return '#262B37';
      return '#1A1D24';
    }
    if (isLight) {
      if (val >= 90) return '#0F172A';
      if (val >= 75) return '#2563EB';
      if (val >= 55) return '#64748B';
      if (val >= 35) return '#94A3B8';
      if (val >= 20) return '#CBD5E1';
      return '#F1F5F9';
    }
    // Cyber
    if (val >= 90) return 'rgba(139, 77, 255, 0.95)';
    if (val >= 75) return 'rgba(139, 77, 255, 0.72)';
    if (val >= 55) return 'rgba(32, 200, 245, 0.65)';
    if (val >= 35) return 'rgba(8, 127, 229, 0.52)';
    if (val >= 20) return 'rgba(13, 43, 82, 0.75)';
    return 'rgba(10, 31, 61, 0.5)';
  };

  const getCellTextColor = (val: number) => {
    if (isMono) {
      return val >= 55 ? '#111317' : '#E2E8F0';
    }
    if (isLight) {
      return val >= 55 ? '#FFFFFF' : '#0F172A';
    }
    return '#FFFFFF';
  };

  return (
    <div className="glass-panel flex flex-col h-full border rounded-2xl p-5 relative shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 opacity-80" />
          <h2 className="text-sm font-bold tracking-tight m-0">
            Dominio de Habilidades – Mastery
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] opacity-70">
          <span className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Oficial Docente
          </span>
          <span className="opacity-40">|</span>
          <span className="flex items-center gap-1 font-semibold">
            <Brain className="w-3.5 h-3.5" /> Estimado IA
          </span>
        </div>
      </div>

      {/* Heatmap Grid & Vertical Legend Layout */}
      <div className="flex items-stretch gap-4 flex-1">
        {/* Matrix Grid */}
        <div className="flex-1 flex flex-col justify-between">
          {skillMasteryData.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 my-1">
              {/* Category Name Label */}
              <div className="w-36 text-xs font-medium flex items-center gap-1.5 truncate">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isMono ? 'bg-white' : 'bg-edumaster-cyan'}`} />
                <span className="truncate">{cat.name}</span>
                {cat.certifiedByDocent && (
                  <span title="Validado por rúbrica docente oficial">
                    <ShieldCheck className="w-3 h-3 opacity-80 shrink-0" />
                  </span>
                )}
              </div>

              {/* 5 Level Cells */}
              <div className="flex-1 grid grid-cols-5 gap-1.5">
                {levelColumns.map(col => {
                  const val = cat.levels[col.key];
                  const isHovered = 
                    hoveredCell?.category.id === cat.id && 
                    hoveredCell?.levelKey === col.key;

                  return (
                    <div
                      key={col.key}
                      onMouseEnter={() => setHoveredCell({
                        category: cat,
                        levelKey: col.key,
                        levelLabel: col.label,
                        value: val
                      })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-8 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center font-mono text-[10px] font-bold tabular-numbers border ${
                        isHovered 
                          ? (isLight ? 'ring-2 ring-slate-900 border-slate-900 scale-105 z-10 shadow-md' : 'ring-2 ring-white border-white scale-105 z-10 shadow-md') 
                          : isLight
                          ? 'border-slate-200 hover:border-slate-400'
                          : isMono
                          ? 'border-[#2E3343] hover:border-[#4D566D]'
                          : 'border-white/10 hover:brightness-125'
                      }`}
                      style={{
                        backgroundColor: getCellColor(val),
                        color: getCellTextColor(val)
                      }}
                    >
                      {val}%
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* X Axis Columns Labels */}
          <div className={`flex items-center gap-2 mt-2 pt-1 border-t ${
            isLight ? 'border-slate-200 text-slate-600' : isMono ? 'border-[#2A2F3D] text-gray-300' : 'border-white/10'
          }`}>
            <div className="w-36 text-[10px] opacity-50 font-mono">Competencia</div>
            <div className="flex-1 grid grid-cols-5 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-wider opacity-75">
              {levelColumns.map(col => (
                <span key={col.key}>{col.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Scale Legend on the Right (0% to 100%) */}
        <div className="w-10 flex flex-col items-center justify-between text-[9px] font-mono opacity-60 py-1 select-none">
          <span className="font-bold">100%</span>
          <div className={`w-2.5 flex-1 mx-auto my-1.5 rounded-full border ${
            isMono 
              ? 'bg-gradient-to-b from-white via-slate-400 to-[#1A1D24] border-[#3B4254]' 
              : isLight
              ? 'bg-gradient-to-b from-slate-900 via-blue-500 to-slate-200 border-slate-300'
              : 'bg-gradient-to-b from-[#8B4DFF] via-[#20C8F5] to-[#0A1F3D] border-white/10'
          }`} />
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span className="opacity-40">0%</span>
        </div>
      </div>

      {/* Floating Detail Tooltip */}
      {hoveredCell && (
        <div className={`absolute bottom-3 left-6 p-3 rounded-xl border shadow-2xl text-xs backdrop-blur-xl z-30 animate-in fade-in zoom-in-95 duration-150 max-w-sm ${
          isLight
            ? 'bg-white border-slate-300 text-slate-900 shadow-xl'
            : isMono
            ? 'bg-[#1A1D24]/98 border border-[#3B4254] text-white shadow-2xl'
            : 'bg-[#0A1F3D]/95 border-edumaster-cyan text-white'
        }`}>
          <div className={`flex items-center justify-between gap-4 font-bold mb-1.5 border-b pb-1 ${
            isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'
          }`}>
            <span>{hoveredCell.category.name}</span>
            <span className="font-mono font-black">{hoveredCell.levelLabel}: {hoveredCell.value}%</span>
          </div>
          <div className="text-[11px] opacity-80 leading-relaxed">
            {hoveredCell.category.certifiedByDocent ? (
              <span className="flex items-center gap-1.5 font-medium">
                ✓ Nivel convalidado por rúbrica docente oficial.
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-medium opacity-80">
                ℹ Estimación predictiva de red neuronal (pendiente de evaluación sumativa).
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
