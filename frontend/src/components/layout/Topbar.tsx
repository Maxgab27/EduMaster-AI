import React, { useEffect, useMemo, useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Database, 
  Check, 
  SlidersHorizontal,
  Calendar,
  GraduationCap,
  Sun,
  Moon,
  Palette,
  Bot,
  Menu
} from 'lucide-react';
import { ApiMeta, AppNotification, NotificationPreferences, ThemeMode, UserProfile, UserRole } from '../../types';
import { LiveConnectionBadge } from '../common/LiveConnectionBadge';
import { isDemoMode } from '../../services/apiClient';
import {
  getNotificationPreferences,
  listNotifications,
  markNotificationRead,
  updateNotificationPreferences,
} from '../../services/notificationsApi';
import { writeAudit } from '../../services/auditSink';

interface TopbarProps {
  user: UserProfile;
  onRoleChange: (role: UserRole) => void;
  globalScore: number;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenCommandPalette: () => void;
  onOpenAITutor: () => void;
  onOpenMobileNav: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  user,
  onRoleChange,
  globalScore,
  theme,
  onThemeChange,
  onOpenCommandPalette,
  onOpenAITutor,
  onOpenMobileNav,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Notificaciones conectadas al contrato /api/v1 (o al store DEMO local).
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationMeta, setNotificationMeta] = useState<ApiMeta | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter(item => !item.read).length,
    [notifications],
  );

  useEffect(() => {
    const controller = new AbortController();
    listNotifications(controller.signal)
      .then(response => {
        setNotifications(response.data);
        setNotificationMeta(response.meta);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setNotificationsError(err instanceof Error ? err.message : 'No se pudieron cargar las notificaciones');
      });
    getNotificationPreferences(controller.signal)
      .then(response => setPreferences(response.data))
      .catch(() => {
        // Las preferencias son opcionales en el popover.
      });
    return () => controller.abort();
  }, []);

  const handleMarkRead = async (notification: AppNotification) => {
    try {
      const response = await markNotificationRead(notification.id, true);
      setNotifications(prev =>
        prev.map(item => (item.id === notification.id ? response.data : item)),
      );
      setNotificationMeta(response.meta);
      await writeAudit({
        action: 'notification.read_changed',
        correlationId: response.meta.correlationId,
        onlyDemo: true,
        detail: { id: notification.id, read: true },
      });
    } catch (err) {
      setNotificationsError(err instanceof Error ? err.message : 'No se pudo marcar como leída');
    }
  };

  const handleToggleInApp = async () => {
    if (!preferences) return;
    const updated = { ...preferences, inApp: !preferences.inApp };
    try {
      const response = await updateNotificationPreferences(updated);
      setPreferences(response.data);
      await writeAudit({
        action: 'notification.preferences_updated',
        correlationId: response.meta.correlationId,
        onlyDemo: true,
        detail: { ...response.data },
      });
    } catch (err) {
      setNotificationsError(err instanceof Error ? err.message : 'No se pudieron guardar las preferencias');
    }
  };

  // Filters state
  const [period, setPeriod] = useState('2026-II (Semestre Actual)');
  const [cohort, setCohort] = useState('Todas las Cohortes');

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const rolesList: { id: UserRole; label: string; desc: string }[] = [
    { id: 'admin', label: 'Administrador', desc: 'Gobierno global y métricas' },
    { id: 'coordinador', label: 'Coordinador', desc: 'Mallas y cohortes' },
    { id: 'docente', label: 'Docente / Instructor', desc: 'Rúbricas y calificaciones' },
    { id: 'estudiante', label: 'Estudiante', desc: 'Rutas y autoevaluación' },
    { id: 'analista', label: 'Analista de Datos', desc: 'Datasets y calidad' },
    { id: 'mle', label: 'ML Engineer', desc: 'Experimentos y PyTorch' },
    { id: 'auditor', label: 'Auditor', desc: 'Logs inmutables de auditoría' },
  ];

  const cycleTheme = () => {
    if (theme === 'monochrome') onThemeChange('cyber');
    else if (theme === 'cyber') onThemeChange('light');
    else onThemeChange('monochrome');
  };

  return (
    <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors backdrop-blur-xl ${
      isMono ? 'bg-[#151820]/95 border-[#2A2F3D] text-gray-100' : isLight ? 'bg-white/95 border-slate-200 text-slate-900' : 'bg-[#06152B]/95 border-edumaster-cardBorder text-slate-100'
    }`}>
      {/* Slogan & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-5 min-w-0">
        <button
          onClick={onOpenMobileNav}
          aria-label="Abrir menú de navegación"
          className={`md:hidden w-9 h-9 shrink-0 rounded-xl border flex items-center justify-center ${
            isMono ? 'bg-[#1E222C] border-[#2A2F3D] text-white' : isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-white'
          }`}
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="hidden lg:flex items-center gap-2 text-xs font-black tracking-widest uppercase opacity-85">
          <span>Aprende</span>
          <span className="opacity-40">•</span>
          <span>Practica</span>
          <span className="opacity-40">•</span>
          <span>Destaca</span>
        </div>

        {/* Global Filter Trigger Dropdown (se oculta en celular) */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              isMono ? 'bg-[#1E222C] border-[#2A2F3D] text-gray-200 hover:text-white' : isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-slate-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 opacity-80" />
            <span>Filtros: {cohort.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showFilters && (
            <div className={`absolute left-0 mt-2 w-72 border rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl ${
              isMono ? 'bg-[#1A1D24] border-[#3B4254] text-white' : isLight ? 'bg-white border-slate-300 text-slate-900 shadow-xl' : 'bg-[#0A1F3D] border-edumaster-cyan/50 text-white'
            }`}>
              <span className="text-[10px] uppercase font-bold opacity-60 tracking-wider block mb-2">
                Filtros Globales de Visualización
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="opacity-75 block mb-1 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Periodo Académico
                  </label>
                  <select
                    value={period}
                    onChange={e => setPeriod(e.target.value)}
                    className={`w-full border rounded-lg p-2 focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : isMono ? 'bg-[#12141A] border-[#2A2F3D] text-white' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  >
                    <option className={isLight ? 'bg-white text-slate-900' : 'bg-zinc-900 text-white'}>2026-II (Semestre Actual)</option>
                    <option className={isLight ? 'bg-white text-slate-900' : 'bg-zinc-900 text-white'}>2026-I (Histórico)</option>
                    <option className={isLight ? 'bg-white text-slate-900' : 'bg-zinc-900 text-white'}>2025-II (Histórico)</option>
                  </select>
                </div>
                <div>
                  <label className="opacity-75 block mb-1 text-[11px] flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> Cohorte
                  </label>
                  <select
                    value={cohort}
                    onChange={e => setCohort(e.target.value)}
                    className={`w-full border rounded-lg p-2 focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : isMono ? 'bg-[#12141A] border-[#2A2F3D] text-white' : 'bg-black/40 border-white/10 text-white'
                    }`}
                  >
                    <option className={isLight ? 'bg-white text-slate-900' : 'bg-zinc-900 text-white'}>Todas las Cohortes</option>
                    <option className={isLight ? 'bg-white text-slate-900' : 'bg-zinc-900 text-white'}>Cohorte Deep Learning 2026</option>
                    <option className={isLight ? 'bg-white text-slate-900' : 'bg-zinc-900 text-white'}>Cohorte Data Science 2026</option>
                    <option className={isLight ? 'bg-white text-slate-900' : 'bg-zinc-900 text-white'}>Cohorte MLOps Enterprise</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className={`w-full py-1.5 rounded-lg font-bold text-xs transition-all mt-2 ${
                    isMono ? 'bg-white text-zinc-950 font-black' : isLight ? 'bg-slate-900 text-white' : 'bg-edumaster-blue text-white'
                  }`}
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Badge honesto: los datos siguen siendo DEMO, con o sin API configurada */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
            isLight 
              ? 'bg-amber-100 border-amber-300 text-amber-800'
              : isMono 
              ? 'bg-[#1E222C] border-[#3B4254] text-zinc-200' 
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          }`}
          title={isDemoMode()
            ? 'Sin VITE_API_BASE_URL: se usan adaptadores DEMO locales'
            : 'API /api/v1 conectada; los datos siguen siendo sintéticos y NO son evidencia pedagógica'}
        >
          <Database className="w-3 h-3" />
          <span>{isDemoMode() ? 'DATASET DEMO · SIN API' : 'API /api/v1 · DATOS DEMO'}</span>
        </div>

        {/* Realtime connection state badge (offline in this demo) */}
        <div className="hidden lg:block">
          <LiveConnectionBadge theme={theme} />
        </div>
      </div>

      {/* Right Controls: Command Palette, AI Tutor, Theme Switcher, Score, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
            isLight 
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
              : isMono 
              ? 'bg-[#1E222C] hover:bg-[#282D3B] border-[#2A2F3D] text-zinc-300' 
              : 'bg-[#0A1F3D] hover:bg-[#0D2B52] border-edumaster-cardBorder text-slate-300'
          }`}
          title="Abrir Paleta de Comandos (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 opacity-60" />
          <span className="hidden lg:inline text-[11px]">Buscar / Comandos...</span>
          <span className="text-[10px] font-mono opacity-50 px-1 py-0.2 rounded border border-inherit">
            ⌘K
          </span>
        </button>

        {/* Floating AI Tutor Quick Trigger */}
        <button
          onClick={onOpenAITutor}
          className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
            isLight 
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
              : isMono 
              ? 'bg-[#202532] border-[#3B4254] text-zinc-200 hover:text-white' 
              : 'bg-edumaster-blue/20 border-edumaster-cyan/40 text-edumaster-cyan hover:bg-edumaster-blue/30'
          }`}
          title="Abrir Asistente Tutor IA"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px]">Tutor IA</span>
        </button>

        {/* Quick Theme Toggle Button */}
        <button
          onClick={cycleTheme}
          className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
            isMono ? 'bg-zinc-900 border-white/20 text-white hover:bg-zinc-800' : isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-edumaster-cyan'
          }`}
          title="Cambiar tema visual (Oscuro en Grises / Azul Cyber / Claro Minimalista)"
        >
          {isMono ? (
            <>
              <Moon className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden md:inline text-[11px]">Grises</span>
            </>
          ) : isLight ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline text-[11px]">Claro</span>
            </>
          ) : (
            <>
              <Palette className="w-3.5 h-3.5 text-edumaster-cyan" />
              <span className="hidden md:inline text-[11px]">Cyber</span>
            </>
          )}
        </button>

        {/* Puntuación Global */}
        <div className={`hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border shadow-sm ${
          isMono ? 'bg-[#1E222C] border-[#2A2F3D]' : isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
        }`}>
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isMono ? "#2E3343" : isLight ? "#cbd5e1" : "#06152B"}
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isMono ? "#FFFFFF" : isLight ? "#0F172A" : "#00BFA6"}
                strokeWidth="3.5"
                strokeDasharray={`${globalScore}, 100`}
              />
            </svg>
            <span className="absolute text-[8px] font-black font-mono">
              {Math.round(globalScore)}
            </span>
          </div>
          <div>
            <span className="text-[10px] opacity-60 font-medium block leading-none">Puntuación</span>
            <span className="text-xs font-black font-mono tabular-numbers mt-0.5 block">{globalScore}%</span>
          </div>
        </div>

        {/* Notifications Icon with Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notificaciones${unreadCount ? `, ${unreadCount} sin leer` : ''}`}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center relative transition-all ${
              isMono ? 'bg-[#1E222C] border-[#2A2F3D] text-white' : isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-slate-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center ${
                isMono ? 'bg-white text-zinc-950' : 'bg-edumaster-cyan text-slate-950'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 border rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl ${
              isMono ? 'bg-[#1A1D24] border-[#3B4254] text-white' : isLight ? 'bg-white border-slate-300 text-slate-900 shadow-xl' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-white'
            }`}>
              <div className={`flex items-center justify-between pb-2 border-b mb-3 ${
                isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'
              }`}>
                <span className="text-xs font-bold">Notificaciones de Dominio</span>
                <span className="text-[10px] font-bold font-mono opacity-60">
                  {notificationMeta ? `${notificationMeta.source} · ${unreadCount} sin leer` : 'cargando...'}
                </span>
              </div>

              {notificationsError && (
                <p className={`text-[10px] mb-2 ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>{notificationsError}</p>
              )}

              <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-2.5 rounded-xl border ${
                      notification.read
                        ? 'opacity-60'
                        : isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : isMono ? 'bg-[#12141A] border-[#2A2F3D] text-gray-200' : 'bg-black/40 border-white/10'
                    } ${isLight ? 'border-slate-200' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold block">{notification.title}</span>
                      <span className={`text-[9px] font-mono px-1 rounded border shrink-0 ${
                        isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-white/5 border-white/10 text-slate-400'
                      }`}>
                        {notification.category}
                      </span>
                    </div>
                    <span className="opacity-60 text-[11px] block mt-0.5">{notification.message}</span>
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <span className={`text-[9px] font-mono opacity-50 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {notification.createdAt.slice(0, 10)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => void handleMarkRead(notification)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                            isLight ? 'bg-slate-900 text-white border-slate-900' : isMono ? 'bg-white text-zinc-950 border-white' : 'bg-edumaster-blue text-white border-edumaster-blue'
                          }`}
                        >
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && !notificationsError && (
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sin notificaciones.</p>
                )}
              </div>

              {preferences && (
                <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] ${
                  isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'
                }`}>
                  <span className="opacity-70">Notificaciones en la app</span>
                  <button
                    onClick={() => void handleToggleInApp()}
                    aria-pressed={preferences.inApp}
                    className={`px-2 py-0.5 rounded-lg border font-bold ${
                      preferences.inApp
                        ? isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {preferences.inApp ? 'Activadas' : 'Desactivadas'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-3 p-1.5 rounded-2xl border transition-all ${
              isMono ? 'bg-[#1E222C] border-[#2A2F3D] text-white' : isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-white'
            }`}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-white/20"
            />
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold block leading-tight">{user.name}</span>
              <span className="text-[10px] opacity-75 capitalize font-semibold">{user.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {showRoleMenu && (
            <div className={`absolute right-0 mt-2 w-64 border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl ${
              isMono ? 'bg-[#1A1D24] border-[#3B4254] text-white' : isLight ? 'bg-white border-slate-300 text-slate-900 shadow-xl' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-white'
            }`}>
              <div className={`px-3 py-2 border-b text-xs ${
                isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'
              }`}>
                <span className="opacity-50 block text-[10px] uppercase font-bold tracking-wider">Simular Rol RBAC</span>
                <span className="font-bold">Cambiar permisos de vista</span>
              </div>
              <div className="p-1 space-y-0.5">
                {rolesList.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onRoleChange(r.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      user.role === r.id
                        ? (isMono ? 'bg-white text-zinc-950 font-black' : isLight ? 'bg-slate-900 text-white font-bold' : 'bg-edumaster-blue/20 text-edumaster-cyan font-bold')
                        : (isLight ? 'hover:bg-slate-100 text-slate-700' : 'opacity-80 hover:opacity-100 hover:bg-white/5')
                    }`}
                  >
                    <div>
                      <span className="block font-semibold">{r.label}</span>
                      <span className="text-[10px] opacity-50 block font-normal">{r.desc}</span>
                    </div>
                    {user.role === r.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
