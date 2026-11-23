import React, { useState, useEffect } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  BookOpen, 
  Map, 
  BarChart3, 
  Bot, 
  CheckSquare, 
  Award, 
  Cpu, 
  Settings, 
  ShieldCheck, 
  User, 
  Palette, 
  X,
  ArrowRight
} from 'lucide-react';
import { NavTab, UserRole, ThemeMode } from '../../types';

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onRoleChange: (role: UserRole) => void;
  onThemeChange: (theme: ThemeMode) => void;
  theme?: ThemeMode;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRoleChange,
  onThemeChange,
  theme = 'monochrome'
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const commands = [
    // Navigation
    { id: 'nav-dash', category: 'Navegación', title: 'Ir al Resumen / Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, action: () => { onNavigate('dashboard'); onClose(); } },
    { id: 'nav-courses', category: 'Navegación', title: 'Ver Catálogo de Cursos', icon: <BookOpen className="w-4 h-4" />, action: () => { onNavigate('courses'); onClose(); } },
    { id: 'nav-paths', category: 'Navegación', title: 'Rutas de Aprendizaje', icon: <Map className="w-4 h-4" />, action: () => { onNavigate('learning-paths'); onClose(); } },
    { id: 'nav-assessments', category: 'Navegación', title: 'Evaluaciones y Rúbricas', icon: <CheckSquare className="w-4 h-4" />, action: () => { onNavigate('assessments'); onClose(); } },
    { id: 'nav-tutor', category: 'Navegación', title: 'Consultar al IA Tutor', icon: <Bot className="w-4 h-4" />, action: () => { onNavigate('ai-tutor'); onClose(); } },
    { id: 'nav-certs', category: 'Navegación', title: 'Certificados & Folios QR', icon: <Award className="w-4 h-4" />, action: () => { onNavigate('certificates'); onClose(); } },
    { id: 'nav-neural', category: 'Navegación', title: 'Inspector de Redes Neuronales & PyTorch', icon: <Cpu className="w-4 h-4" />, action: () => { onNavigate('neural-inspector'); onClose(); } },
    { id: 'nav-gov', category: 'Navegación', title: 'Gobierno Legal Ley 29733 & Auditoría', icon: <ShieldCheck className="w-4 h-4" />, action: () => { onNavigate('governance'); onClose(); } },
    { id: 'nav-settings', category: 'Navegación', title: 'Configuración de la Plataforma', icon: <Settings className="w-4 h-4" />, action: () => { onNavigate('settings'); onClose(); } },
    
    // Roles
    { id: 'role-student', category: 'Cambio de Rol', title: 'Cambiar vista a Estudiante', icon: <User className="w-4 h-4 text-blue-400" />, action: () => { onRoleChange('estudiante'); onNavigate('dashboard'); onClose(); } },
    { id: 'role-teacher', category: 'Cambio de Rol', title: 'Cambiar vista a Docente / Instructor', icon: <User className="w-4 h-4 text-emerald-400" />, action: () => { onRoleChange('docente'); onNavigate('dashboard'); onClose(); } },
    { id: 'role-admin', category: 'Cambio de Rol', title: 'Cambiar vista a Administrador Principal', icon: <User className="w-4 h-4 text-amber-400" />, action: () => { onRoleChange('admin'); onNavigate('dashboard'); onClose(); } },
    { id: 'role-mle', category: 'Cambio de Rol', title: 'Cambiar vista a ML Engineer', icon: <Cpu className="w-4 h-4 text-purple-400" />, action: () => { onRoleChange('mle'); onNavigate('neural-inspector'); onClose(); } },

    // Themes
    { id: 'theme-mono', category: 'Tema Visual', title: 'Tema Oscuro Grafito (Predeterminado)', icon: <Palette className="w-4 h-4" />, action: () => { onThemeChange('monochrome'); onClose(); } },
    { id: 'theme-cyber', category: 'Tema Visual', title: 'Tema Azul Cyber Enterprise', icon: <Palette className="w-4 h-4 text-cyan-400" />, action: () => { onThemeChange('cyber'); onClose(); } },
    { id: 'theme-light', category: 'Tema Visual', title: 'Tema Claro Minimalista de Alto Contraste', icon: <Palette className="w-4 h-4 text-amber-500" />, action: () => { onThemeChange('light'); onClose(); } },
  ];

  const filtered = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : isMono ? 'bg-[#181C26] border-[#3B4254] text-white' : 'bg-[#06152B] border-edumaster-cyan/50 text-white'
      }`}>
        {/* Search Header */}
        <div className={`px-4 py-3 border-b flex items-center gap-3 ${
          isLight ? 'border-slate-200 bg-slate-50' : isMono ? 'border-[#2A2F3D] bg-[#151821]' : 'border-edumaster-cardBorder bg-[#0A1F3D]'
        }`}>
          <Search className="w-4 h-4 opacity-50 shrink-0" />
          <input
            type="text"
            placeholder="Escribe un comando o busca una sección... (ej. Estudiante, Cursos, Auditoría)"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs focus:outline-none placeholder-inherit placeholder-opacity-50"
          />
          <span className="text-[10px] font-mono opacity-50 border border-inherit px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs opacity-60">
              No se encontraron comandos para "{query}"
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  isLight 
                    ? 'hover:bg-slate-100 text-slate-800' 
                    : isMono 
                    ? 'hover:bg-[#242A38] text-zinc-200' 
                    : 'hover:bg-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="opacity-75">{item.icon}</span>
                  <div>
                    <span className="font-semibold block">{item.title}</span>
                    <span className="text-[10px] opacity-50 block">{item.category}</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
