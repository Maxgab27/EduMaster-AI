import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { NeuralVisualizer } from './components/dashboard/NeuralVisualizer';
import { MetricCardsRow } from './components/dashboard/MetricCardsRow';
import { GeoProgressMap } from './components/dashboard/GeoProgressMap';
import { CourseCompletionDonut } from './components/dashboard/CourseCompletionDonut';
import { SkillMasteryHeatmap } from './components/dashboard/SkillMasteryHeatmap';
import { RecentActivityFeed } from './components/dashboard/RecentActivityFeed';
import { LearningPathsView } from './components/modules/LearningPathsView';
import { CoursesView } from './components/modules/CoursesView';
import { AnalyticsView } from './components/modules/AnalyticsView';
import { AITutorView } from './components/modules/AITutorView';
import { AssessmentsView } from './components/modules/AssessmentsView';
import { CertificatesView } from './components/modules/CertificatesView';
import { NeuralInspectorView } from './components/modules/NeuralInspectorView';
import { SettingsView } from './components/modules/SettingsView';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminGovernanceView } from './components/admin/AdminGovernanceView';
import { GlobalCommandPalette } from './components/common/GlobalCommandPalette';
import { AITutorDrawer } from './components/common/AITutorDrawer';
import { currentUser, metricCards } from './data/mockData';
import { NavTab, UserProfile, UserRole, ThemeMode } from './types';
import { Users2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [user, setUser] = useState<UserProfile>(currentUser);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [globalScore] = useState<number>(92.6);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isAITutorDrawerOpen, setIsAITutorDrawerOpen] = useState(false);
  
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

  const handleRoleChange = (newRole: UserRole) => {
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

    setUser(prev => ({
      ...prev,
      role: newRole,
      name,
      title,
      avatar
    }));
  };

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  return (
    <div 
      data-theme={theme}
      className={`min-h-screen bg-edumaster-ambient flex font-sans selection:bg-white/20 selection:text-white transition-colors duration-300 ${
        isLight ? 'text-slate-900' : 'text-slate-100'
      }`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onlineCount={user.onlineCount}
        theme={theme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={user}
          onRoleChange={handleRoleChange}
          isDemoMode={isDemoMode}
          onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
          globalScore={globalScore}
          theme={theme}
          onThemeChange={handleThemeChange}
          onOpenCommandPalette={() => setIsCmdPaletteOpen(true)}
          onOpenAITutor={() => setIsAITutorDrawerOpen(true)}
        />

        <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Transparency / Demo Notice Banner */}
          {isDemoMode && activeTab === 'dashboard' && (
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
              <button
                onClick={() => setIsDemoMode(false)}
                className={`px-2.5 py-1 rounded text-xs font-semibold border shrink-0 transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                    : isMono 
                    ? 'bg-[#242A38] hover:bg-[#2F3648] text-white border-[#3B4254]' 
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                }`}
              >
                Ocultar Aviso
              </button>
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
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Row 1: Executive KPI Metrics Cards at the Top */}
                <MetricCardsRow metrics={metricCards} theme={theme} />

                {/* Row 2: Neural Visualizer (8 cols) & Compact Donut + Activity (4 cols) */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="xl:col-span-8 h-[440px]">
                    <NeuralVisualizer theme={theme} />
                  </div>
                  <div className="xl:col-span-4 flex flex-col gap-4">
                    <CourseCompletionDonut theme={theme} />
                    <div className="flex-1 min-h-[200px]">
                      <RecentActivityFeed theme={theme} onViewAll={() => setActiveTab('analytics')} />
                    </div>
                  </div>
                </div>

                {/* Row 3: High-Definition Geo Progress Map & Competency Heatmap */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <GeoProgressMap theme={theme} />
                  </div>
                  <div className="lg:col-span-5">
                    <SkillMasteryHeatmap theme={theme} />
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === 'learning-paths' && <LearningPathsView theme={theme} />}
          {activeTab === 'courses' && <CoursesView theme={theme} />}
          {activeTab === 'analytics' && <AnalyticsView theme={theme} />}
          {activeTab === 'ai-tutor' && <AITutorView theme={theme} />}
          {activeTab === 'assessments' && <AssessmentsView theme={theme} />}
          {activeTab === 'certificates' && <CertificatesView theme={theme} />}
          {activeTab === 'neural-inspector' && <NeuralInspectorView theme={theme} />}
          {activeTab === 'governance' && <AdminGovernanceView theme={theme} />}
          {activeTab === 'settings' && <SettingsView currentTheme={theme} onThemeChange={handleThemeChange} />}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-black flex items-center gap-2 m-0">
                  <Users2 className="w-5 h-5 opacity-80" />
                  Comunidad de Aprendizaje y Espacios de Debate
                </h1>
                <p className="text-xs opacity-60 mt-1 m-0">
                  Interacción moderada por cohortes, foros de consulta técnica y retroalimentación entre pares.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`p-5 rounded-2xl border transition-all ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel text-slate-100'
                }`}>
                  <div className={`flex items-center justify-between pb-3 border-b mb-3 ${
                    isLight ? 'border-slate-100' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'
                  }`}>
                    <span className="font-bold text-sm">#deep-learning-transformers</span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'opacity-60'}`}>1,420 miembros</span>
                  </div>
                  <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-slate-600' : 'opacity-75'}`}>
                    Discusión sobre implementación de matrices de atención FlashAttention-2 y reducción de complejidad cuadrática $O(N^2)$.
                  </p>
                  <button className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    isMono 
                      ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' 
                      : isLight
                      ? 'bg-slate-900 text-white font-bold hover:bg-slate-800'
                      : 'bg-edumaster-blue hover:bg-edumaster-blue/80 text-white'
                  }`}>
                    Entrar al Canal
                  </button>
                </div>

                <div className={`p-5 rounded-2xl border transition-all ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : isMono ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100' : 'glass-panel text-slate-100'
                }`}>
                  <div className={`flex items-center justify-between pb-3 border-b mb-3 ${
                    isLight ? 'border-slate-100' : isMono ? 'border-[#2A2F3D]' : 'border-white/10'
                  }`}>
                    <span className="font-bold text-sm">#mlops-pipeline-fastapi</span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'opacity-60'}`}>980 miembros</span>
                  </div>
                  <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-slate-600' : 'opacity-75'}`}>
                    Buenas prácticas de versionado de modelos con MLflow, contenedores ligeros en Docker y rollback en staging.
                  </p>
                  <button className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    isMono 
                      ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' 
                      : isLight
                      ? 'bg-slate-900 text-white font-bold hover:bg-slate-800'
                      : 'bg-edumaster-violet hover:bg-edumaster-violet/80 text-white'
                  }`}>
                    Entrar al Canal
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <GlobalCommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        onNavigate={setActiveTab}
        onRoleChange={handleRoleChange}
        onThemeChange={handleThemeChange}
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
