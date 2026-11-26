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
      {/* 1. Capa de imagen de fondo panorámica horizontal ('echada') con haces cromáticos de luz */}
      <div 
        className="absolute -inset-6 bg-cover bg-center bg-no-repeat filter blur-[8px] saturate-[185%] brightness-[1.12] scale-105 opacity-95 transition-all duration-700 will-change-transform"
        style={{ backgroundImage: "url('/bg-glass.jpg')" }}
      />

      {/* 2. Resplandores cromáticos directos alineados con la imagen (Ámbar dorado a la izq, Coral al centro, Azul cian a la der) */}
      <div 
        className="absolute inset-0 transition-opacity duration-700 opacity-70 mix-blend-screen"
        style={{
          backgroundImage: isLight 
            ? `radial-gradient(circle at 18% 50%, rgba(245, 158, 11, 0.28) 0%, transparent 45%),
               radial-gradient(circle at 52% 45%, rgba(244, 63, 94, 0.22) 0%, transparent 48%),
               radial-gradient(circle at 84% 35%, rgba(14, 165, 233, 0.26) 0%, transparent 50%)`
            : `radial-gradient(circle at 16% 55%, rgba(245, 158, 11, 0.42) 0%, transparent 45%),
               radial-gradient(circle at 52% 45%, rgba(244, 63, 94, 0.35) 0%, transparent 48%),
               radial-gradient(circle at 86% 32%, rgba(14, 165, 233, 0.45) 0%, rgba(6, 182, 212, 0.35) 30%, transparent 55%)`
        }}
      />

      {/* 3. Velo translúcido ahumado (Smoked Glass) que resalta los colores sin oscurecerlos */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 ${
          isLight 
            ? 'bg-slate-100/35' 
            : isMono 
            ? 'bg-[#060911]/28' 
            : 'bg-[#030714]/24'
        }`}
      />

      {/* 4. Viñeta perimetral suave de contraste cinematográfico */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          isLight ? 'opacity-10 bg-gradient-to-b from-transparent via-transparent to-slate-900/15' : 'opacity-25 bg-gradient-to-b from-transparent via-transparent to-black/60'
        }`} 
      />
    </div>
  );
};
