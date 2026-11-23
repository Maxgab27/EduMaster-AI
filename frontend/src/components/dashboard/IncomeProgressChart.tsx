import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { revenueChartData } from '../../data/mockData';
import { ThemeMode } from '../../types';

interface IncomeProgressChartProps {
  theme?: ThemeMode;
}

export const IncomeProgressChart: React.FC<IncomeProgressChartProps> = ({ theme = 'monochrome' }) => {
  const [activeSeries, setActiveSeries] = useState<'all' | 'subscriptions' | 'courses' | 'others'>('all');
  const [viewMode, setViewMode] = useState<'financial' | 'academic'>('financial');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(10); // November default

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const months = revenueChartData.months;
  const maxVal = 400;

  const svgWidth = 500;
  const svgHeight = 180;
  const paddingX = 10;
  const paddingBottom = 25;
  const effectiveWidth = svgWidth - paddingX * 2;
  const effectiveHeight = svgHeight - paddingBottom;
  const stepX = effectiveWidth / (months.length - 1);

  const getY = (val: number) => {
    return effectiveHeight - (val / maxVal) * (effectiveHeight - 20) - 10;
  };

  const createSmoothPath = (getValue: (m: typeof months[0]) => number) => {
    const points = months.map((m, i) => ({
      x: paddingX + i * stepX,
      y: getY(getValue(m))
    }));

    if (points.length === 0) return '';

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 5;
      const cp1y = p1.y + (p2.y - p0.y) / 5;
      const cp2x = p2.x - (p3.x - p1.x) / 5;
      const cp2y = p2.y - (p3.y - p1.y) / 5;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const pathSub = createSmoothPath(m => m.subscriptions);
  const pathCourses = createSmoothPath(m => m.courses);
  const pathOthers = createSmoothPath(m => m.others);

  const activeMonth = hoveredIdx !== null ? months[hoveredIdx] : null;

  // Series colors by theme
  const seriesColors = isMono 
    ? { sub: '#FFFFFF', courses: '#CBD5E1', others: '#9CA3AF' }
    : isLight
    ? { sub: '#0F172A', courses: '#2563EB', others: '#64748B' }
    : { sub: '#20C8F5', courses: '#8B4DFF', others: '#00BFA6' };

  return (
    <div className="glass-panel flex flex-col h-full border rounded-2xl p-5 shadow-panel">
      {/* Header and Toggle */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 opacity-80" />
            <h2 className="text-sm font-bold tracking-tight m-0">
              {viewMode === 'financial' ? 'Ingresos y Progreso Analítico' : 'Métricas Académicas y Horas de Estudio'}
            </h2>
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5 mt-1.5">
            <span className="text-2xl font-black tracking-tight font-mono tabular-numbers">
              {viewMode === 'financial' ? revenueChartData.total : '89,450 hrs'}
            </span>
            <span className="text-xs opacity-60">
              {viewMode === 'financial' ? 'Total de Ingresos' : 'Horas de Cursada'}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              isLight 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : isMono 
                ? 'bg-[#202532] border-[#3B4254] text-zinc-200' 
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
            }`}>
              ↑ +12.5% vs. mes anterior
            </span>
          </div>
        </div>

        {/* View Mode Toggle Button */}
        <div className={`flex items-center p-0.5 rounded-xl border text-xs ${
          isLight ? 'bg-slate-100 border-slate-300' : isMono ? 'bg-[#202532] border-[#3B4254]' : 'bg-black/40 border-white/10'
        }`}>
          <button
            onClick={() => setViewMode('financial')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'financial'
                ? (isMono ? 'bg-white text-zinc-950 font-black shadow-sm' : isLight ? 'bg-slate-900 text-white font-black shadow-sm' : 'bg-edumaster-blue text-white shadow-glowBlue')
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Financiero
          </button>
          <button
            onClick={() => setViewMode('academic')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'academic'
                ? (isMono ? 'bg-white text-zinc-950 font-black shadow-sm' : isLight ? 'bg-slate-900 text-white font-black shadow-sm' : 'bg-edumaster-violet text-white shadow-glowViolet')
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Académico
          </button>
        </div>
      </div>

      {/* Series Badges */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b mb-3 text-xs ${
        isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'
      }`}>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setActiveSeries(activeSeries === 'subscriptions' ? 'all' : 'subscriptions')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-black/10" style={{ backgroundColor: seriesColors.sub }} />
            <span className="opacity-75">Suscripciones:</span>
            <span className="font-bold font-mono tabular-numbers">$342,150</span>
          </button>

          <button
            onClick={() => setActiveSeries(activeSeries === 'courses' ? 'all' : 'courses')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-black/10" style={{ backgroundColor: seriesColors.courses }} />
            <span className="opacity-75">Cursos:</span>
            <span className="font-bold font-mono tabular-numbers">$98,150</span>
          </button>

          <button
            onClick={() => setActiveSeries(activeSeries === 'others' ? 'all' : 'others')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-black/10" style={{ backgroundColor: seriesColors.others }} />
            <span className="opacity-75">Otros Ingresos:</span>
            <span className="font-bold font-mono tabular-numbers">$24,000</span>
          </button>
        </div>

        <span className="text-[10px] opacity-50 font-mono tracking-wider">USD / MENSUAL</span>
      </div>

      {/* Interactive Chart Canvas */}
      <div className="relative flex-1 min-h-[175px] select-none">
        {/* Background Grid Lines & Values */}
        <div className={`absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono ${
          isLight ? 'opacity-60 text-slate-500' : isMono ? 'opacity-50 text-gray-400' : 'opacity-40'
        }`}>
          <div className={`border-b flex justify-between ${isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'}`}>
            <span>300k</span>
          </div>
          <div className={`border-b flex justify-between ${isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'}`}>
            <span>200k</span>
          </div>
          <div className={`border-b flex justify-between ${isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'}`}>
            <span>100k</span>
          </div>
          <div className={`border-b flex justify-between ${isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'}`}>
            <span>0</span>
          </div>
        </div>

        {/* SVG Drawing */}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible relative z-10"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="glow-sub-area-mono" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={seriesColors.sub} stopOpacity="0.25" />
              <stop offset="100%" stopColor={seriesColors.sub} stopOpacity="0.0" />
            </linearGradient>

            <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area under curves */}
          {(activeSeries === 'all' || activeSeries === 'subscriptions') && (
            <path
              d={`${pathSub} L ${paddingX + (months.length - 1) * stepX} ${effectiveHeight} L ${paddingX} ${effectiveHeight} Z`}
              fill="url(#glow-sub-area-mono)"
            />
          )}

          {/* Lines */}
          {(activeSeries === 'all' || activeSeries === 'subscriptions') && (
            <path
              d={pathSub}
              fill="none"
              stroke={seriesColors.sub}
              strokeWidth="2.8"
              filter="url(#line-glow)"
              className="transition-all duration-300"
            />
          )}

          {(activeSeries === 'all' || activeSeries === 'courses') && (
            <path
              d={pathCourses}
              fill="none"
              stroke={seriesColors.courses}
              strokeWidth="2.2"
              className="transition-all duration-300"
            />
          )}

          {(activeSeries === 'all' || activeSeries === 'others') && (
            <path
              d={pathOthers}
              fill="none"
              stroke={seriesColors.others}
              strokeWidth="1.8"
              strokeDasharray="4 4"
              className="transition-all duration-300"
            />
          )}

          {/* Magnetic Crosshair Column */}
          {hoveredIdx !== null && (
            <g>
              <line
                x1={paddingX + hoveredIdx * stepX}
                y1={5}
                x2={paddingX + hoveredIdx * stepX}
                y2={effectiveHeight}
                stroke={seriesColors.sub}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.85"
              />
              <circle
                cx={paddingX + hoveredIdx * stepX}
                cy={getY(months[hoveredIdx].subscriptions)}
                r="5.5"
                fill={seriesColors.sub}
                stroke="#000000"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Transparent Hit Columns */}
          {months.map((m, i) => (
            <rect
              key={m.month}
              x={paddingX + i * stepX - stepX / 2}
              y={0}
              width={stepX}
              height={svgHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
            />
          ))}
        </svg>

        {/* Floating Tooltip with Smooth Positioning */}
        {activeMonth && hoveredIdx !== null && (
          <div
            className={`absolute z-30 pointer-events-none p-2.5 rounded-xl border shadow-2xl backdrop-blur-md text-xs transition-all duration-150 ${
              isLight 
                ? 'bg-white border-slate-300 text-slate-900 shadow-xl' 
                : isMono 
                ? 'bg-[#1A1D24]/98 border-[#3B4254] text-white shadow-2xl' 
                : 'bg-[#0A1F3D]/95 border-edumaster-cyan/60 text-white'
            }`}
            style={{
              left: `${Math.min(78, Math.max(6, ((paddingX + hoveredIdx * stepX) / svgWidth) * 100))}%`,
              top: '10px',
              transform: 'translateX(-50%)'
            }}
          >
            <div className={`font-bold border-b pb-1 mb-1.5 flex justify-between gap-4 ${
              isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'
            }`}>
              <span>Mes de {activeMonth.month}</span>
              <span className="font-mono tabular-numbers">
                ${activeMonth.subscriptions + activeMonth.courses + activeMonth.others}k
              </span>
            </div>
            <div className="space-y-1 opacity-80 font-medium">
              <div className="flex justify-between gap-3 text-[11px]">
                <span>Suscripciones:</span>
                <span className="font-bold font-mono tabular-numbers">${activeMonth.subscriptions}k</span>
              </div>
              <div className="flex justify-between gap-3 text-[11px]">
                <span>Cursos:</span>
                <span className="font-bold font-mono tabular-numbers">${activeMonth.courses}k</span>
              </div>
              <div className="flex justify-between gap-3 text-[11px]">
                <span>Otros:</span>
                <span className="font-bold font-mono tabular-numbers">${activeMonth.others}k</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* X Axis Month Labels */}
      <div className={`flex justify-between text-[11px] pt-2 border-t font-medium ${
        isLight ? 'border-slate-200 text-slate-600' : isMono ? 'border-[#2A2F3D] text-gray-300' : 'border-white/10 opacity-60'
      }`}>
        {months.map((m, idx) => (
          <span
            key={m.month}
            className={`cursor-pointer transition-all ${
              hoveredIdx === idx ? 'opacity-100 font-bold scale-110' : 'hover:opacity-90'
            }`}
            onClick={() => setHoveredIdx(idx)}
          >
            {m.month}
          </span>
        ))}
      </div>
    </div>
  );
};
