import React, { useEffect, useRef, useState } from 'react';
import {
  Settings, Shield, Building2, Save, CheckCircle2, Palette, Moon, Sun, Check,
  AlertCircle, Loader2, BellRing, Download, Upload, Database,
} from 'lucide-react';
import { can } from '../../auth/permissions';
import { isDemoMode } from '../../services/apiClient';
import { writeAudit } from '../../services/auditSink';
import { exportDemoData, importDemoData } from '../../services/demoStore';
import {
  getSettings,
  getSettingsPreferences,
  updateSettings,
  updateSettingsPreferences,
} from '../../services/settingsApi';
import {
  ApiMeta, AppSettings, SettingsPreferences, SettingsUpdate, ThemeMode, UserRole,
} from '../../types';

interface SettingsViewProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  role: UserRole;
  actor: string;
}

interface SettingsForm {
  organization: string;
  rlsEnabled: boolean;
  retentionDays: string;
  minorsProtection: boolean;
  consentOnFirstLogin: boolean;
  arcoPortal: boolean;
}

function formFromSettings(settings: AppSettings): SettingsForm {
  return {
    organization: settings.organization,
    rlsEnabled: settings.rlsEnabled,
    retentionDays: String(settings.retentionDays),
    minorsProtection: settings.minorsProtection,
    consentOnFirstLogin: settings.consentOnFirstLogin,
    arcoPortal: settings.arcoPortal,
  };
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme, onThemeChange, role, actor,
}) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [prefs, setPrefs] = useState<SettingsPreferences | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [prefsNotice, setPrefsNotice] = useState(false);
  const [dataNotice, setDataNotice] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const isMono = currentTheme === 'monochrome';
  const canEdit = can(role, 'settings:edit');
  const demoMode = isDemoMode();

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getSettings(controller.signal),
      getSettingsPreferences(controller.signal),
    ])
      .then(([settingsResponse, prefsResponse]) => {
        setSettings(settingsResponse.data);
        setForm(formFromSettings(settingsResponse.data));
        setPrefs(prefsResponse.data);
        setMeta(settingsResponse.meta);
        setError(null);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar la configuración');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const flash = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 3000);
  };

  const handleSave = async () => {
    if (!form || saving) return;
    const retentionDays = Number(form.retentionDays);
    if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) {
      setError('La retención debe estar entre 1 y 3650 días.');
      return;
    }

    const payload: SettingsUpdate = {
      theme: currentTheme,
      organization: form.organization.trim(),
      rlsEnabled: form.rlsEnabled,
      retentionDays,
      minorsProtection: form.minorsProtection,
      consentOnFirstLogin: form.consentOnFirstLogin,
      arcoPortal: form.arcoPortal,
    };

    setSaving(true);
    setError(null);
    try {
      const response = await updateSettings(payload);
      setSettings(response.data);
      setForm(formFromSettings(response.data));
      setMeta(response.meta);
      onThemeChange(response.data.theme);
      // El backend Fase 4 ya audita PUT /settings; en API no duplicamos.
      await writeAudit({
        action: 'settings.view_updated',
        detail: { theme: response.data.theme, retentionDays },
        onlyDemo: true,
      });
      flash(setSavedNotice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handlePrefsSave = async () => {
    if (!prefs || saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await updateSettingsPreferences(prefs);
      setPrefs(response.data);
      await writeAudit({
        action: 'settings.preferences_updated',
        detail: { digest: response.data.digest },
        onlyDemo: true,
      });
      flash(setPrefsNotice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setDataError(null);
    try {
      const json = exportDemoData();
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `edumaster-demo-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setDataNotice(`Respaldo DEMO descargado (${json.length} caracteres). Incluye tema, actor y notas.`);
      await writeAudit({
        action: 'demo.export_data',
        detail: { bytes: blob.size },
        onlyDemo: true,
      });
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'No se pudo exportar el respaldo DEMO');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDataError(null);
    setDataNotice(null);
    try {
      const result = importDemoData(await file.text());
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      setDataNotice(`Datos DEMO importados: ${result.keys} claves. Recarga para aplicarlos en todos los módulos.`);
      await writeAudit({
        action: 'demo.import_data',
        detail: { keys: result.keys, file: file.name },
        onlyDemo: true,
      });
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'No se pudo importar el respaldo DEMO');
    } finally {
      event.target.value = '';
    }
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
      icon: <Moon className="w-4 h-4 text-zinc-300" />,
    },
    {
      id: 'cyber',
      title: 'Azul Cyber Enterprise',
      description: 'Paleta corporativa de alta tecnología con tonos azul marino, cian eléctrico y violeta.',
      previewBg: 'bg-[#06152B] border-blue-500/40',
      previewAccent: 'bg-[#087FE5] text-white font-bold',
      icon: <Palette className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'light',
      title: 'Claro Minimalista de Alto Contraste',
      description: 'Entorno blanco papel con bordes nítidos de alta definición, tarjetas elevadas y detalles de contraste optimizados.',
      previewBg: 'bg-white border-slate-300 shadow-sm',
      previewAccent: 'bg-slate-900 text-white font-bold',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
    },
  ];

  if (loading) {
    return (
      <div className="glass-panel p-6 border rounded-2xl flex items-center gap-2 text-xs">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando configuración institucional…
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-xs flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold m-0">No se pudo cargar la configuración</p>
          <p className="opacity-80 mt-1 m-0">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <Settings className="w-5 h-5 opacity-80" />
            Configuración Institucional & Gobierno de Datos
          </h1>
          <p className="text-xs opacity-60 mt-1 m-0">
            Personalización visual, parámetros multi-tenant y cumplimiento Ley N.° 29733 (Perú).
          </p>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
          demoMode
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
        }`}>
          {demoMode ? 'DEMO · sin API /api/v1 · datos locales' : 'API · /api/v1'}
          {meta ? ` · ${meta.correlationId.slice(0, 12)}` : ''}
        </span>
      </div>

      {!canEdit && (
        <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-[11px]">
          Tu rol ({role}) tiene acceso de solo lectura a esta sección.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl border border-red-500/40 bg-red-500/10 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {savedNotice && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
          isMono ? 'bg-[#1E222C] border-[#3B4254] text-white' : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuración persistida en {demoMode ? 'el store DEMO local' : 'la API /api/v1'}.</span>
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
              <p className="text-xs opacity-60 m-0">Selecciona el esquema de color de la interfaz</p>
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

                  <p className="text-[11px] opacity-70 leading-relaxed mb-3">{opt.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onThemeChange(opt.id)}
                  disabled={!canEdit}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
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

          {form && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="opacity-70 block mb-1">Nombre de la Organización</label>
                <input
                  type="text"
                  value={form.organization}
                  disabled={!canEdit}
                  onChange={e => setForm({ ...form, organization: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 focus:outline-none focus:border-white/30 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="opacity-70 block mb-1">Código Único Institucional (Tenant ID)</label>
                <input
                  type="text"
                  disabled
                  value={settings?.tenantId ?? ''}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-2.5 opacity-60 font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.rlsEnabled}
                    disabled={!canEdit}
                    onChange={e => setForm({ ...form, rlsEnabled: e.target.checked })}
                    className="mt-0.5 rounded border-zinc-700"
                  />
                  <span>
                    Marcar RLS como habilitado (informativo)
                    <span className="block opacity-50 text-[10px] mt-0.5">
                      DEMO: no activa Row Level Security real sin OIDC y policies en Supabase.
                    </span>
                  </span>
                </label>
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="opacity-60 text-[10px] m-0">
                  Última actualización: {settings?.updatedAt} · por {settings?.updatedBy}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legal & Privacy Compliance Ley 29733 */}
        <div className="glass-panel p-5 border rounded-2xl space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 m-0">
            <Shield className="w-4 h-4 opacity-80" />
            Privacidad & Ley N.° 29733 (Perú)
          </h3>

          {form && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="opacity-70 block mb-1">Retención de eventos académicos (días)</label>
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={form.retentionDays}
                  disabled={!canEdit}
                  onChange={e => setForm({ ...form, retentionDays: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-mono focus:outline-none disabled:opacity-60"
                />
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2">
                {([
                  ['minorsProtection', 'Protección reforzada para menores de edad'],
                  ['consentOnFirstLogin', 'Consentimiento informado en primer inicio'],
                  ['arcoPortal', 'Portal de Derechos ARCO para estudiantes'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between gap-2 cursor-pointer">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={form[key]}
                      disabled={!canEdit}
                      onChange={e => setForm({ ...form, [key]: e.target.checked })}
                      className="rounded border-zinc-700"
                    />
                  </label>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={!canEdit || saving}
                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 ${
                  isMono ? 'bg-white text-black hover:bg-zinc-200' : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white'
                }`}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Guardar Configuración
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preferencias de notificaciones del actor */}
      <div className="glass-panel p-5 border rounded-2xl space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 m-0">
          <BellRing className="w-4 h-4 opacity-80" />
          Preferencias de Notificaciones de {actor}
        </h3>

        {prefs && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-2">
                <span>Correo electrónico</span>
                <input
                  type="checkbox"
                  checked={prefs.email}
                  disabled={!canEdit}
                  onChange={e => setPrefs({ ...prefs, email: e.target.checked })}
                  className="rounded border-zinc-700"
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                <span>Notificaciones en la aplicación</span>
                <input
                  type="checkbox"
                  checked={prefs.inApp}
                  disabled={!canEdit}
                  onChange={e => setPrefs({ ...prefs, inApp: e.target.checked })}
                  className="rounded border-zinc-700"
                />
              </label>
              <div>
                <label className="opacity-70 block mb-1">Frecuencia del resumen</label>
                <select
                  value={prefs.digest}
                  disabled={!canEdit}
                  onChange={e => setPrefs({ ...prefs, digest: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 focus:outline-none disabled:opacity-60"
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="opacity-70 block mb-1">Categorías (separadas por coma)</label>
                <input
                  type="text"
                  value={prefs.categories.join(', ')}
                  disabled={!canEdit}
                  onChange={e => setPrefs({
                    ...prefs,
                    categories: e.target.value.split(',').map(v => v.trim()).filter(Boolean),
                  })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 focus:outline-none disabled:opacity-60"
                />
              </div>
              <button
                onClick={handlePrefsSave}
                disabled={!canEdit || saving}
                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 ${
                  isMono ? 'bg-white text-black hover:bg-zinc-200' : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white'
                }`}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Guardar Preferencias
              </button>
              {prefsNotice && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 m-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Preferencias guardadas.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Respaldo local: permite no perder el progreso al limpiar el navegador */}
      <div className="glass-panel p-5 border rounded-2xl space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2 m-0">
          <Database className="w-4 h-4 opacity-80" />
          Respaldo de datos DEMO
        </h3>
        <p className="text-[11px] opacity-70 m-0">
          Exporta el estado local (auditoría, chat, notificaciones, ruta, tema y actor) e impórtalo en otro navegador.
          No contiene datos institucionales ni secretos. Los CSV y los certificados siguen siendo sintéticos.
        </p>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Archivo de respaldo DEMO"
          onChange={event => void handleImportData(event)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void handleExportData()}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5" /> Exportar datos DEMO
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          >
            <Upload className="w-3.5 h-3.5" /> Importar datos DEMO
          </button>
          {dataNotice && (
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            >
              Recargar ahora
            </button>
          )}
        </div>
        {dataNotice && (
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 m-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> {dataNotice}
          </p>
        )}
        {dataError && (
          <p className="text-[11px] text-rose-400 flex items-center gap-1 m-0">
            <AlertCircle className="w-3.5 h-3.5" /> {dataError}
          </p>
        )}
      </div>
    </div>
  );
};
