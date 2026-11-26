import React from 'react';
import { Users, BookOpen, Clock, Award, ArrowUpRight } from 'lucide-react';
import { MetricCardData, ThemeMode } from '../../types';

interface MetricCardsRowProps {
  metrics: MetricCardData[];
  theme?: ThemeMode;
}

export const MetricCardsRow: React.FC<MetricCardsRowProps> = ({ metrics, theme = 'monochrome' }) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const getCardTheme = (index: number) => {
    if (isMono) {
      const monoGlows = ['#F97316', '#06B6D4', '#A855F7', '#10B981'];
      return {
        icon: index === 0 ? <Users className="w-4 h-4 text-white" /> : index === 1 ? <BookOpen className="w-4 h-4 text-white" /> : index === 2 ? <Clock className="w-4 h-4 text-white" /> : <Award className="w-4 h-4 text-white" />,
        glow: monoGlows[index % 4],
        sparkline: index === 0 ? [30, 42, 38, 55, 48, 62, 75] : index === 1 ? [20, 25, 32, 40, 45, 52, 60] : index === 2 ? [35, 38, 45, 50, 68, 72, 89] : [15, 22, 28, 35, 42, 50, 58],
        strokeColor: '#FFFFFF'
      };
    }
    if (isLight) {
      return {
        icon: index === 0 ? <Users className="w-4 h-4 text-slate-800" /> : index === 1 ? <BookOpen className="w-4 h-4 text-slate-800" /> : index === 2 ? <Clock className="w-4 h-4 text-slate-800" /> : <Award className="w-4 h-4 text-slate-800" />,
        glow: '#0F172A',
        sparkline: index === 0 ? [30, 42, 38, 55, 48, 62, 75] : index === 1 ? [20, 25, 32, 40, 45, 52, 60] : index === 2 ? [35, 38, 45, 50, 68, 72, 89] : [15, 22, 28, 35, 42, 50, 58],
        strokeColor: '#0F172A'
      };
    }
    // Cyber
    switch (index) {
      case 0:
        return {
          icon: <Users className="w-4 h-4 text-edumaster-cyan" />,
          glow: '#20C8F5',
          sparkline: [30, 42, 38, 55, 48, 62, 75],
          strokeColor: '#20C8F5'
        };
      case 1:
        return {
          icon: <BookOpen className="w-4 h-4 text-edumaster-blue" />,
          glow: '#087FE5',
          sparkline: [20, 25, 32, 40, 45, 52, 60],
          strokeColor: '#087FE5'
        };
      case 2:
        return {
          icon: <Clock className="w-4 h-4 text-edumaster-violet" />,
          glow: '#8B4DFF',
          sparkline: [35, 38, 45, 50, 68, 72, 89],
          strokeColor: '#8B4DFF'
        };
      case 3:
      default:
        return {
          icon: <Award className="w-4 h-4 text-emerald-400" />,
          glow: '#00BFA6',
          sparkline: [15, 22, 28, 35, 42, 50, 58],
          strokeColor: '#00BFA6'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((card, idx) => {
        const cTheme = getCardTheme(idx);
        return (
          <div
            key={card.title}
            className="glass-panel glass-panel-interactive border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group shadow-panel"
          >
            {/* Ambient Corner Glow on Hover */}
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-2xl pointer-events-none"
              style={{ backgroundColor: cTheme.glow }}
            />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold opacity-75 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-inner transition-colors backdrop-blur-sm ${
                isLight
                  ? 'bg-white/80 border-slate-200 text-slate-800 group-hover:border-slate-300'
                  : isMono
                  ? 'bg-white/10 border-white/15 text-white group-hover:border-white/30'
                  : 'bg-black/30 border-white/10 group-hover:border-white/30'
              }`}>
                {cTheme.icon}
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black tracking-tight font-mono tabular-numbers">
                {card.value}
              </span>
              <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                isLight
                  ? 'bg-emerald-500/15 border-emerald-300 text-emerald-800 font-bold'
                  : isMono
                  ? 'bg-[#d4ff32]/15 border-[#d4ff32]/35 text-[#d4ff32] font-mono font-bold'
                  : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/35 font-mono font-bold'
              }`}>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{card.change}</span>
              </div>
            </div>

            {/* Bottom Row with Subtext & Mini Sparkline */}
            <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
              isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'
            }`}>
              <span className={`text-[11px] ${isLight ? 'text-slate-500 font-medium' : isMono ? 'text-gray-400 font-medium' : 'opacity-60'}`}>
                {card.subtext}
              </span>

              {/* Vector Sparkline */}
              <svg className="w-16 h-5 overflow-visible" viewBox="0 0 60 20">
                <path
                  d={`M 0 ${20 - cTheme.sparkline[0] * 0.2} L 10 ${20 - cTheme.sparkline[1] * 0.2} L 20 ${20 - cTheme.sparkline[2] * 0.2} L 30 ${20 - cTheme.sparkline[3] * 0.2} L 40 ${20 - cTheme.sparkline[4] * 0.2} L 50 ${20 - cTheme.sparkline[5] * 0.2} L 60 ${20 - cTheme.sparkline[6] * 0.2}`}
                  fill="none"
                  stroke={cTheme.strokeColor}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isLight ? "1" : "0.9"}
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};
