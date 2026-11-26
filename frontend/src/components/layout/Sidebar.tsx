import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  BookOpen, 
  BarChart3, 
  Bot, 
  CheckSquare, 
  Award, 
  Users, 
  Settings, 
  BrainCircuit, 
  Sparkles,
  Cpu,
  ShieldCheck,
  X,
  LogOut
} from 'lucide-react';
import { NavTab, ThemeMode, UserRole } from '../../types';
import { canViewTab } from '../../auth/permissions';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onlineCount: number;
  role: UserRole;
  theme?: ThemeMode;
  mobileOpen?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onlineCount,
  role,
  theme = 'monochrome',
  mobileOpen = false,
  isMobile = false,
  onClose,
  onLogout,
}) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Resumen', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'learning-paths', label: 'Planes de Aprendizaje', icon: <Map className="w-4 h-4" /> },
    { id: 'courses', label: 'Cursos', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'analytics', label: 'Análisis', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'ai-tutor', label: 'IA Tutor', icon: <Bot className="w-4 h-4" /> },
    { id: 'assessments', label: 'Evaluaciones', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'certificates', label: 'Certificados', icon: <Award className="w-4 h-4" /> },
    { id: 'neural-inspector', label: 'Redes Neuronales', icon: <Cpu className="w-4 h-4" /> },
    { id: 'governance', label: 'Gobierno & Ley 29733', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'community', label: 'Comunidad', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      id="app-sidebar"
      aria-label="Navegación principal"
      role={isMobile && mobileOpen ? 'dialog' : undefined}
      aria-modal={isMobile && mobileOpen ? true : undefined}
      inert={isMobile && !mobileOpen ? true : undefined}
      className={`fixed inset-y-0 left-0 w-72 flex flex-col justify-between shrink-0 select-none h-screen overflow-y-auto z-50 transition-all duration-200 md:sticky md:top-0 md:z-40 md:w-64 ${
      mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
    } ${
      isMono ? 'bg-[#151820] border-r border-[#2A2F3D] text-gray-100' : isLight ? 'bg-white border-r border-slate-200 text-slate-900' : 'bg-[#06152B]/95 border-r border-edumaster-cardBorder text-slate-100'
    }`}>
      {/* Brand Header */}
      <div>
        <div className={`p-5 flex items-center gap-3 border-b relative ${
          isMono ? 'border-[#2A2F3D]' : isLight ? 'border-slate-200' : 'border-edumaster-cardBorder/70'
        }`}>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center md:hidden ${
              isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
          <div className={`w-10 h-10 rounded-xl p-0.5 flex items-center justify-center ${
            isMono ? 'bg-[#202532] border border-[#3B4254] shadow-sm' : isLight ? 'bg-slate-100 border border-slate-300' : 'bg-gradient-to-br from-edumaster-blue to-edumaster-violet shadow-glowBlue'
          }`}>
            <BrainCircuit className={`w-5 h-5 ${isMono ? 'text-white' : isLight ? 'text-slate-900' : 'text-edumaster-cyan'}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight">EduMaster</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                isMono ? 'bg-[#262B37] text-white border-[#3B4254]' : isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'text-edumaster-cyan bg-edumaster-cyan/15 border-edumaster-cyan/40'
              }`}>
                PRO
              </span>
            </div>
            <p className="text-[10px] opacity-60 font-mono tracking-wider m-0">ENTERPRISE MLOPS</p>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="p-3 space-y-1">
          {navItems.filter(item => canViewTab(role, item.id)).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? (isMono 
                        ? 'bg-white text-zinc-950 shadow-sm font-black translate-x-1' 
                        : isLight
                        ? 'bg-slate-900 text-white shadow-sm font-black translate-x-1'
                        : 'bg-gradient-to-r from-edumaster-blue to-edumaster-blue/80 text-white shadow-glowBlue border border-edumaster-cyan/50 translate-x-1')
                    : (isMono
                        ? 'text-gray-400 hover:text-white hover:bg-[#202532]'
                        : isLight
                        ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-[#0D2B52]/70')
                }`}
              >
                <span className={`transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? (isMono ? 'text-zinc-950' : 'text-white') : ''
                }`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full ${isMono ? 'bg-zinc-950' : 'bg-white'} shadow-sm`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Widgets: Precisión & Alumnos en Línea */}
      <div className={`p-4 space-y-3 border-t ${
        isMono ? 'border-[#2A2F3D] bg-[#161821]' : isLight ? 'border-slate-200 bg-slate-50' : 'border-edumaster-cardBorder/70 bg-[#0A1F3D]/50'
      }`}>
        {/* Precision Circular Gauge */}
        <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
          isMono ? 'bg-[#1C202B] border-[#2A2F3D] shadow-sm' : isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1F3D] border-edumaster-cardBorder shadow-panel'
        }`}>
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isMono ? "#2E3343" : isLight ? "#e2e8f0" : "#06152B"}
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isMono ? "#FFFFFF" : isLight ? "#0F172A" : "#20C8F5"}
                strokeWidth="3.5"
                strokeDasharray="91.4, 100"
              />
            </svg>
            <Sparkles className="w-4 h-4 opacity-80 absolute" />
          </div>

          <div>
            <span className="text-[10px] opacity-60 font-medium block leading-none">PR-AUC (demo)</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-base font-black font-mono tabular-numbers">0.914</span>
            </div>
            <span className="text-[9px] opacity-50 block">métrica simulada</span>
          </div>
        </div>

        {/* Online Students Card */}
        <div className={`p-3 rounded-2xl border ${
          isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold">Nuestros Alumnos</span>
            <span className="flex items-center gap-1 text-[10px] font-bold opacity-75">
              <span className={`w-1.5 h-1.5 rounded-full ${isMono ? 'bg-white' : 'bg-emerald-400'} animate-ping`} />
              En línea
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2.5 overflow-hidden">
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-800 object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                alt="Alumno"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-800 object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                alt="Alumno"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-800 object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80"
                alt="Alumno"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-800 object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80"
                alt="Alumno"
              />
            </div>
            <span className="text-[11px] font-extrabold font-mono tabular-numbers">
              +{onlineCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Portal Publico / Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              isMono 
                ? 'bg-[#181C26] border-[#2A3142] text-zinc-400 hover:text-zinc-100 hover:bg-[#202534]' 
                : isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Cerrar sesión y volver al portal público"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Portal / Cerrar Sesión</span>
          </button>
        )}
      </div>
    </aside>
  );
};
