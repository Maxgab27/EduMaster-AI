import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Download, 
  Lock, 
  Cpu, 
  RefreshCw,
  Power,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';
import { ThemeMode, AuditLogEntry, ArcoRequest } from '../../types';
import { 
  auditLogEntries as initialAuditLogs, 
  arcoRequests as initialArco, 
  mlopsTelemetry as initialTelemetry 
} from '../../data/mockData';

interface AdminGovernanceViewProps {
  theme?: ThemeMode;
}

export const AdminGovernanceView: React.FC<AdminGovernanceViewProps> = ({ theme = 'monochrome' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'audit' | 'mlops'>('privacy');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [arcoList, setArcoList] = useState<ArcoRequest[]>(initialArco);
  const [searchLog, setSearchLog] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [circuitBreakerTriggered, setCircuitBreakerTriggered] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';

  const handleToggleCircuitBreaker = () => {
    const newState = !circuitBreakerTriggered;
    setCircuitBreakerTriggered(newState);
    if (newState) {
      setNotice('⚠️ INTERRUPTOR ACTIVADO: Inferencia redirigida al baseline interpretable (LightGBM-MultiOutput). PyTorch en modo análisis de fallos.');
    } else {
      setNotice('✓ Circuito normalizado: Modelo PyTorch Multi-Task reactivado en producción.');
    }
    setTimeout(() => setNotice(null), 5000);
  };

  const handleExportArco = () => {
    setNotice('Generando expediente oficial de fiscalización para la Autoridad Nacional de Protección de Datos Personales (ANPD)...');
    setTimeout(() => {
      setNotice('Expediente firmado digitalmente y exportado en PDF estándar ISO/IEC 27001.');
      setTimeout(() => setNotice(null), 4000);
    }, 1200);
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.actor.toLowerCase().includes(searchLog.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
                          log.target.toLowerCase().includes(searchLog.toLowerCase()) ||
                          log.correlationId.toLowerCase().includes(searchLog.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Gobierno Institucional, Auditoría & Cumplimiento Legal
          </h1>
          <p className="text-xs opacity-60 mt-1 m-0">
            Ley N.° 29733 de Protección de Datos Personales (Perú), trazabilidad inmutable y telemetría de inferencia.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className={`flex p-0.5 rounded-xl border text-xs ${
          isLight ? 'bg-slate-100 border-slate-300' : isMono ? 'bg-[#202532] border-[#3B4254]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
        }`}>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'privacy'
                ? (isLight ? 'bg-white shadow text-slate-900' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Ley 29733 & ARCO
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'audit'
                ? (isLight ? 'bg-white shadow text-slate-900' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Registro de Auditoría
          </button>
          <button
            onClick={() => setActiveTab('mlops')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'mlops'
                ? (isLight ? 'bg-white shadow text-slate-900' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Telemetría MLOps
          </button>
        </div>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in ${
          circuitBreakerTriggered 
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' 
            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {circuitBreakerTriggered ? <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{notice}</span>
          </div>
        </div>
      )}

      {/* Tab 1: Privacy and ARCO Rights */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${
            isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : isMono ? 'bg-[#18231C] border-[#2A4733] text-emerald-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">
                  Cumplimiento Normativo Oficial: Ley N.° 29733 (Reglamento D.S. 003-2013-JUS)
                </span>
                <span className="text-[11px] opacity-80 block">
                  Banco de Datos Personales registrado ante la ANPD. Seudonimización obligatoria y plazo máximo de atención de 10 días hábiles.
                </span>
              </div>
            </div>

            <button
              onClick={handleExportArco}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors ${
                isLight ? 'bg-emerald-700 text-white hover:bg-emerald-800' : isMono ? 'bg-white text-zinc-950 font-black hover:bg-zinc-200' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Informe ANPD
            </button>
          </div>

          <div className={`p-6 rounded-3xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-4">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 m-0">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Bandeja de Solicitudes de Derechos ARCO
                </h2>
                <p className="text-xs opacity-60 m-0">
                  Gestión legal de solicitudes de Acceso, Rectificación, Cancelación y Oposición
                </p>
              </div>

              <span className="text-xs font-mono font-bold opacity-75">
                {arcoList.length} Solicitudes Registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : isMono ? 'border-[#2A2F3D] text-zinc-400' : 'border-white/10 text-slate-400'}`}>
                    <th className="pb-3 font-mono">Folio</th>
                    <th className="pb-3">Solicitante</th>
                    <th className="pb-3">Derecho Solicitado</th>
                    <th className="pb-3">Fecha Ingreso</th>
                    <th className="pb-3">Plazo Legal Máximo</th>
                    <th className="pb-3">Responsable Legal</th>
                    <th className="pb-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {arcoList.map((item) => (
                    <tr key={item.id} className="hover:bg-black/5 transition-colors">
                      <td className="py-3 font-mono font-bold text-emerald-400">{item.folio}</td>
                      <td className="py-3 font-semibold">{item.applicant}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          item.type === 'Cancelación' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 opacity-80">{item.submittedDate}</td>
                      <td className="py-3 font-mono opacity-80">{item.deadline}</td>
                      <td className="py-3 opacity-70">{item.legalRepresentative}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'Atendida' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Immutable Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className={`p-6 rounded-3xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
          }`}>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-inherit mb-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por actor, IP o correlación..."
                  value={searchLog}
                  onChange={(e) => setSearchLog(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-900' 
                      : isMono 
                      ? 'bg-[#1C202B] border-[#2A2F3D] text-white focus:border-[#3B4254]' 
                      : 'bg-[#06152B] border-edumaster-cardBorder text-white focus:border-edumaster-cyan'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : isMono ? 'bg-[#202532] border-[#3B4254] text-zinc-200' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-slate-200'
                  }`}
                >
                  <option value="all">Todas las Acciones</option>
                  <option value="GRADE_OVERRIDE_OFFICIAL">Modificación de Notas</option>
                  <option value="MODEL_PROMOTED_TO_PRODUCTION">Promoción de Modelo</option>
                  <option value="DATASET_EXPORT_PSEUDONYMIZED">Exportación Masiva</option>
                  <option value="AUTH_FAILED_RATE_LIMIT">Seguridad / Autenticación</option>
                </select>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : isMono ? 'border-[#2A2F3D] text-zinc-400' : 'border-white/10 text-slate-400'}`}>
                    <th className="pb-3 font-mono">Timestamp (UTC)</th>
                    <th className="pb-3">Actor & Rol</th>
                    <th className="pb-3">Acción Registrada</th>
                    <th className="pb-3">Objetivo / Entidad</th>
                    <th className="pb-3 font-mono">IP Origen</th>
                    <th className="pb-3 font-mono">Correlation ID</th>
                    <th className="pb-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-black/5 transition-colors">
                      <td className="py-3 font-mono opacity-80 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3">
                        <span className="font-bold block">{log.actor}</span>
                        <span className="text-[10px] opacity-60 block">{log.role}</span>
                      </td>
                      <td className="py-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-black/10 border border-inherit text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 opacity-90 max-w-xs truncate">{log.target}</td>
                      <td className="py-3 font-mono opacity-70">{log.ipAddress}</td>
                      <td className="py-3 font-mono text-[10px] opacity-60">{log.correlationId}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'success' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : log.status === 'flagged' 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: MLOps Telemetry & Circuit Breaker */}
      {activeTab === 'mlops' && (
        <div className="space-y-6">
          {/* Circuit Breaker Emergency Banner */}
          <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
            circuitBreakerTriggered
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
              : (isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : isMono ? 'bg-[#181C26] border-[#2A2F3D] text-zinc-200' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-white')
          }`}>
            <div className="flex items-center gap-3">
              <Power className={`w-6 h-6 ${circuitBreakerTriggered ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider m-0">
                  Interruptor de Contingencia & Fallback a Baselines (SOP 88-94)
                </h3>
                <p className="text-[11px] opacity-80 m-0">
                  {circuitBreakerTriggered 
                    ? 'CIRCUITO ABIERTO: Tráfico enrutado hacia LightGBM-MultiOutput v1.8 (Baseline Calibrado).' 
                    : 'CIRCUITO CERRADO: Modelo de Deep Learning PyTorch operando en régimen normal.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleCircuitBreaker}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                circuitBreakerTriggered
                  ? 'bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400'
                  : 'bg-amber-500 text-slate-950 font-black hover:bg-amber-400'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {circuitBreakerTriggered ? 'Restaurar Red PyTorch' : 'Forzar Fallback a Baseline'}
            </button>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
            }`}>
              <span className="text-[11px] opacity-60 block">Latencia Inferencia P95</span>
              <div className="text-xl font-black font-mono mt-1 text-emerald-400">
                {initialTelemetry.inferenceLatencyP95}
              </div>
              <span className="text-[10px] opacity-60">Objetivo SLA &lt; 50 ms</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
            }`}>
              <span className="text-[11px] opacity-60 block">Modelo Activo MLflow</span>
              <div className="text-sm font-black font-mono mt-1 truncate">
                {circuitBreakerTriggered ? 'LightGBM-Baseline' : initialTelemetry.activeModelVersion}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">{initialTelemetry.modelAccuracyPR}</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
            }`}>
              <span className="text-[11px] opacity-60 block">Colas Celery & Workers</span>
              <div className="text-xl font-black font-mono mt-1 text-blue-400">8 Workers</div>
              <span className="text-[10px] opacity-60">3 tareas en cola (Healthy)</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
            }`}>
              <span className="text-[11px] opacity-60 block">Throughput Redis Streams</span>
              <div className="text-xl font-black font-mono mt-1 text-emerald-400">4,280 ev/s</div>
              <span className="text-[10px] opacity-60">0 eventos sin procesar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
