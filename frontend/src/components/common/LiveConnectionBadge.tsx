import React from 'react';
import { ThemeMode } from '../../types';

interface LiveConnectionBadgeProps {
  isDemoMode: boolean;
  theme?: ThemeMode;
}

export const LiveConnectionBadge: React.FC<LiveConnectionBadgeProps> = ({
  isDemoMode,
  theme = 'monochrome'
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  return (
    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono border transition-colors ${
      isDemoMode
        ? (isLight 
            ? 'bg-amber-50 text-amber-900 border-amber-300' 
            : isMono 
            ? 'bg-[#1E1C18] text-amber-200 border-[#3D3320]' 
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30')
        : (isLight 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            : isMono 
            ? 'bg-[#16201B] text-emerald-300 border-[#263D31]' 
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30')
    }`}>
      <span className={`w-2 h-2 rounded-full ${
        isDemoMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
      }`} />
      <span className="font-semibold">
        {isDemoMode ? 'DEMO SINTÉTICO' : 'WS EN VIVO (14ms)'}
      </span>
    </div>
  );
};
