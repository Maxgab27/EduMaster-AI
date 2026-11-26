import React, { useState } from 'react';
import { PieChart } from 'lucide-react';
import { completionStats } from '../../data/mockData';
import { ThemeMode } from '../../types';

interface CourseCompletionDonutProps {
  theme?: ThemeMode;
}

export const CourseCompletionDonut: React.FC<CourseCompletionDonutProps> = ({ theme = 'monochrome' }) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  // Compact dimensions
  const size = 115;
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const pCompleted = completionStats.slices[0].percent;
  const pInProgress = completionStats.slices[1].percent;
  const pNotStarted = completionStats.slices[2].percent;

  const lenCompleted = (pCompleted / 100) * circumference;
  const lenInProgress = (pInProgress / 100) * circumference;
  const lenNotStarted = (pNotStarted / 100) * circumference;

  const offsetCompleted = 0;
  const offsetInProgress = -lenCompleted;
  const offsetNotStarted = -(lenCompleted + lenInProgress);

  const sliceColors = isMono
    ? { completed: '#FFFFFF', inProgress: '#CBD5E1', notStarted: '#4B5563' }
    : isLight
    ? { completed: '#0F172A', inProgress: '#2563EB', notStarted: '#CBD5E1' }
    : { completed: '#00BFA6', inProgress: '#087FE5', notStarted: '#EF4444' };

  return (
    <div className={`glass-panel flex flex-col border rounded-2xl p-4 shadow-panel transition-colors ${
      isLight 
        ? 'border-slate-200/80 text-slate-900' 
        : isMono 
        ? 'border-white/10 text-white' 
        : 'border-edumaster-cardBorder text-slate-100'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PieChart className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
          <h2 className="text-xs font-bold tracking-tight m-0">Finalización de Cursos</h2>
        </div>
        <span className="text-[10px] font-mono opacity-50">Total: 100%</span>
      </div>

      {/* Donut and Legend Flex Container - Compact layout */}
      <div className="flex items-center justify-around gap-4 py-1 flex-1">
        {/* SVG Donut */}
        <div className="relative w-[115px] h-[115px] flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={isLight ? "#E2E8F0" : isMono ? "#202532" : "#06152B"}
              strokeWidth={strokeWidth}
            />

            {/* Slice 1: Completados 78% */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={sliceColors.completed}
              strokeWidth={hoveredSlice === 'Completados' ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={`${lenCompleted} ${circumference - lenCompleted}`}
              strokeDashoffset={offsetCompleted}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredSlice('Completados')}
              onMouseLeave={() => setHoveredSlice(null)}
            />

            {/* Slice 2: En Progreso 15% */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={sliceColors.inProgress}
              strokeWidth={hoveredSlice === 'En Progreso' ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={`${lenInProgress} ${circumference - lenInProgress}`}
              strokeDashoffset={offsetInProgress}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredSlice('En Progreso')}
              onMouseLeave={() => setHoveredSlice(null)}
            />

            {/* Slice 3: No Iniciados 7% */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={sliceColors.notStarted}
              strokeWidth={hoveredSlice === 'No Iniciados' ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={`${lenNotStarted} ${circumference - lenNotStarted}`}
              strokeDashoffset={offsetNotStarted}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredSlice('No Iniciados')}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          </svg>

          {/* Center Metric Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-black tracking-tight font-mono tabular-numbers leading-tight">
              {hoveredSlice === 'En Progreso' ? '15%' : hoveredSlice === 'No Iniciados' ? '7%' : `${completionStats.rate}%`}
            </span>
            <span className="text-[9px] font-bold opacity-70">
              {hoveredSlice || 'Completados'}
            </span>
            <span className="text-[8px] opacity-70 font-mono">
              ↑ {completionStats.change}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col gap-1.5 text-xs w-full max-w-[170px]">
          {completionStats.slices.map((slice, idx) => {
            const isHovered = hoveredSlice === slice.label;
            const itemColor = idx === 0 ? sliceColors.completed : idx === 1 ? sliceColors.inProgress : sliceColors.notStarted;
            return (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredSlice(slice.label)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer backdrop-blur-sm ${
                  isHovered 
                    ? (isLight
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : isMono
                        ? 'bg-white/20 border-white text-white font-black shadow-sm' 
                        : 'bg-white/15 border-white/40 text-white') 
                    : (isLight
                        ? 'bg-white/40 border-slate-200/60 text-slate-800 hover:bg-white/70 hover:border-slate-300'
                        : isMono
                        ? 'bg-white/[0.04] border-white/10 text-gray-200 hover:bg-white/[0.08]'
                        : 'bg-black/20 border-white/10 text-slate-200 hover:bg-black/30')
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: itemColor }}
                  />
                  <span className="font-semibold text-[11px] truncate">{slice.label}</span>
                </div>
                <span className="font-mono font-bold text-[11px] tabular-numbers shrink-0">
                  {slice.percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
