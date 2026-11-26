import React, { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { NeuralVisualizer } from './components/dashboard/NeuralVisualizer';
import { MetricCardsRow } from './components/dashboard/MetricCardsRow';
import { GeoProgressMap } from './components/dashboard/GeoProgressMap';
import { CourseCompletionDonut } from './components/dashboard/CourseCompletionDonut';
import { SkillMasteryHeatmap } from './components/dashboard/SkillMasteryHeatmap';
import { RecentActivityFeed } from './components/dashboard/RecentActivityFeed';
import { AIRecommendationsCard } from './components/dashboard/AIRecommendationsCard';
import { CertificatesView, CertificateReceiptView } from './components/modules/CertificatesView';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { GlobalCommandPalette } from './components/common/GlobalCommandPalette';
import { AITutorDrawer } from './components/common/AITutorDrawer';
import { GlassBackground } from './components/common/GlassBackground';
import { currentUser } from './data/mockData';
import { getDashboardSummary } from './services/dashboardApi';
import { canViewTab } from './auth/permissions';
import { ApiMeta, DashboardSummary, NavTab, UserProfile, UserRole, ThemeMode } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

/** Perfil DEMO asociado al rol activo (mismo mapa para inicio y cambio de rol). */
function profileForRole(newRole: UserRole, base: UserProfile, persistedName?: string): UserProfile {
  let name = 'Dra. López';
  let title = 'Administrador Principal';
  let avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';

  if (newRole === 'estudiante') {
    name = 'Sofia Ramírez Vargas';
    title = 'Estudiante • Especialidad en Deep Learning';
    avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
  } else if (newRole === 'docente' || newRole === 'coordinador') {
    name = 'Dr. Alejandro Morales';
    title = 'Docente Titular • Redes Neuronales & Transformers';
    avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  } else if (newRole === 'mle') {
    name = 'Ing. Carlos Mendoza';
    title = 'Staff ML Engineer • MLOps & DVC';
    avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
  } else if (newRole === 'auditor') {
    name = 'Abg. Roberto Castillo';
    title = 'Auditor Legal • Privacidad & Ley 29733';
    avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';
  }

  return { ...base, role: newRole, name: persistedName || name, title, avatar };
}

/**
 * División por módulos: el inicio y el flujo QR (certificados) cargan de forma
 * inmediata; las vistas secundarias se descargan solo cuando se abren.
 */
const LearningPathsView = lazy(() =>
  import('./components/modules/LearningPathsView').then(module => ({ default: module.LearningPathsView })),
);
const CoursesView = lazy(() =>
  import('./components/modules/CoursesView').then(module => ({ default: module.CoursesView })),
);
const AnalyticsView = lazy(() =>
  import('./components/modules/AnalyticsView').then(module => ({ default: module.AnalyticsView })),
);
const AITutorView = lazy(() =>
  import('./components/modules/AITutorView').then(module => ({ default: module.AITutorView })),
);
const AssessmentsView = lazy(() =>
  import('./components/modules/AssessmentsView').then(module => ({ default: module.AssessmentsView })),
);
const NeuralInspectorView = lazy(() =>
  import('./components/modules/NeuralInspectorView').then(module => ({ default: module.NeuralInspectorView })),
);
const AdminGovernanceView = lazy(() =>
  import('./components/admin/AdminGovernanceView').then(module => ({ default: module.AdminGovernanceView })),
);
const CommunityView = lazy(() =>
  import('./components/modules/CommunityView').then(module => ({ default: module.CommunityView })),
);
const SettingsView = lazy(() =>
  import('./components/modules/SettingsView').then(module => ({ default: module.SettingsView })),
);
const LandingPageView = lazy(() =>
  import('./components/public/LandingPageView').then(module => ({ default: module.LandingPageView })),
);
const LoginView = lazy(() =>
  import('./components/public/LoginView').then(module => ({ default: module.LoginView })),
);

type AppViewMode = 'landing' | 'login' | 'app';

export const App: React.FC = () => {
  // Modo de visualización: landing (pública), login (autenticación demo) o app (plataforma).
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'login') return 'login';
    if (viewParam === 'app') return 'app';
    if (viewParam === 'landing') return 'landing';
    if (params.get('verify') || params.get('receipt')) return 'app';
    try {
      const savedAuth = localStorage.getItem('edumaster_authenticated');
      if (savedAuth === 'true') return 'app';
    } catch {}
    return 'landing';
  });

  // Un QR escaneado abre la SPA con ?verify=<folio> y debe llevar a verificación.
  const [verifyFolio] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('verify'),
  );
  // ?receipt=<folio> abre una página de comprobante de una sola hoja en el celular.
  const [receiptFolio] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('receipt'),
  );
  const [activeTab, setActiveTab] = useState<NavTab>(verifyFolio ? 'certificates' : 'dashboard');
  // Fase 4: rehidratamos el rol DEMO guardado para que X-Role sobreviva a recargas.
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const raw = localStorage.getItem('edumaster_demo_user');
      if (!raw) return currentUser;
      const parsed = JSON.parse(raw) as { name?: string; role?: UserRole };
      if (!parsed.role) return currentUser;
      return profileForRole(parsed.role, currentUser, parsed.name);
    } catch {
      return currentUser;
    }
  });
  const [globalScore] = useState<number>(92.6);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [apiMeta, setApiMeta] = useState<ApiMeta | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dashboardReloadKey, setDashboardReloadKey] = useState(0);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isAITutorDrawerOpen, setIsAITutorDrawerOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  // Theme state: defaults to 'monochrome' (Blanco y Negro / Charcoal)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('edumaster_theme') as ThemeMode;
    return saved || 'monochrome';
  });

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('edumaster_theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // El drawer solo existe como modal en celular; al pasar a escritorio se cierra.
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const syncViewport = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
      if (!event.matches) setIsMobileNavOpen(false);
    };
    query.addEventListener('change', syncViewport);
    return () => query.removeEventListener('change', syncViewport);
  }, []);

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
    if (window.matchMedia('(max-width: 767px)').matches) {
      menuButtonRef.current?.focus();
    }
  }, []);

  // Accesibilidad del drawer: Escape, foco atrapado y retorno al botón que lo abrió.
  useEffect(() => {
    if (!isMobileNavOpen || !isMobileViewport) return;
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;
    const focusableItems = () =>
      Array.from(
        sidebar.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(element => element.getClientRects().length > 0);

    focusableItems()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileNav();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusableItems();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!sidebar.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMobileNavOpen, isMobileViewport, closeMobileNav]);

  useEffect(() => {
    if (!verifyFolio) return;
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [verifyFolio]);

  // El actor DEMO viaja como X-Actor en las peticiones /api/v1.
  useEffect(() => {
    try {
      localStorage.setItem('edumaster_demo_user', JSON.stringify({ name: user.name, role: user.role }));
    } catch {
      // Sin localStorage el backend usa demo-user.
    }
  }, [user.name, user.role]);

  useEffect(() => {
    const controller = new AbortController();
    getDashboardSummary(controller.signal)
      .then(response => {
        setSummary(response.data);
        setApiMeta(response.meta);
        setApiError(null);
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setApiError(error instanceof Error ? error.message : 'Error al cargar el resumen');
      });
    return () => controller.abort();
  }, [dashboardReloadKey]);

  const handleRoleChange = (newRole: UserRole) => {
    setUser(prev => profileForRole(newRole, prev));

    if (!canViewTab(newRole, activeTab)) {
      setActiveTab('dashboard');
    }
  };

  const handleLogin = (role: UserRole, customName?: string) => {
    setUser(prev => profileForRole(role, prev, customName));
    try {
      localStorage.setItem('edumaster_authenticated', 'true');
    } catch {}
    setViewMode('app');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('edumaster_authenticated');
    } catch {}
    setViewMode('landing');
  };

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  // El comprobante es una página independiente: el celular la abre sin popup.
  if (receiptFolio) {
    return (
      <div data-theme={theme} className="min-h-screen relative font-sans">
        <GlassBackground theme={theme} />
        <CertificateReceiptView folio={receiptFolio} theme={theme} />
      </div>
    );
  }

  // Vista de Landing Page pública
  if (viewMode === 'landing') {
    return (
      <div data-theme={theme} className="min-h-screen relative font-sans">
        <GlassBackground theme={theme} />
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center font-mono text-sm opacity-70">
            Cargando EduMaster.ai Enterprise...
          </div>
        }>
          <LandingPageView
            onLogin={() => setViewMode('login')}
            onEnterApp={() => {
              try {
                localStorage.setItem('edumaster_authenticated', 'true');
              } catch {}
              setViewMode('app');
            }}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
        </Suspense>
      </div>
    );
  }

  // Vista de Login Demo
  if (viewMode === 'login') {
    return (
      <div data-theme={theme} className="min-h-screen relative font-sans">
        <GlassBackground theme={theme} />
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center font-mono text-sm opacity-70">
            Cargando inicio de sesión...
          </div>
        }>
          <LoginView
            onLogin={handleLogin}
            onBackToLanding={() => setViewMode('landing')}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div 
      data-theme={theme}
      className={`min-h-screen bg-transparent flex font-sans selection:bg-white/20 selection:text-white transition-colors duration-300 relative ${
        isLight ? 'text-slate-900' : 'text-slate-100'
      }`}
    >
      <GlassBackground theme={theme} />
      {/* Sidebar Navigation: drawer en celular, columna fija en escritorio */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}
      <Sidebar
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          closeMobileNav();
        }}
        onlineCount={user.onlineCount}
        role={user.role}
        theme={theme}
        mobileOpen={isMobileNavOpen}
        isMobile={isMobileViewport}
        onClose={closeMobileNav}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={user}
          onRoleChange={handleRoleChange}
          globalScore={globalScore}
          theme={theme}
          onThemeChange={handleThemeChange}
          onOpenCommandPalette={() => setIsCmdPaletteOpen(true)}
          onOpenAITutor={() => setIsAITutorDrawerOpen(true)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          mobileNavOpen={isMobileNavOpen}
          menuButtonRef={menuButtonRef}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Transparency / Demo Notice Banner */}
          {activeTab === 'dashboard' && (
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              isLight
                ? 'bg-amber-50/90 border-amber-200 text-amber-900 shadow-sm'
                : isMono
                ? 'bg-[#1A1D24] border-[#3B4254] text-zinc-200 shadow-md'
                : 'bg-[#0A1F3D]/90 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-600' : isMono ? 'text-zinc-200' : 'text-amber-400'}`} />
                <span>
                  <strong>Aviso de Gobernanza (Principio de Transparencia):</strong> Este panel opera con un dataset sintético etiquetado <code>DEMO</code> para validación funcional. La puesta en producción institucional requiere base de datos autorizada y validación legal según Ley N.° 29733.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline font-mono text-[10px] opacity-60">
                  {apiMeta ? `${apiMeta.source} · ${apiMeta.correlationId.slice(0, 14)}` : 'cargando...'}
                </span>
                <button
                  onClick={() => setDashboardReloadKey(key => key + 1)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isLight ? 'bg-white border-amber-200 hover:bg-amber-100' : isMono ? 'bg-[#202532] border-[#3B4254] hover:bg-[#2A3040]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  title="Recargar resumen"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Conditional Module Rendering */}
          {activeTab === 'dashboard' && (
            user.role === 'estudiante' ? (
              <StudentDashboard 
                theme={theme} 
                onOpenAITutor={() => setIsAITutorDrawerOpen(true)} 
              />
            ) : (user.role === 'docente' || user.role === 'coordinador') ? (
              <TeacherDashboard theme={theme} />
            ) : apiError ? (
              <div className={`p-6 rounded-3xl border text-sm ${
                isLight ? 'bg-rose-50 border-rose-200 text-rose-900' : isMono ? 'bg-[#211618] border-[#4A262A] text-rose-200' : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}>
                <p className="font-bold m-0">No se pudo cargar el resumen.</p>
                <p className="font-mono text-xs mt-2 mb-0">{apiError}</p>
              </div>
            ) : !summary ? (
              <div className={`p-6 rounded-3xl border text-sm animate-pulse ${
                isLight ? 'bg-white border-slate-200 text-slate-600' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-300' : 'glass-panel border-edumaster-cardBorder text-slate-300'
              }`}>
                Cargando resumen desde {import.meta.env.VITE_API_BASE_URL ? 'la API configurada' : 'el adaptador DEMO'}...
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Row 1: Executive KPI Metrics Cards at the Top */}
                <MetricCardsRow metrics={summary.metrics} theme={theme} />

                {/* Row 2: Neural Visualizer (8 cols) & Compact Donut + Activity (4 cols) */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="xl:col-span-8 h-[440px]">
                    <NeuralVisualizer theme={theme} neural={summary.neural} />
                  </div>
                  <div className="xl:col-span-4 flex flex-col gap-4">
                    <CourseCompletionDonut theme={theme} />
                    <div className="flex-1 min-h-[200px]">
                      <RecentActivityFeed
                        theme={theme}
                        activity={summary.activity}
                        onViewAll={() => setActiveTab('analytics')}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: High-Definition Geo Progress Map & Competency Heatmap */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <GeoProgressMap theme={theme} regions={summary.regions} />
                  </div>
                  <div className="lg:col-span-5">
                    <SkillMasteryHeatmap theme={theme} skills={summary.skills} />
                  </div>
                </div>

                {/* Row 4: Recomendaciones derivadas del artefacto MTL + catálogo */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-12 h-[360px]">
                    <AIRecommendationsCard theme={theme} />
                  </div>
                </div>
              </div>
            )
          )}

          {!canViewTab(user.role, activeTab) && (
            <div className={`p-6 rounded-3xl border text-sm ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : isMono ? 'bg-[#1F1C16] border-[#4A3B2C] text-amber-200' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}>
              <p className="font-bold m-0">Acceso restringido para el rol {user.role}.</p>
              <p className="text-xs opacity-75 mt-1 mb-0">
                Guarda visual implementado con RBAC de demostración. La autoridad real debe validarse en backend (RBAC + ABAC).
              </p>
            </div>
          )}

          <Suspense fallback={(
            <div className={`p-6 rounded-2xl border text-xs animate-pulse ${
              isLight ? 'bg-white border-slate-200 text-slate-500' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-400' : 'glass-panel border-edumaster-cardBorder text-slate-400'
            }`}>
              Cargando módulo...
            </div>
          )}>
            {canViewTab(user.role, activeTab) && activeTab === 'learning-paths' && <LearningPathsView theme={theme} />}
            {canViewTab(user.role, activeTab) && activeTab === 'courses' && <CoursesView theme={theme} role={user.role} />}
            {canViewTab(user.role, activeTab) && activeTab === 'analytics' && <AnalyticsView theme={theme} />}
            {canViewTab(user.role, activeTab) && activeTab === 'ai-tutor' && <AITutorView theme={theme} />}
            {canViewTab(user.role, activeTab) && activeTab === 'assessments' && <AssessmentsView theme={theme} role={user.role} />}
            {canViewTab(user.role, activeTab) && activeTab === 'certificates' && (
              <CertificatesView theme={theme} initialVerifyFolio={verifyFolio ?? undefined} />
            )}
            {canViewTab(user.role, activeTab) && activeTab === 'neural-inspector' && <NeuralInspectorView theme={theme} />}
            {canViewTab(user.role, activeTab) && activeTab === 'governance' && <AdminGovernanceView theme={theme} role={user.role} />}
            {canViewTab(user.role, activeTab) && activeTab === 'settings' && (
              <SettingsView
                currentTheme={theme}
                onThemeChange={handleThemeChange}
                role={user.role}
                actor={user.name}
              />
            )}

            {/* Community Tab: vista funcional con hilos, mensajes y moderación */}
            {canViewTab(user.role, activeTab) && activeTab === 'community' && (
              <CommunityView theme={theme} role={user.role} actor={user.name} />
            )}
          </Suspense>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <GlobalCommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        onOpen={() => setIsCmdPaletteOpen(true)}
        onNavigate={setActiveTab}
        onRoleChange={handleRoleChange}
        onThemeChange={handleThemeChange}
        role={user.role}
        theme={theme}
      />

      {/* Floating AI Tutor Drawer */}
      <AITutorDrawer
        isOpen={isAITutorDrawerOpen}
        onClose={() => setIsAITutorDrawerOpen(false)}
        theme={theme}
      />
    </div>
  );
};

export default App;
