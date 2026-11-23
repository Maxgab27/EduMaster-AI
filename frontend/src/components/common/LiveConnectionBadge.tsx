import React from 'react';
import { ThemeMode } from '../../types';
import { isDemoMode } from '../../services/apiClient';

interface LiveConnectionBadgeProps {
  theme?: ThemeMode;
}

/**
 * Indicador honesto de conexión: no hay WebSocket/SSE.
 * Con API configurada se usa REST /api/v1; sin ella, adaptadores DEMO locales.
 */
export const LiveConnectionBadge: React.FC<LiveConnectionBadgeProps> = ({
  theme = 'monochrome'
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';
  const demo = isDemoMode();

  return (
    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono border transition-colors ${
      isLight 
        ? 'bg-amber-50 text-amber-900 border-amber-300' 
        : isMono 
        ? 'bg-[#1E1C18] text-amber-200 border-[#3D3320]' 
        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    }`} title={
      demo
        ? 'Sin VITE_API_BASE_URL: adaptadores DEMO locales, sin conexión a backend'
        : 'API REST /api/v1 conectada; sin WebSocket/SSE y con datos sintéticos'
    }>
      <span className="w-2 h-2 rounded-full bg-amber-400" />
      <span className="font-semibold">
        {demo ? 'SIN API · DATOS SINTÉTICOS' : 'API REST · SIN WEBSOCKET'}
      </span>
    </div>
  );
};
