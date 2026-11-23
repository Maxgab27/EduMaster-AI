import React, { useState } from 'react';
import { BookOpen, Users, Search } from 'lucide-react';
import { ThemeMode } from '../../types';

interface CoursesViewProps {
  theme?: ThemeMode;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ theme = 'monochrome' }) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const courses = [
    {
      id: 'crs-1',
      code: 'DL-401',
      title: 'Arquitectura de Redes Neuronales & Transformers',
      instructor: 'Dr. Alejandro Morales',
      level: 'Avanzado',
      students: 4820,
      completionRate: 84,
      status: 'Publicado',
      tags: ['PyTorch', 'Transformers', 'Deep Learning']
    },
    {
      id: 'crs-2',
      code: 'ML-201',
      title: 'Machine Learning con Baselines Interpretables',
      instructor: 'Dra. Elena Silva',
      level: 'Intermedio',
      students: 6150,
      completionRate: 79,
      status: 'Publicado',
      tags: ['Scikit-Learn', 'XGBoost', 'LightGBM']
    },
    {
      id: 'crs-3',
      code: 'OPS-301',
      title: 'MLOps: Despliegue con FastAPI, MLflow y DVC',
      instructor: 'Ing. Carlos Mendoza',
      level: 'Avanzado',
      students: 3290,
      completionRate: 91,
      status: 'Publicado',
      tags: ['MLOps', 'FastAPI', 'Docker', 'DVC']
    },
    {
      id: 'crs-4',
      code: 'DAT-101',
      title: 'DataOps & Ingesta de Eventos en Tiempo Real',
      instructor: 'Mg. Patricia Ruiz',
      level: 'Básico',
      students: 5410,
      completionRate: 88,
      status: 'Publicado',
      tags: ['PostgreSQL', 'Redis', 'Outbox']
    },
    {
      id: 'crs-5',
      code: 'SEC-501',
      title: 'Privacidad de Datos y Cumplimiento Ley 29733',
      instructor: 'Abg. Roberto Castillo',
      level: 'Intermedio',
      students: 2180,
      completionRate: 95,
      status: 'Publicado',
      tags: ['Legal Tech', 'Ley 29733', 'Anonimización']
    }
  ];

  const filtered = courses.filter(c => {
    const matchesLevel = filterLevel === 'all' || c.level === filterLevel;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <BookOpen className={`w-5 h-5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-blue'}`} />
            Catálogo Oficial de Cursos y Contenidos
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {courses.length} cursos estructurados con competencias y rúbricas auditadas.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Buscar curso o código..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none transition-colors border ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-800' 
                  : isMono 
                  ? 'bg-[#181C26] border-[#3B4254] text-white placeholder-zinc-500 focus:border-white' 
                  : 'bg-[#0A1F3D] border-edumaster-cardBorder text-white placeholder-slate-400 focus:border-edumaster-cyan'
              }`}
            />
          </div>

          <div className={`flex p-0.5 rounded-xl border text-xs ${
            isLight ? 'bg-slate-100 border-slate-300' : isMono ? 'bg-[#181C26] border-[#3B4254]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
          }`}>
            {['all', 'Básico', 'Intermedio', 'Avanzado'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                  filterLevel === lvl
                    ? (isLight ? 'bg-white shadow text-slate-900 font-extrabold' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                    : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                }`}
              >
                {lvl === 'all' ? 'Todos' : lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(c => (
          <div
            key={c.id}
            className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              isLight 
                ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300 text-slate-900' 
                : isMono 
                ? 'bg-[#151821] border-[#2A2F3D] hover:border-[#3B4254] text-zinc-100' 
                : 'glass-panel border-edumaster-cardBorder hover:border-edumaster-cyan/40 text-slate-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                  isLight 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : isMono 
                    ? 'bg-[#242A38] border-[#3B4254] text-white' 
                    : 'bg-edumaster-blue/20 border-edumaster-cyan/40 text-edumaster-cyan'
                }`}>
                  {c.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  c.level === 'Avanzado' 
                    ? (isLight ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-purple-500/20 border-purple-500/40 text-purple-300') 
                    : c.level === 'Intermedio'
                    ? (isLight ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-blue-500/20 border-blue-500/40 text-blue-300')
                    : (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300')
                }`}>
                  {c.level}
                </span>
              </div>

              <h3 className="text-sm font-black mb-1.5 leading-snug tracking-tight">{c.title}</h3>
              <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Docente: {c.instructor}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {c.tags.map(t => (
                  <span key={t} className={`text-[10px] px-2 py-0.5 rounded border ${
                    isLight 
                      ? 'bg-slate-100 border-slate-200 text-slate-700' 
                      : isMono 
                      ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-300' 
                      : 'bg-[#06152B] border-edumaster-cardBorder text-slate-300'
                  }`}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className={`pt-3 border-t flex items-center justify-between text-xs ${
              isLight ? 'border-slate-100' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder/60'
            }`}>
              <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                <Users className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
                <span className="font-mono">{c.students.toLocaleString()} inscritos</span>
              </div>
              <div className="text-right">
                <span className={`font-mono font-black ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  {c.completionRate}% éxito
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
