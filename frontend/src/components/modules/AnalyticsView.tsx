import React, { useState } from 'react';
import { BarChart3, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ThemeMode } from '../../types';

interface AnalyticsViewProps {
  theme?: ThemeMode;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ theme = 'monochrome' }) => {
  const [selectedCohort, setSelectedCohort] = useState('2026-II');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const handleExport = (type: string) => {
    setExportNotice(`Generando archivo ${type} auditado con firma de tiempo UTC y filtros aplicados...`);
    setTimeout(() => {
      setExportNotice(`Reporte ${type} exportado exitosamente bajo normativa de gobernanza.`);
      setTimeout(() => setExportNotice(null), 4000);
    }, 1200);
  };

  const cohorts = [
    { name: 'Cohorte 2026-II', students: 12450, retention: '89.4%', dropoutRisk: '4.2%', avgScore: '16.8/20' },
    { name: 'Cohorte 2026-I', students: 12143, retention: '86.1%', dropoutRisk: '6.8%', avgScore: '16.2/20' },
    { name: 'Cohorte 2025-II', students: 10890, retention: '83.5%', dropoutRisk: '8.1%', avgScore: '15.9/20' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <BarChart3 className={`w-5 h-5 ${isLight ? 'text-purple-600' : isMono ? 'text-zinc-200' : 'text-edumaster-violet'}`} />
            Analítica Educativa & Desempeño Institucional
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Métricas agregadas no invasivas, curvas de retención y análisis de riesgo de abandono.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('CSV')}
            className={`px-3 py-1.5 border text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
              isLight 
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50' 
                : isMono 
                ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-200 hover:text-white' 
                : 'bg-[#0A1F3D] hover:bg-[#0D2B52] border-edumaster-cardBorder text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors ${
              isLight 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : isMono 
                ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' 
                : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white shadow-glowBlue'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Reporte Oficial PDF
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Cohort Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cohorts.map(c => {
          const isSelected = selectedCohort === c.name;
          return (
            <div
              key={c.name}
              onClick={() => setSelectedCohort(c.name)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? (isLight 
                      ? 'bg-blue-50/70 border-blue-400 text-slate-900 shadow-sm' 
                      : isMono 
                      ? 'bg-[#1C2436] border-[#384A6E] text-white shadow-md' 
                      : 'bg-[#0A1F3D] border-edumaster-cyan shadow-glowBlue text-white')
                  : (isLight 
                      ? 'bg-white border-slate-200 text-slate-800 hover:border-slate-300' 
                      : isMono 
                      ? 'bg-[#151821] border-[#2A2F3D] text-zinc-200 hover:border-[#3B4254]' 
                      : 'glass-panel border-edumaster-cardBorder opacity-80 hover:opacity-100 text-slate-100')
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm">{c.name}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  isLight ? 'bg-blue-100 border-blue-200 text-blue-800' : isMono ? 'bg-[#242A38] border-[#3B4254] text-white' : 'bg-edumaster-blue/20 border-edumaster-cyan/30 text-edumaster-cyan'
                }`}>
                  Vigente
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Alumnos</span>
                  <span className="font-bold font-mono text-sm">{c.students.toLocaleString()}</span>
                </div>
                <div>
                  <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Tasa Retención</span>
                  <span className={`font-mono text-sm font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{c.retention}</span>
                </div>
                <div>
                  <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Riesgo Abandono</span>
                  <span className={`font-mono text-sm font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{c.dropoutRisk}</span>
                </div>
                <div>
                  <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Nota Promedio</span>
                  <span className={`font-mono text-sm font-bold ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>{c.avgScore}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retention Curve & Dropdown Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold m-0">Curva de Retención Semanal</h3>
            <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{selectedCohort}</span>
          </div>

          <div className={`h-44 flex items-end gap-2 pt-4 border-b px-2 ${isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder'}`}>
            {[98, 95, 93, 91, 90, 89, 88, 89, 87, 88, 89, 90].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className={`text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {val}%
                </span>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isLight ? 'bg-slate-800 group-hover:bg-blue-600' : isMono ? 'bg-white group-hover:bg-zinc-300' : 'bg-gradient-to-t from-edumaster-blue to-edumaster-cyan'
                  }`}
                  style={{ height: `${(val - 70) * 3.2}px` }}
                />
                <span className={`text-[9px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>S{idx + 1}</span>
              </div>
            ))}
          </div>
          <span className={`text-[10px] block mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Semanas lectivas del semestre (S1 a S12)</span>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel border-edumaster-cardBorder text-slate-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold m-0">Segmentación de Riesgo de Deserción (IA Cabeza C)</h3>
            <span className={`text-[11px] font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Brier Score: 0.082</span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Riesgo Bajo (Prob &lt; 15%)</span>
                <span className="font-mono font-medium">84.2% (10,480 alumnos)</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '84.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className={`font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>Riesgo Moderado (15% - 40%)</span>
                <span className="font-mono font-medium">11.6% (1,444 alumnos)</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '11.6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className={`font-bold ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>Riesgo Crítico (Prob &gt; 40%)</span>
                <span className="font-mono font-medium">4.2% (526 alumnos)</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '4.2%' }} />
              </div>
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : isMono ? 'bg-[#1C1812] border-[#3D3320] text-amber-200' : 'bg-[#06152B] border-amber-500/30 text-amber-300'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>
              <strong>Guardrail de Seguridad:</strong> Las señales de riesgo se derivan a tutores y consejeros académicos humanos. Queda prohibida la aplicación de medidas punitivas automáticas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
