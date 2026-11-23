import React, { useState } from 'react';
import { Settings, Shield, Building2, Save, CheckCircle2, Palette, Moon, Sun, Check } from 'lucide-react';
import { ThemeMode } from '../../types';

interface SettingsViewProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentTheme, onThemeChange }) => {
  const [retentionDays, setRetentionDays] = useState('730');
  const [rlsEnabled, setRlsEnabled] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const isMono = currentTheme === 'monochrome';

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const themeOptions: {
    id: ThemeMode;
    title: string;
    description: string;
    previewBg: string;
    previewAccent: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'monochrome',
      title: 'Oscuro Grafito & Grises (Predeterminado)',
      description: 'Estética charcoal y grises profundos con alto contraste, paneles delimitados y máxima legibilidad sin negro plano.',
      previewBg: 'bg-[#151821] border-[#3B4254]',
      previewAccent: 'bg-white text-zinc-950 font-bold',
      icon: <Moon className="w-4 h-4 text-zinc-300" />
    },
    {
      id: 'cyber',
      title: 'Azul Cyber Enterprise',
      description: 'Paleta corporativa de alta tecnología con tonos azul marino, cian eléctrico y violeta.',
      previewBg: 'bg-[#06152B] border-blue-500/40',
      previewAccent: 'bg-[#087FE5] text-white font-bold',
      icon: <Palette className="w-4 h-4 text-cyan-400" />
    },
    {
      id: 'light',
      title: 'Claro Minimalista de Alto Contraste',
      description: 'Entorno blanco papel con bordes nítidos de alta definición, tarjetas elevadas y detalles de contraste optimizados.',
      previewBg: 'bg-white border-slate-300 shadow-sm',
      previewAccent: 'bg-slate-900 text-white font-bold',
      icon: <Sun className="w-4 h-4 text-amber-500" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black flex items-center gap-2 m-0">
          <Settings className="w-5 h-5 opacity-80" />
          Configuración Institucional & Gobierno de Datos
        </h1>
        <p className="text-xs opacity-60 mt-1 m-0">
          Personalización visual de la plataforma, parámetros multi-tenant y cumplimiento regulatorio Ley N.° 29733 (Perú).
        </p>
      </div>

      {savedNotice && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
          isMono ? 'bg-[#1E222C] border-[#3B4254] text-white' : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuración y preferencias de tema persistidas en el sistema.</span>
        </div>
      )}

      {/* THEME SELECTOR CARD */}
      <div className="glass-panel p-6 border rounded-2xl space-y-4">
        <div className={`flex items-center justify-between pb-3 border-b ${
          isMono ? 'border-[#2A2F3D]' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 opacity-90" />
            <div>
              <h2 className="text-sm font-bold m-0">Personalización & Tema Visual</h2>
              <p className="text-xs opacity-60 m-0">Selecciona el esquema de color y estilo visual de la interfaz</p>
            </div>
          </div>
          <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
            isMono ? 'border-[#3B4254] bg-[#202532] text-zinc-200' : 'border-slate-300 bg-slate-100 text-slate-800'
          }`}>
            Tema Actual: {currentTheme === 'monochrome' ? 'Oscuro en Grises' : currentTheme === 'cyber' ? 'Azul Cyber' : 'Claro Minimalista'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {themeOptions.map(opt => {
            const isSelected = currentTheme === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onThemeChange(opt.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? (isMono 
                        ? 'bg-[#1E222C] border-white ring-2 ring-white/30 shadow-md' 
                        : currentTheme === 'light'
                        ? 'bg-slate-50 border-slate-900 ring-2 ring-slate-900/20 shadow-md'
                        : 'bg-white/5 border-edumaster-cyan ring-2 ring-edumaster-cyan/30 shadow-glowCyan')
                    : (isMono
                        ? 'bg-[#151821] border-[#2A2F3D] hover:border-[#4D566D] hover:bg-[#1E222C]'
                        : currentTheme === 'light'
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        : 'bg-black/30 border-white/10 hover:border-white/30 hover:bg-white/5')
                }`}
              >
                <div>
                  {/* Swatch Mini Preview */}
                  <div className={`h-20 w-full rounded-lg border mb-3 p-2.5 flex flex-col justify-between ${opt.previewBg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                      </div>
                      <span className="text-[9px] font-mono opacity-60">Preview</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="w-16 h-2 rounded bg-current opacity-20" />
                        <div className="w-10 h-1.5 rounded bg-current opacity-10" />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${opt.previewAccent}`}>
                        Habilitado
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      {opt.icon}
                      {opt.title}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-white text-zinc-950 flex items-center justify-center font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] opacity-70 leading-relaxed mb-3">
                    {opt.description}
                  </p>
                </div>

                <button
                  type="button"
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? (isMono ? 'bg-white text-black' : 'bg-edumaster-blue text-white')
                      : 'bg-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  {isSelected ? 'Tema Seleccionado' : 'Aplicar Tema'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tenant Configuration */}
        <div className="glass-panel p-5 border rounded-2xl space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 m-0">
            <Building2 className="w-4 h-4 opacity-80" />
            Parámetros del Tenant Institucional
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="opacity-70 block mb-1">Nombre de la Organización</label>
              <input
                type="text"
                defaultValue="Universidad Tecnológica Enterprise"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="opacity-70 block mb-1">Código Único Institucional (Tenant ID)</label>
              <input
                type="text"
                disabled
                defaultValue="org-ute-peru-2026"
                className="w-full bg-black/20 border border-white/10 rounded-xl p-2.5 opacity-60 font-mono"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rlsEnabled}
                  onChange={e => setRlsEnabled(e.target.checked)}
                  className="rounded border-zinc-700 text-white focus:ring-0"
                />
                <span>Forzar Row Level Security (RLS) en PostgreSQL a nivel de conexión</span>
              </label>
            </div>
          </div>
        </div>

        {/* Legal & Privacy Compliance Ley 29733 */}
        <div className="glass-panel p-5 border rounded-2xl space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 m-0">
            <Shield className="w-4 h-4 opacity-80" />
            Privacidad & Ley N.° 29733 (Perú)
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="opacity-70 block mb-1">Periodo de Retención de Eventos Académicos (Días)</label>
              <input
                type="number"
                value={retentionDays}
                onChange={e => setRetentionDays(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-mono focus:outline-none"
              />
              <span className="text-[10px] opacity-50">Tras este plazo, los eventos se archivan o anonimizan de forma irreversible.</span>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span>Protección reforzada para menores de edad:</span>
                <span className="font-bold opacity-90">Habilitado</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Consentimiento informado en primer inicio:</span>
                <span className="font-bold opacity-90">Habilitado</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Portal de Derechos ARCO para estudiantes:</span>
                <span className="font-bold opacity-90">Habilitado</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                isMono ? 'bg-white text-black hover:bg-zinc-200' : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
