import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Award, 
  PlayCircle, 
  FileCheck2, 
  Target, 
  Zap
} from 'lucide-react';
import { recentActivities } from '../../data/mockData';
import { ActivityEvent, ThemeMode } from '../../types';

interface RecentActivityFeedProps {
  onViewAll?: () => void;
  theme?: ThemeMode;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ onViewAll, theme = 'monochrome' }) => {
  const [events, setEvents] = useState<ActivityEvent[]>(recentActivities);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const getIcon = (icon: ActivityEvent['icon']) => {
    switch (icon) {
      case 'check':
        return <CheckCircle2 className="w-4 h-4 opacity-90" />;
      case 'award':
        return <Award className="w-4 h-4 opacity-90" />;
      case 'play':
        return <PlayCircle className="w-4 h-4 opacity-90" />;
      case 'book':
        return <FileCheck2 className="w-4 h-4 opacity-90" />;
      case 'target':
        return <Target className="w-4 h-4 opacity-90" />;
      default:
        return <CheckCircle2 className="w-4 h-4 opacity-90" />;
    }
  };

  const handleSimulateEvent = () => {
    const samplePool: ActivityEvent[] = [
      {
        id: `act-${Date.now()}`,
        icon: 'check',
        title: 'Evaluación de Redes Neuronales aprobada',
        description: 'Estudiante Mateo Vargas obtuvo 18.5/20',
        timeAgo: 'Justo ahora',
        user: 'Mateo V.',
        status: 'success'
      },
      {
        id: `act-${Date.now()}`,
        icon: 'award',
        title: 'Certificado de MLOps emitido',
        description: 'Folio EDU-2026-10492 validado en blockchain',
        timeAgo: 'Justo ahora',
        user: 'Elena P.',
        status: 'success'
      },
      {
        id: `act-${Date.now()}`,
        icon: 'play',
        title: 'Nueva lección de Transformers',
        description: 'Cohorte 2026-II inició mecanismos de atención',
        timeAgo: 'Justo ahora',
        user: 'Andrés G.',
        status: 'info'
      }
    ];

    const pick = samplePool[Math.floor(Math.random() * samplePool.length)];
    setEvents(prev => [pick, ...prev.slice(0, 4)]);
  };

  return (
    <div className="glass-panel flex flex-col h-full border rounded-2xl p-5 shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 opacity-80" />
          <h2 className="text-sm font-bold tracking-tight m-0">Actividad Reciente</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateEvent}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                : isMono
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 font-black shadow-sm'
                : 'text-edumaster-cyan hover:text-white bg-edumaster-blue/20 hover:bg-edumaster-blue/40 border border-edumaster-blue/50'
            }`}
            title="Simular un evento transactional Outbox en tiempo real"
          >
            <Zap className="w-3 h-3 animate-pulse" />
            <span>+ Evento</span>
          </button>
          <button 
            onClick={onViewAll}
            className="text-xs opacity-75 hover:opacity-100 flex items-center gap-0.5 font-bold transition-colors ml-1"
          >
            Ver todas →
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-2 flex-1 justify-between">
        {events.map((evt, idx) => (
          <div
            key={evt.id}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
              idx === 0 
                ? (isLight
                    ? 'border-slate-300 bg-slate-100/90 text-slate-900 shadow-sm border-l-4 border-l-slate-900 animate-in slide-in-from-top-2 duration-300'
                    : isMono 
                    ? 'border-[#3B4254] bg-[#242937] text-white shadow-md border-l-4 border-l-white animate-in slide-in-from-top-2 duration-300' 
                    : 'border-edumaster-cyan/70 bg-[#0A1F3D] shadow-glowCyan')
                : (isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    : isMono
                    ? 'border-[#2A2F3D] bg-[#1E222C] text-gray-200 hover:bg-[#262B37]'
                    : 'border-white/10 bg-black/30 hover:bg-white/5')
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 shadow-sm'
                  : isMono
                  ? 'bg-[#151821] border-[#2A2F3D] text-white shadow-inner'
                  : 'bg-black/40 border-white/10'
              }`}>
                {getIcon(evt.icon)}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold block truncate">
                  {evt.title}
                </span>
                <span className="text-[10px] opacity-60 block truncate">
                  {evt.description}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0 pl-2">
              <span className="text-[10px] opacity-60 block font-mono font-medium">
                {evt.timeAgo}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
