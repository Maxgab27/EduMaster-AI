import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Palette,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { ThemeMode, UserRole } from '../../types';

interface LoginViewProps {
  onLogin: (role: UserRole, name?: string) => void;
  onBackToLanding: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

interface DemoProfile {
  name: string;
  role: UserRole;
  title: string;
  email: string;
  avatar: string;
  badge: string;
}

const DEMO_PROFILES: DemoProfile[] = [
  {
    name: 'Dr. Alejandro Morales',
    role: 'docente',
    title: 'Docente Titular • SpeedGrader & Riesgo',
    email: 'docente@edumaster.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: 'Docente Evaluador',
  },
  {
    name: 'Sofía Ramírez Vargas',
    role: 'estudiante',
    title: 'Estudiante • Especialidad Deep Learning',
    email: 'sofia.ramirez@edumaster.ai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    badge: 'Estudiante',
  },
  {
    name: 'Dra. López',
    role: 'admin',
    title: 'Administrador Principal • Gobernanza',
    email: 'admin@edumaster.ai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badge: 'Administración',
  },
  {
    name: 'Ing. Carlos Mendoza',
    role: 'mle',
    title: 'Staff ML Engineer • MLOps & PyTorch',
    email: 'mle@edumaster.ai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badge: 'Ingeniería ML',
  },
  {
    name: 'Abg. Roberto Castillo',
    role: 'auditor',
    title: 'Auditor Legal • Cumplimiento Ley 29733',
    email: 'auditoria@edumaster.ai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    badge: 'Auditoría Legal',
  },
];

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onBackToLanding,
  theme,
  onThemeChange,
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const [selectedProfile, setSelectedProfile] = useState<DemoProfile>(DEMO_PROFILES[0]);
  const [email, setEmail] = useState<string>(DEMO_PROFILES[0].email);
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const handleSelectProfile = (profile: DemoProfile) => {
    setSelectedProfile(profile);
    setEmail(profile.email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedProfile.role, selectedProfile.name);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 bg-transparent ${
      isLight ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* Top Header */}
      <header className={`h-16 px-6 border-b flex items-center justify-between transition-colors backdrop-blur-2xl ${
        isLight ? 'bg-white/75 border-slate-200/70 shadow-sm' : isMono ? 'bg-[#0F131D]/75 border-white/10' : 'bg-[#06152B]/75 border-white/10'
      }`}>
        <button
          onClick={onBackToLanding}
          className={`text-xs font-semibold flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all backdrop-blur-md ${
            isLight ? 'bg-white/80 border-slate-200 hover:bg-white text-slate-700' : isMono ? 'bg-white/[0.06] border-white/10 hover:bg-white/[0.1] text-zinc-200' : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.12] text-slate-200'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la Página Principal</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            onClick={() => {
              const nextTheme = theme === 'monochrome' ? 'cyber' : theme === 'cyber' ? 'light' : 'monochrome';
              onThemeChange(nextTheme);
            }}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors backdrop-blur-md ${
              isLight ? 'bg-white/80 border-slate-200 text-slate-700' : isMono ? 'bg-white/[0.06] border-white/10 text-zinc-300' : 'bg-white/[0.06] border-white/10 text-slate-300'
            }`}
            title={`Tema: ${theme}`}
          >
            {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : isMono ? <Palette className="w-4 h-4 text-zinc-300" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Form Card */}
          <div className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all backdrop-blur-2xl ${
            isLight 
              ? 'bg-white/80 border-white/60 shadow-xl' 
              : isMono 
              ? 'bg-[#10141F]/80 border-white/15' 
              : 'bg-[#06152B]/80 border-white/20'
          }`}>
            {/* Header / Brand */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md ${
                isMono ? 'bg-zinc-100 text-zinc-900' : 'bg-blue-600 text-white'
              }`}>
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Iniciar Sesión</h1>
                <p className="text-xs opacity-60">EduMaster.ai Enterprise Platform</p>
              </div>
            </div>

            {/* Demo Notice Banner */}
            <div className={`p-3 rounded-xl border text-xs mb-6 flex items-start gap-2.5 ${
              isLight ? 'bg-blue-50 border-blue-200 text-blue-900' : isMono ? 'bg-[#1C202B] border-[#323B4E] text-zinc-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
            }`}>
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold">Modo Demostración Activo</p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Puedes ingresar con cualquier credencial o seleccionar un perfil de demostración rápida a la derecha.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-75 mb-1.5">
                  Correo Electrónico Institucional / Usuario
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ej. docente@edumaster.ai"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 focus:ring-blue-500 text-slate-900' 
                        : isMono 
                        ? 'bg-[#1B202D] border-[#323B4E] focus:ring-zinc-400 text-zinc-100' 
                        : 'bg-white/5 border-white/10 focus:ring-blue-500 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-75 mb-1.5">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 focus:ring-blue-500 text-slate-900' 
                        : isMono 
                        ? 'bg-[#1B202D] border-[#323B4E] focus:ring-zinc-400 text-zinc-100' 
                        : 'bg-white/5 border-white/10 focus:ring-blue-500 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="opacity-80">Recordar sesión</span>
                </label>
                <span className="opacity-60 cursor-not-allowed">¿Olvidaste tu contraseña?</span>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-101 active:scale-99 ${
                    isMono 
                      ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' 
                      : isLight 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Ingresar como {selectedProfile.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Demo Profiles Quick Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">Perfiles de Demostración Rápida</h3>
                <p className="text-xs opacity-60">Selecciona un perfil con 1 clic para probar su rol:</p>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : isMono ? 'bg-[#1C202B] text-zinc-300 border-[#323B4E]' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                Demo Plug & Play
              </span>
            </div>

            <div className="space-y-2.5">
              {DEMO_PROFILES.map((profile) => {
                const isSelected = selectedProfile.role === profile.role;
                return (
                  <button
                    key={profile.role}
                    type="button"
                    onClick={() => handleSelectProfile(profile)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all backdrop-blur-xl ${
                      isSelected
                        ? isLight 
                          ? 'bg-blue-50/90 border-blue-400 shadow-md' 
                          : isMono 
                          ? 'bg-white/[0.14] border-white/40 shadow-xl' 
                          : 'bg-blue-600/30 border-blue-400/80 shadow-xl'
                        : isLight 
                        ? 'bg-white/70 border-white/50 hover:bg-white/90 shadow-sm' 
                        : isMono 
                        ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' 
                        : 'bg-white/[0.05] border-white/15 hover:bg-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold truncate">{profile.name}</p>
                        </div>
                        <p className="text-xs opacity-60 truncate">{profile.title}</p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 ml-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isLight ? 'bg-slate-100 text-slate-700' : isMono ? 'bg-[#293041] text-zinc-300' : 'bg-white/10 text-slate-300'
                      }`}>
                        {profile.badge}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className={`w-4 h-4 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-blue-400'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Guest Access */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onLogin('docente', 'Docente Invitado')}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isLight ? 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800' : isMono ? 'bg-[#181C26] border-[#2A3142] hover:bg-[#202534] text-zinc-300' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Acceder Directamente como Invitado</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs opacity-50 font-mono">
        EduMaster.ai Enterprise • Modo Demostración Académica
      </footer>
    </div>
  );
};
