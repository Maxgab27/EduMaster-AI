import React from 'react';
import { ThemeMode } from '../../types';

interface GlassBackgroundProps {
  theme: ThemeMode;
}

export const GlassBackground: React.FC<GlassBackgroundProps> = ({ theme }) => {
  const isLight = theme === 'light';
  const isMono = theme === 'monochrome';

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden" aria-hidden="true">
      {/* 1. Capa de imagen de fondo difuminada con efecto fluido */}
      <div 
        className="absolute -inset-16 bg-cover bg-center bg-no-repeat filter blur-3xl scale-110 opacity-70 sm:opacity-65 transition-all duration-700 will-change-transform"
        style={{ backgroundImage: "url('/bg-glass.jpg')" }}
      />

      {/* 2. Capa Glassmorphism adaptativa de tinte translúcido para contraste óptimo */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 backdrop-blur-2xl ${
          isLight 
            ? 'bg-slate-100/75' 
            : isMono 
            ? 'bg-[#0B0E14]/80' 
            : 'bg-[#030918]/75'
        }`}
      />

      {/* 3. Viñeta perimetral suave de profundidad glass */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          isLight ? 'opacity-20 bg-gradient-to-b from-transparent via-slate-900/5 to-slate-900/15' : 'opacity-60 bg-gradient-to-b from-transparent via-black/20 to-black/60'
        }`} 
      />
    </div>
  );
};
