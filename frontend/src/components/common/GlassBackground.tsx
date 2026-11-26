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
      {/* 1. Capa de imagen de fondo vívida con ondas fluidas luminosas */}
      <div 
        className="absolute -inset-8 bg-cover bg-center bg-no-repeat filter blur-[22px] saturate-[220%] brightness-[1.18] scale-105 opacity-95 transition-all duration-700 will-change-transform"
        style={{ backgroundImage: "url('/bg-glass.jpg')" }}
      />

      {/* 2. Resplandores cromáticos directos inspirados en la referencia (Warm Coral, Teal/Emerald, Violet) */}
      <div 
        className="absolute inset-0 transition-opacity duration-700 opacity-80 mix-blend-screen"
        style={{
          backgroundImage: isLight 
            ? `radial-gradient(circle at 18% 28%, rgba(251, 146, 60, 0.32) 0%, transparent 45%),
               radial-gradient(circle at 82% 16%, rgba(52, 211, 153, 0.30) 0%, rgba(56, 189, 248, 0.25) 35%, transparent 60%),
               radial-gradient(circle at 50% 85%, rgba(168, 85, 247, 0.25) 0%, transparent 50%)`
            : `radial-gradient(circle at 16% 26%, rgba(255, 115, 30, 0.50) 0%, transparent 45%),
               radial-gradient(circle at 84% 18%, rgba(16, 230, 150, 0.45) 0%, rgba(6, 182, 212, 0.40) 32%, transparent 55%),
               radial-gradient(circle at 20% 82%, rgba(168, 85, 247, 0.42) 0%, transparent 50%),
               radial-gradient(circle at 85% 82%, rgba(14, 165, 233, 0.38) 0%, transparent 48%)`
        }}
      />

      {/* 3. Velo translúcido ahumado (Smoked Glass) que resalta los colores sin oscurecerlos */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 ${
          isLight 
            ? 'bg-slate-100/35' 
            : isMono 
            ? 'bg-[#060911]/30' 
            : 'bg-[#030714]/25'
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
