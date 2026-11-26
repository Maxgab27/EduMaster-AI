import React from 'react';
import { ThemeMode } from '../../types';
import { isDemoMode } from '../../services/apiClient';

interface LiveConnectionBadgeProps {
  theme?: ThemeMode;
}

/**
 * Indicador honesto y minimalista del estado de la plataforma.
 */
export const LiveConnectionBadge: React.FC<LiveConnectionBadgeProps> = ({
  theme = 'monochrome'
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';
  const demo = isDemoMode();

  return (
    <div
      className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono border backdrop-blur-md transition-all ${
        isLight 
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-800' 
          : isMono 
          ? 'bg-white/[0.04] border-white/10 text-zinc-300' 
          : 'bg-black/30 border-white/10 text-cyan-300'
      }`}
      title={
        demo
          ? 'Entorno local de demostración: adaptadores DEMO locales con datos sintéticos'
          : 'API REST /api/v1 conectada'
      }
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
      <span className="font-semibold">
        {demo ? 'DEMO · DATOS LOCALES' : 'API REST /api/v1'}
      </span>
    </div>
  );
};
