import React, { useState } from 'react';
import { Globe2 } from 'lucide-react';
import { regionsData } from '../../data/mockData';
import { ThemeMode } from '../../types';

interface GeoProgressMapProps {
  theme?: ThemeMode;
}

export const GeoProgressMap: React.FC<GeoProgressMapProps> = ({ theme = 'monochrome' }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  // Accurate hub pin coordinates for 500x220 projection
  const regionPins: Record<string, { cx: number; cy: number }> = {
    'América del Norte': { cx: 98, cy: 75 },
    'América del Sur': { cx: 132, cy: 156 },
    'Europa': { cx: 244, cy: 68 },
    'África': { cx: 248, cy: 132 },
    'Asia': { cx: 356, cy: 80 },
    'Oceanía': { cx: 415, cy: 168 }
  };

  const totalStudents = regionsData.reduce((acc, r) => acc + r.students, 0);

  const getPinColor = (origColor: string) => {
    if (isMono) return '#FFFFFF';
    if (isLight) return '#0F172A';
    return origColor;
  };

  return (
    <div className={`flex flex-col h-full border rounded-2xl p-5 shadow-panel transition-colors ${
      isLight 
        ? 'bg-white border-slate-200' 
        : isMono 
        ? 'bg-[#151821] border-[#2A2F3D]' 
        : 'glass-panel border-edumaster-cardBorder'
    }`}>
      {/* Header - No animated pulses */}
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

      {/* High-Definition Static Vector World Map */}
      <div className={`relative h-[150px] w-full rounded-xl border overflow-hidden mb-3.5 flex items-center justify-center select-none ${
        isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#0E1117] border-[#2A2F3D]' : 'bg-[#06152B]/95 border-white/10'
      }`}>
        <svg viewBox="0 0 500 220" className="w-full h-full">
          {/* Subtle Latitude & Longitude Graticules */}
          <g opacity={isLight ? "0.2" : isMono ? "0.15" : "0.2"} stroke="currentColor">
            {/* Equator & Parallels */}
            <line x1="10" y1="50" x2="490" y2="50" strokeWidth="0.8" strokeDasharray="3 4" />
            <line x1="10" y1="110" x2="490" y2="110" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="10" y1="170" x2="490" y2="170" strokeWidth="0.8" strokeDasharray="3 4" />
            {/* Meridians */}
            <line x1="130" y1="15" x2="130" y2="205" strokeWidth="0.8" strokeDasharray="3 4" />
            <line x1="250" y1="15" x2="250" y2="205" strokeWidth="0.8" strokeDasharray="3 4" />
            <line x1="370" y1="15" x2="370" y2="205" strokeWidth="0.8" strokeDasharray="3 4" />
          </g>

          {/* Continents: High-Fidelity Realistic Geographic Contours */}
          <g
            fill={isLight ? "#E2E8F0" : isMono ? "#1C202B" : "#0A1F3D"}
            stroke={isLight ? "#94A3B8" : isMono ? "#3B4254" : "#087FE5"}
            strokeWidth="1.2"
          >
            {/* North America & Central America */}
            <path d="M 38 48 C 50 35, 78 30, 105 32 C 122 34, 142 42, 146 52 C 150 62, 138 72, 130 78 C 124 84, 120 95, 114 104 C 108 112, 102 122, 94 130 C 90 134, 82 135, 80 128 C 76 118, 80 110, 75 102 C 68 94, 52 90, 44 78 C 36 68, 32 58, 38 48 Z" />
            {/* Greenland */}
            <path d="M 152 22 C 165 20, 180 22, 178 34 C 176 44, 162 48, 154 44 C 148 40, 146 26, 152 22 Z" />
            {/* South America */}
            <path d="M 98 135 C 112 132, 136 138, 148 150 C 158 162, 152 178, 142 195 C 132 208, 122 216, 114 214 C 108 212, 106 195, 104 182 C 102 170, 94 158, 92 148 C 90 140, 94 136, 98 135 Z" />
            {/* Europe */}
            <path d="M 225 58 C 235 48, 252 46, 266 52 C 274 58, 272 70, 260 76 C 248 80, 235 82, 224 76 C 218 72, 218 64, 225 58 Z" />
            {/* Scandinavia */}
            <path d="M 242 32 C 252 28, 262 30, 258 44 C 255 52, 248 54, 242 48 C 238 42, 238 34, 242 32 Z" />
            {/* United Kingdom & Ireland */}
            <path d="M 212 52 C 218 48, 224 50, 222 58 C 220 64, 214 66, 210 62 C 208 58, 208 54, 212 52 Z" />
            {/* Africa */}
            <path d="M 216 88 C 235 84, 264 82, 276 96 C 286 108, 288 124, 284 140 C 278 162, 268 184, 254 198 C 246 204, 238 198, 234 185 C 226 165, 214 142, 208 122 C 204 108, 208 92, 216 88 Z" />
            {/* Madagascar */}
            <path d="M 292 158 C 298 155, 302 160, 298 174 C 294 182, 290 180, 288 174 C 286 166, 288 160, 292 158 Z" />
            {/* Asia */}
            <path d="M 276 52 C 310 40, 360 36, 412 42 C 438 46, 452 58, 442 74 C 432 86, 412 92, 396 98 C 382 104, 368 118, 355 124 C 342 128, 332 122, 326 112 C 320 102, 305 98, 292 90 C 282 82, 274 68, 276 52 Z" />
            {/* Indian Subcontinent */}
            <path d="M 324 104 C 334 106, 342 115, 338 128 C 334 138, 325 142, 320 134 C 315 125, 318 110, 324 104 Z" />
            {/* Japan */}
            <path d="M 442 74 C 448 70, 452 75, 448 86 C 444 94, 438 92, 436 86 C 435 80, 438 75, 442 74 Z" />
            {/* Australia & Oceania */}
            <path d="M 382 155 C 405 146, 435 148, 444 162 C 452 176, 442 194, 428 198 C 410 202, 392 198, 380 186 C 372 176, 372 160, 382 155 Z" />
            {/* New Zealand */}
            <path d="M 456 190 C 462 186, 466 190, 462 202 C 458 208, 452 206, 450 198 C 448 194, 452 190, 456 190 Z" />
          </g>

          {/* Clean Static Inter-Hub Connections (No dashed moving lines) */}
          <g fill="none" stroke={isLight ? "#475569" : isMono ? "#94A3B8" : "#20C8F5"} strokeWidth="1" opacity={isLight ? "0.4" : "0.5"}>
            <path d="M 98 75 Q 170 48, 244 68" />
            <path d="M 244 68 Q 300 58, 356 80" />
            <path d="M 98 75 Q 112 115, 132 156" />
            <path d="M 132 156 Q 190 148, 248 132" />
            <path d="M 356 80 Q 388 124, 415 168" />
          </g>

          {/* Static Hub Pins (No animate-ping, crisp enterprise styling) */}
          {regionsData.map(r => {
            const pin = regionPins[r.region];
            if (!pin) return null;
            const isSelected = selectedRegion === r.region;
            const pColor = getPinColor(r.color);

            return (
              <g
                key={r.region}
                className="cursor-pointer"
                onClick={() => setSelectedRegion(isSelected ? null : r.region)}
              >
                {/* Static Outer Ring */}
                <circle
                  cx={pin.cx}
                  cy={pin.cy}
                  r={isSelected ? "7" : "5"}
                  fill={isLight ? "#FFFFFF" : isMono ? "#000000" : "#06152B"}
                  stroke={pColor}
                  strokeWidth="2"
                />

                {/* Inner Core Dot */}
                <circle
                  cx={pin.cx}
                  cy={pin.cy}
                  r="2.5"
                  fill={pColor}
                />
              </g>
            );
          })}
        </svg>

        {/* Selected Region Tag */}
        {selectedRegion && (
          <div className={`absolute top-2.5 right-2.5 px-3 py-1 rounded-lg text-xs shadow-md border ${
            isLight
              ? 'bg-white border-slate-300 text-slate-900 shadow-md'
              : isMono
              ? 'bg-[#1E222C] border-[#3B4254] text-white'
              : 'bg-zinc-950/95 border-white/20 text-white'
          }`}>
            <span className="font-bold">{selectedRegion}</span>
          </div>
        )}
      </div>

      {/* Regional Metrics Grid with High Contrast */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {regionsData.map(item => {
          const isSelected = selectedRegion === item.region;
          return (
            <div
              key={item.region}
              onClick={() => setSelectedRegion(isSelected ? null : item.region)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? (isLight
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : isMono
                      ? 'bg-white border-white text-zinc-950 font-black shadow-sm'
                      : 'bg-edumaster-blue/30 border-edumaster-cyan text-white')
                  : (isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                      : isMono
                      ? 'bg-[#1C202B] border-[#2A2F3D] text-gray-200 hover:bg-[#252B3A]'
                      : 'bg-[#0A1F3D]/60 border-white/10 hover:border-white/20')
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
