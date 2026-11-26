import React from 'react';
import { 
  BrainCircuit, 
  ShieldCheck, 
  CheckSquare, 
  Sparkles, 
  ArrowRight, 
  Award, 
  Zap, 
  LogIn, 
  Cpu, 
  Bot, 
  Sun, 
  Moon, 
  Palette, 
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { ThemeMode } from '../../types';

interface LandingPageViewProps {
  onLogin: () => void;
  onEnterApp: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onLogin,
  onEnterApp,
  theme,
  onThemeChange,
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isLight 
        ? 'bg-slate-50 text-slate-900' 
        : isMono 
        ? 'bg-[#0E1117] text-zinc-100' 
        : 'bg-[#030B18] text-slate-100'
    }`}>
      {/* =========================================================================
          1. TOP NAVIGATION BAR
      ========================================================================= */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        isLight 
          ? 'bg-white/90 border-slate-200 shadow-sm' 
          : isMono 
          ? 'bg-[#12151D]/90 border-[#242A38]' 
          : 'bg-[#06152B]/85 border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
              isMono 
                ? 'bg-zinc-100 text-zinc-900 shadow-white/5' 
                : isLight 
                ? 'bg-blue-600 text-white shadow-blue-500/20' 
                : 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-indigo-500/20'
            }`}>
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight">EduMaster<span className={isLight ? 'text-blue-600' : isMono ? 'text-zinc-300' : 'text-blue-400'}>.ai</span></span>
                <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full font-bold border ${
                  isLight 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : isMono 
                    ? 'bg-[#1C202B] text-zinc-300 border-[#303748]' 
                    : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                }`}>
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] opacity-60 hidden sm:block">Inteligencia Artificial para Retención y Gobernanza Académica</p>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium opacity-80">
            <a href="#caso-de-uso" className="hover:opacity-100 hover:text-blue-400 transition-colors">Caso de Uso</a>
            <a href="#speedgrader" className="hover:opacity-100 hover:text-blue-400 transition-colors">SpeedGrader</a>
            <a href="#tecnologia" className="hover:opacity-100 hover:text-blue-400 transition-colors">Tecnología</a>
            <a href="#auditoria" className="hover:opacity-100 hover:text-blue-400 transition-colors">Auditoría Ley 29733</a>
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Theme switcher button */}
            <button
              onClick={() => {
                const nextTheme = theme === 'monochrome' ? 'cyber' : theme === 'cyber' ? 'light' : 'monochrome';
                onThemeChange(nextTheme);
              }}
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                isLight 
                  ? 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700' 
                  : isMono 
                  ? 'bg-[#1A1E29] border-[#2E3547] hover:bg-[#252A3A] text-zinc-300' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
              title={`Tema actual: ${theme}. Clic para cambiar.`}
            >
              {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : isMono ? <Palette className="w-4 h-4 text-zinc-300" /> : <Moon className="w-4 h-4 text-blue-400" />}
              <span className="hidden lg:inline capitalize font-mono text-[11px]">{theme}</span>
            </button>

            {/* Login button */}
            <button
              onClick={onLogin}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center gap-2 transition-all ${
                isLight 
                  ? 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800 shadow-sm' 
                  : isMono 
                  ? 'bg-[#181C26] border-[#2F3649] hover:bg-[#222736] text-zinc-200' 
                  : 'bg-white/5 border-white/15 hover:bg-white/10 text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>

            {/* Direct Demo button */}
            <button
              onClick={onEnterApp}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:scale-102 active:scale-98 ${
                isMono 
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200' 
                  : isLight 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30'
              }`}
            >
              <span>Acceso Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================= */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Ambient background glow */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[140px] pointer-events-none -z-10 ${
          isLight 
            ? 'bg-blue-200/40' 
            : isMono 
            ? 'bg-zinc-700/10' 
            : 'bg-indigo-600/20'
        }`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Enterprise Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md animate-fade-in ${
              isLight 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : isMono 
                ? 'bg-[#181C26] border-[#31384B] text-zinc-300' 
                : 'bg-blue-900/30 border-blue-500/30 text-blue-300'
            }">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Modelo MTL PyTorch Calibrado (Brier Score 0.082) • SpeedGrader SOP 70-75</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
              Detección Temprana de Deserción y Evaluación Inteligente en la{' '}
              <span className={`bg-clip-text text-transparent ${
                isMono 
                  ? 'bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400' 
                  : isLight 
                  ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600' 
                  : 'bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300'
              }`}>
                Educación Superior
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg lg:text-xl opacity-75 max-w-3xl mx-auto leading-relaxed">
              Plataforma institucional de IA que predice el riesgo de abandono estudiantil con <strong>14 variables telemétricas LMS</strong>, asiste al docente en la corrección mediante <strong>SpeedGrader guiado por rúbricas</strong> y certifica cada intervención con <strong>auditoría inmutable SHA-256</strong> bajo la Ley N.° 29733.
            </p>

            {/* CTA Group */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onLogin}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-105 active:scale-95 ${
                  isMono 
                    ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' 
                    : isLight 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30' 
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30'
                }`}
              >
                <LogIn className="w-5 h-5" />
                <span>Ingresar a la Plataforma</span>
                <ChevronRight className="w-4 h-4 opacity-75" />
              </button>

              <button
                onClick={onEnterApp}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold border flex items-center justify-center gap-3 transition-all hover:bg-white/5 ${
                  isLight 
                    ? 'bg-white border-slate-300 text-slate-800 shadow-sm hover:bg-slate-100' 
                    : isMono 
                    ? 'bg-[#161A24] border-[#2C3345] text-zinc-200 hover:bg-[#1E2331]' 
                    : 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                }`}
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Explorar Demo Directo</span>
              </button>
            </div>

            <p className="text-xs opacity-50 font-mono pt-1">
              * Modo DEMO plug & play con datos sintéticos: sin necesidad de base de datos externa ni credenciales previas.
            </p>
          </div>

          {/* =========================================================================
              3. METRICS / STATS RIBBON
          ========================================================================= */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { label: 'Precisión Calibrada (MTL)', value: '94.2%', sub: 'Brier Score 0.082', icon: <Cpu className="w-5 h-5 text-blue-400" /> },
              { label: 'Inferencia PyTorch CPU', value: '< 15 ms', sub: 'Zero-GPU dependency', icon: <Zap className="w-5 h-5 text-amber-400" /> },
              { label: 'Ahorro Tiempo Docente', value: '72%', sub: 'SOP 70-75 SpeedGrader', icon: <CheckSquare className="w-5 h-5 text-emerald-400" /> },
              { label: 'Integridad Criptográfica', value: '100%', sub: 'SHA-256 Ley 29733', icon: <ShieldCheck className="w-5 h-5 text-indigo-400" /> },
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border text-center transition-all hover:-translate-y-1 ${
                  isLight 
                    ? 'bg-white border-slate-200 shadow-sm' 
                    : isMono 
                    ? 'bg-[#141822] border-[#282F40]' 
                    : 'bg-[#081830]/80 border-white/10'
                }`}
              >
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold mt-1">{stat.label}</div>
                <div className="text-[10px] opacity-60 font-mono mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* =========================================================================
              4. LIVE INTERACTIVE MOCKUP TEASER
          ========================================================================= */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className={`p-4 sm:p-6 rounded-3xl border shadow-2xl relative overflow-hidden ${
              isLight 
                ? 'bg-white border-slate-200' 
                : isMono 
                ? 'bg-[#151923] border-[#2C3345]' 
                : 'bg-[#091C36] border-white/15'
            }`}>
              {/* Window controls bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-xs font-mono opacity-60 ml-2">EduMaster Console • Vista SpeedGrader & Matriz de Riesgo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-mono font-bold text-emerald-400">PyTorch CPU Activo</span>
                </div>
              </div>

              {/* Mock content grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Panel 1: Alumno en Riesgo */}
                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2C3345]' : 'bg-[#061427] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold">1. Diagnóstico de Riesgo</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Crítico (84%)</span>
                  </div>
                  <p className="text-sm font-bold">Estudiante: Sofía Ramírez</p>
                  <p className="text-xs opacity-70 mt-1">Ausencias consecutivas: 4 sesiones</p>
                  <p className="text-xs opacity-70">Entregas a destiempo: 3 de 5</p>
                  <div className="mt-3 text-[11px] font-mono p-2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    Alerta generada por Head C del modelo MTL.
                  </div>
                </div>

                {/* Panel 2: SpeedGrader SOP 70-75 */}
                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2C3345]' : 'bg-[#061427] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold">2. SpeedGrader SOP</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Rúbrica Activa</span>
                  </div>
                  <p className="text-sm font-bold">Evaluación: Redes Neuronales</p>
                  <p className="text-xs opacity-70 mt-1">Precisión Conceptual: 17/20</p>
                  <p className="text-xs opacity-70">Implementación PyTorch: 18/20</p>
                  <div className="mt-3 text-[11px] font-mono p-2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    Sugerencia IA revisada y validada por el Docente.
                  </div>
                </div>

                {/* Panel 3: Sello Criptográfico Inmutable */}
                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2C3345]' : 'bg-[#061427] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold">3. Sello Inmutable</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Ley 29733</span>
                  </div>
                  <p className="text-xs font-mono break-all opacity-80">
                    SHA-256: 9e3b4f...a812cd
                  </p>
                  <p className="text-xs opacity-70 mt-2">Firmado por: Dr. Alejandro Morales</p>
                  <div className="mt-3 text-[11px] font-mono p-2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Encadenado en log criptográfico inmutable.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CORE PILLARS & FEATURES SECTION
      ========================================================================= */}
      <section id="caso-de-uso" className={`py-20 border-t transition-colors ${
        isLight ? 'bg-white border-slate-200' : isMono ? 'bg-[#10141D] border-[#222836]' : 'bg-[#040E1E] border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-widest uppercase text-blue-500">Módulos Estratégicos</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ingeniería de Precisión para el Ecosistema Académico
            </h3>
            <p className="text-base opacity-75">
              Diseñado para resolver la deserción estudiantil sin generar sobrecarga docente, garantizando respaldo normativo ante auditorías y comités de calidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Cpu className="w-6 h-6 text-blue-400" />,
                title: 'Modelo Multi-Task Learning (MTL)',
                description: 'Arquitectura PyTorch con cabeza de inferencia Head C especializada en predecir probabilidad de deserción con calibración de confianza Brier Score 0.082.',
                badge: 'PyTorch CPU'
              },
              {
                icon: <CheckSquare className="w-6 h-6 text-emerald-400" />,
                title: 'SpeedGrader Guiado (SOP 70-75)',
                description: 'Flujo estándar que asiste la corrección docente con rúbricas parametrizadas, reduciendo en 72% el tiempo por entrega sin delegar la autonomía académica.',
                badge: 'Productividad'
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />,
                title: 'Auditoría Criptográfica SHA-256',
                description: 'Trazabilidad estricta bajo Ley N.° 29733 de Protección de Datos Personales. Cada evaluación genera un hash inmutable verificable por SUNEDU.',
                badge: 'Cumplimiento Legal'
              },
              {
                icon: <Bot className="w-6 h-6 text-purple-400" />,
                title: 'Tutor IA Adaptativo 24/7',
                description: 'Asistente socrático que refuerza competencias complejas en código, matemáticas y lógica sin resolver los exámenes por el estudiante.',
                badge: 'Soporte Continuo'
              },
              {
                icon: <Award className="w-6 h-6 text-amber-400" />,
                title: 'Certificación Digital con QR',
                description: 'Folios verificables al instante mediante escaneo de código QR desde cualquier celular conectado a la red local o institucional.',
                badge: 'Verificación Móvil'
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
                title: 'Gobernanza & Visualizador Neuronal',
                description: 'Inspección de activaciones por capa (embeddings, pesos y bias) para desmitificar el comportamiento de la red ante auditores.',
                badge: 'Explicabilidad'
              },
            ].map((feature, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-3xl border transition-all hover:scale-102 hover:shadow-lg ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 hover:bg-white' 
                    : isMono 
                    ? 'bg-[#151923] border-[#293041] hover:bg-[#1A1F2C]' 
                    : 'bg-[#081830]/90 border-white/10 hover:border-blue-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${isLight ? 'bg-white shadow-sm' : isMono ? 'bg-[#1E2331]' : 'bg-white/5'}`}>
                    {feature.icon}
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : isMono ? 'bg-[#1E2331] text-zinc-300 border-[#323B4E]' : 'bg-white/5 text-blue-300 border-white/10'
                  }`}>
                    {feature.badge}
                  </span>
                </div>
                <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                <p className="text-sm opacity-75 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. TECHNOLOGY STACK & ARCHITECTURE
      ========================================================================= */}
      <section id="tecnologia" className={`py-20 border-t transition-colors ${
        isLight ? 'bg-slate-100/60 border-slate-200' : isMono ? 'bg-[#0C0F15] border-[#1E2330]' : 'bg-[#020712] border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-widest uppercase text-emerald-500">Arquitectura Técnica</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Stack Oficial Cloud-Native y Zero-GPU
            </h3>
            <p className="text-base opacity-75">
              Construido para operar en servidores de bajo costo sin comprometer la velocidad ni la robustez.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'React 19 + Vite', role: 'Frontend SPA', status: 'Optimizada' },
              { name: 'FastAPI + Pydantic v2', role: 'Backend API', status: '< 10 ms p95' },
              { name: 'PyTorch CPU', role: 'Motor MTL', status: 'Inferencias < 15ms' },
              { name: 'SQLite / PostgreSQL 16', role: 'Almacenamiento', status: 'Asyncpg Driver' },
              { name: 'Redis Streams', role: 'Event Pipeline', status: 'Alertas en vivo' },
              { name: 'Docker + Railway', role: 'Contenerización', status: 'Multi-stage build' },
            ].map((tech, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isLight 
                    ? 'bg-white border-slate-200' 
                    : isMono 
                    ? 'bg-[#151923] border-[#293041]' 
                    : 'bg-[#06152B] border-white/10'
                }`}
              >
                <p className="font-bold text-sm mb-1">{tech.name}</p>
                <p className="text-xs opacity-60 mb-2">{tech.role}</p>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  isLight ? 'bg-emerald-50 text-emerald-700' : isMono ? 'bg-zinc-800 text-zinc-300' : 'bg-emerald-500/10 text-emerald-300'
                }`}>
                  {tech.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CALL TO ACTION & ACCESS
      ========================================================================= */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className={`p-10 sm:p-14 rounded-3xl border shadow-2xl relative overflow-hidden ${
            isLight 
              ? 'bg-blue-600 text-white border-blue-500' 
              : isMono 
              ? 'bg-[#151923] border-[#2F3649]' 
              : 'bg-gradient-to-br from-[#0A2247] to-[#040F22] border-blue-500/30'
          }`}>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Experimenta el Futuro de la Gestión Académica
            </h3>
            <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Accede de inmediato en Modo Demostración sin registros engorrosos ni instalaciones adicionales. Todo el sistema está listo para ser explorado.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onLogin}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 ${
                  isLight 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : isMono 
                    ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' 
                    : 'bg-white text-blue-950 hover:bg-blue-50'
                }`}
              >
                <LogIn className="w-5 h-5" />
                <span>Ingresar al Login Demo</span>
              </button>
              <button
                onClick={onEnterApp}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold border flex items-center justify-center gap-2 transition-all hover:bg-white/10 ${
                  isLight ? 'border-white/40 text-white' : 'border-white/20 text-white'
                }`}
              >
                <span>Acceso Rápido al Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOOTER
      ========================================================================= */}
      <footer className={`py-12 border-t mt-auto text-xs transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-600' : isMono ? 'bg-[#0B0D13] border-[#1C202B] text-zinc-400' : 'bg-[#030914] border-white/10 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              isMono ? 'bg-zinc-800 text-white' : 'bg-blue-600 text-white'
            }`}>
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm">EduMaster.ai Enterprise Platform</p>
              <p className="text-[11px] opacity-60">Proyecto Académico • Caso de Uso: Retención Estudiantil & SpeedGrader</p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p>Conforme a la Ley N.° 29733 de Protección de Datos Personales (Perú) y estándares SUNEDU.</p>
            <p className="font-mono text-[10px] opacity-60">React 19 • FastAPI 0.115 • PyTorch CPU • SQLite/Postgres • SHA-256 Audit Trail</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
