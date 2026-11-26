import React, { useState } from 'react';
import { Globe2 } from 'lucide-react';
import { regionsData } from '../../data/mockData';
import { RegionProgress, ThemeMode } from '../../types';
import { WORLD_MAP_SVG_PATH, WORLD_MAP_VIEWBOX } from './worldMapPath';

interface GeoProgressMapProps {
  theme?: ThemeMode;
  regions?: RegionProgress[];
}

export const GeoProgressMap: React.FC<GeoProgressMapProps> = ({
  theme = 'monochrome',
  regions = regionsData
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  // Centroids calculados para la proyección 740x423 del mapa vectorial de contorno
  const regionPins: Record<string, { cx: number; cy: number }> = {
    'América del Norte': { cx: 180, cy: 130 },
    'América del Sur': { cx: 235, cy: 285 },
    'Europa': { cx: 385, cy: 115 },
    'África': { cx: 395, cy: 235 },
    'Asia': { cx: 535, cy: 145 },
    'Oceanía': { cx: 605, cy: 325 }
  };

  const totalStudents = regions.reduce((acc, r) => acc + r.students, 0);

  const getPinColor = (origColor: string) => {
    if (isMono) return '#FFFFFF';
    if (isLight) return '#0F172A';
    return origColor;
  };

  return (
    <div className={`glass-panel flex flex-col h-full border rounded-2xl p-5 shadow-panel transition-colors ${
      isLight 
        ? 'border-slate-200/80 text-slate-900' 
        : isMono 
        ? 'border-white/10 text-white' 
        : 'border-edumaster-cardBorder text-slate-100'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe2 className={`w-4 h-4 ${isLight ? 'text-slate-700' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
          <h2 className="text-sm font-bold tracking-tight m-0">
            Mapa de Progreso de Aprendizaje
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${
            isLight ? 'bg-slate-900' : isMono ? 'bg-white' : 'bg-edumaster-cyan'
          }`} />
          <span className="font-bold tabular-numbers">{totalStudents.toLocaleString()}</span>
          <span className="opacity-60">Alumnos Globales</span>
        </div>
      </div>

      {/* Contenedor del Mapa Vectorial Glassmorphism Ultra-Translúcido */}
      <div className={`relative h-[180px] w-full rounded-xl border overflow-hidden mb-3.5 flex items-center justify-center select-none backdrop-blur-md ${
        isLight 
          ? 'bg-slate-900/[0.03] border-slate-200/60' 
          : isMono 
          ? 'bg-black/30 border-white/10' 
          : 'bg-black/35 border-white/10'
      }`}>
        <svg viewBox={WORLD_MAP_VIEWBOX} className="w-full h-full p-1">
          {/* Rejilla sutil de latitud y longitud */}
          <g opacity={isLight ? "0.15" : isMono ? "0.12" : "0.18"} stroke="currentColor">
            {/* Paralelos */}
            <line x1="20" y1="95" x2="720" y2="95" strokeWidth="0.8" strokeDasharray="3 4" />
            <line x1="20" y1="210" x2="720" y2="210" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="20" y1="325" x2="720" y2="325" strokeWidth="0.8" strokeDasharray="3 4" />
            {/* Meridianos */}
            <line x1="180" y1="20" x2="180" y2="400" strokeWidth="0.8" strokeDasharray="3 4" />
            <line x1="370" y1="20" x2="370" y2="400" strokeWidth="0.8" strokeDasharray="3 4" />
            <line x1="560" y1="20" x2="560" y2="400" strokeWidth="0.8" strokeDasharray="3 4" />
          </g>

          {/* Continentes: Contorno Vectorial idéntico a la imagen de referencia */}
          <path
            d={WORLD_MAP_SVG_PATH}
            fill={isLight ? "rgba(15, 23, 42, 0.04)" : isMono ? "rgba(255, 255, 255, 0.03)" : "rgba(32, 200, 245, 0.04)"}
            stroke={isLight ? "#0F172A" : isMono ? "#FFFFFF" : "#38BDF8"}
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isMono ? "drop-shadow-[0_0_6px_rgba(255,255,255,0.45)]" : "drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"}
          />

          {/* Rutas de Interconexión Global entre Hubs Continentales */}
          <g fill="none" stroke={isLight ? "#475569" : isMono ? "#CBD5E1" : "#20C8F5"} strokeWidth="1.1" opacity={isLight ? "0.35" : "0.45"}>
            <path d="M 180 130 Q 280 85, 385 115" strokeDasharray="3 3" />
            <path d="M 385 115 Q 460 95, 535 145" strokeDasharray="3 3" />
            <path d="M 180 130 Q 195 210, 235 285" strokeDasharray="3 3" />
            <path d="M 235 285 Q 315 295, 395 235" strokeDasharray="3 3" />
            <path d="M 385 115 Q 400 175, 395 235" strokeDasharray="3 3" />
            <path d="M 535 145 Q 590 230, 605 325" strokeDasharray="3 3" />
          </g>

          {/* Hub Pins con Estilo Minimalista y Resplandor Glass */}
          {regions.map(r => {
            const pin = regionPins[r.region];
            if (!pin) return null;
            const isSelected = selectedRegion === r.region;
            const pColor = getPinColor(r.color);

            return (
              <g
                key={r.region}
                className="cursor-pointer group"
                onClick={() => setSelectedRegion(isSelected ? null : r.region)}
              >
                {/* Resplandor exterior al estar activo */}
                {isSelected && (
                  <circle
                    cx={pin.cx}
                    cy={pin.cy}
                    r="12"
                    fill="none"
                    stroke={pColor}
                    strokeWidth="1"
                    opacity="0.5"
                    className="animate-ping"
                  />
                )}

                {/* Anillo exterior */}
                <circle
                  cx={pin.cx}
                  cy={pin.cy}
                  r={isSelected ? "9" : "6.5"}
                  fill={isLight ? "#FFFFFF" : isMono ? "#0A0D14" : "#040816"}
                  stroke={pColor}
                  strokeWidth="2.2"
                  className="transition-all"
                />

                {/* Núcleo central brillante */}
                <circle
                  cx={pin.cx}
                  cy={pin.cy}
                  r={isSelected ? "4" : "3"}
                  fill={pColor}
                  className="transition-all"
                />
              </g>
            );
          })}
        </svg>

        {/* Tag de Región Seleccionada */}
        {selectedRegion && (
          <div className={`absolute top-2.5 right-2.5 px-3 py-1 rounded-lg text-xs shadow-md border backdrop-blur-md ${
            isLight
              ? 'bg-white/80 border-slate-300 text-slate-900 shadow-md'
              : isMono
              ? 'bg-[#1E222C]/80 border-white/20 text-white'
              : 'bg-zinc-950/80 border-white/20 text-white'
          }`}>
            <span className="font-bold">{selectedRegion}</span>
          </div>
        )}
      </div>

      {/* Grid de Métricas Regionales en Píldoras Glass Translúcidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {regions.map(item => {
          const isSelected = selectedRegion === item.region;
          return (
            <div
              key={item.region}
              onClick={() => setSelectedRegion(isSelected ? null : item.region)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer backdrop-blur-sm ${
                isSelected
                  ? (isLight
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : isMono
                      ? 'bg-white/20 border-white text-white font-black shadow-md'
                      : 'bg-edumaster-blue/40 border-edumaster-cyan text-white shadow-glowCyan')
                  : (isLight
                      ? 'bg-white/40 border-slate-200/60 text-slate-800 hover:bg-white/70 hover:border-slate-300'
                      : isMono
                      ? 'bg-white/[0.04] border-white/10 text-gray-200 hover:bg-white/[0.08] hover:border-white/20'
                      : 'bg-black/25 border-white/10 text-slate-200 hover:border-white/20 hover:bg-black/35')
              }`}
            >
              <div className="flex items-center justify-between text-[11px] opacity-75 font-medium">
                <span className="truncate">{item.region}</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-black text-sm font-mono tabular-numbers">
                  {item.students.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold opacity-80 font-mono">
                  {item.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
