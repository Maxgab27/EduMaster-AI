import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  Download,
  Lock,
  RefreshCw,
  Power,
  FileCheck,
} from 'lucide-react';
import type {
  ApiAuditLog,
  ApiMeta,
  ArcoRequest,
  NeuralStatusPayload,
  ThemeMode,
  UserRole,
} from '../../types';
import { can } from '../../auth/permissions';
import { arcoRequests as initialArco } from '../../data/mockData';
import { getAuditLogs } from '../../services/auditApi';
import { getNeuralStatus } from '../../services/neuralApi';
import { writeAudit } from '../../services/auditSink';
import { readSlice, writeSlice } from '../../services/demoStore';

interface AdminGovernanceViewProps {
  theme?: ThemeMode;
  role?: UserRole;
}

function detailTarget(detail: Record<string, unknown>): string {
  const entries = Object.entries(detail ?? {});
  if (!entries.length) return '—';
  return entries
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
    .join(' · ');
}

export const AdminGovernanceView: React.FC<AdminGovernanceViewProps> = ({
  theme = 'monochrome',
  role = 'admin',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'audit' | 'mlops'>('privacy');
  const [auditLogs, setAuditLogs] = useState<ApiAuditLog[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [neural, setNeural] = useState<NeuralStatusPayload | null>(null);
  const [arcoList, setArcoList] = useState<ArcoRequest[]>(() =>
    readSlice<ArcoRequest[]>('arcoRequests', initialArco),
  );
  const [searchLog, setSearchLog] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [circuitBreakerTriggered, setCircuitBreakerTriggered] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';
  const canControlMlops = can(role, 'mlops:control');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getAuditLogs({ action: filterAction === 'all' ? undefined : filterAction, limit: 100 }, controller.signal),
      getNeuralStatus(controller.signal),
    ])
      .then(([auditResponse, neuralResponse]) => {
        setAuditLogs(auditResponse.data);
        setMeta(auditResponse.meta);
        setNeural(neuralResponse.data);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar la auditoría');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [filterAction, reloadKey]);

  const actionOptions = useMemo(
    () => Array.from(new Set(auditLogs.map(log => log.action))).sort(),
    [auditLogs],
  );

  const filteredLogs = auditLogs.filter(log => {
    const needle = searchLog.toLowerCase().trim();
    if (!needle) return true;
    return (
      log.actor.toLowerCase().includes(needle) ||
      log.action.toLowerCase().includes(needle) ||
      log.correlation_id.toLowerCase().includes(needle) ||
      detailTarget(log.detail).toLowerCase().includes(needle)
    );
  });

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 5000);
  };

  const handleToggleCircuitBreaker = async () => {
    if (!canControlMlops) return;
    const newState = !circuitBreakerTriggered;
    setCircuitBreakerTriggered(newState);
    await writeAudit({
      action: newState ? 'MODEL_CIRCUIT_BREAKER_OPEN' : 'MODEL_CIRCUIT_BREAKER_CLOSED',
      detail: {
        from: 'MTL demo',
        to: newState ? 'baseline demo' : 'MTL demo',
        role,
      },
    });
    setReloadKey(key => key + 1);
    showNotice(
      newState
        ? 'DEMO: interruptor registrado en auditoría. No redirige tráfico de inferencia real.'
        : 'DEMO: circuito normalizado. No hay modelo en producción.',
    );
  };

  const handleExportArco = () => {
    showNotice('DEMO: no se genera ningún expediente ni se envía información a la ANPD.');
  };

  const handleMarkArcoAttended = async (id: string) => {
    if (!canControlMlops) return;
    const updated = arcoList.map(item => (item.id === id ? { ...item, status: 'Atendida' as const } : item));
    setArcoList(updated);
    writeSlice('arcoRequests', updated);
    await writeAudit({ action: 'arco.request.resolved', detail: { id, status: 'Atendida' } });
    setReloadKey(key => key + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Gobierno Institucional, Auditoría & Cumplimiento Legal
          </h1>
          <p className="text-xs opacity-60 mt-1 m-0">
            Ley N.° 29733 (Perú), trazabilidad con correlation ID y telemetría del artefacto DEMO. Los registros provenientes de la API se guardan en Supabase cuando está configurada.
            {!canControlMlops && ' Modo solo lectura para este rol (RBAC demo).'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            {meta ? `${meta.source} · ${meta.correlationId.slice(0, 14)}` : 'sin fuente'}
          </span>
          <div className={`flex p-0.5 rounded-xl border text-xs ${
            isLight ? 'bg-slate-100 border-slate-300' : isMono ? 'bg-[#202532] border-[#3B4254]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
          }`}>
            {([
              ['privacy', 'Ley 29733 & ARCO'],
              ['audit', 'Registro de Auditoría'],
              ['mlops', 'Telemetría MLOps'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === key
                    ? (isLight ? 'bg-white shadow text-slate-900' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white')
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
          circuitBreakerTriggered
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {circuitBreakerTriggered ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{notice}</span>
          </div>
        </div>
      )}

      {error && (
        <div className={`p-4 rounded-2xl border text-xs ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {error}
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${
            isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : isMono ? 'bg-[#18231C] border-[#2A4733] text-emerald-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">
                  Gobierno de datos (DEMO): Ley N.° 29733 (Reglamento D.S. 003-2013-JUS)
                </span>
                <span className="text-[11px] opacity-80 block">
                  Sin registro real ante la ANPD. ARCO se persiste solo en localStorage del navegador.
                </span>
              </div>
            </div>
            <button
              onClick={handleExportArco}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                isLight ? 'bg-emerald-700 text-white hover:bg-emerald-800' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Informe ANPD
            </button>
          </div>

          <div className={`p-6 rounded-3xl border ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-4">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 m-0">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Bandeja de Solicitudes de Derechos ARCO
                </h2>
                <p className="text-xs opacity-60 m-0">Acceso, Rectificación, Cancelación y Oposición · estado local</p>
              </div>
              <span className="text-xs font-mono font-bold opacity-75">{arcoList.length} solicitudes</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : isMono ? 'border-[#2A2F3D] text-zinc-400' : 'border-white/10 text-slate-400'}`}>
                    <th className="pb-3 font-mono">Folio</th>
                    <th className="pb-3">Solicitante</th>
                    <th className="pb-3">Derecho</th>
                    <th className="pb-3">Fecha</th>
                    <th className="pb-3">Plazo</th>
                    <th className="pb-3">Responsable</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {arcoList.map(item => (
                    <tr key={item.id} className="hover:bg-black/5">
                      <td className="py-3 font-mono font-bold text-emerald-400">{item.folio}</td>
                      <td className="py-3 font-semibold">{item.applicant}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/20 text-blue-400">{item.type}</span>
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
                      <td className="py-3">
                        <button
                          onClick={() => void handleMarkArcoAttended(item.id)}
                          disabled={!canControlMlops || item.status === 'Atendida'}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Marcar atendida
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className={`p-6 rounded-3xl border ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-inherit mb-4">
              <div className="relative w-full sm:w-80">
                <Search className={`w-4 h-4 opacity-50 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : ''}`} />
                <input
                  type="text"
                  placeholder="Buscar por actor, acción, detalle o correlación..."
                  value={searchLog}
                  onChange={event => setSearchLog(event.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : isMono ? 'bg-[#1C202B] border-[#2A2F3D] text-white' : 'bg-[#06152B] border-edumaster-cardBorder text-white'
                  }`}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterAction}
                  onChange={event => {
                    setLoading(true);
                    setError(null);
                    setFilterAction(event.target.value);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : isMono ? 'bg-[#202532] border-[#3B4254] text-zinc-200' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-slate-200'
                  }`}
                >
                  <option value="all">Todas las acciones</option>
                  {actionOptions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    setReloadKey(key => key + 1);
                  }}
                  className={`p-2 rounded-xl border ${
                    isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                  title="Recargar auditoría"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : isMono ? 'border-[#2A2F3D] text-zinc-400' : 'border-white/10 text-slate-400'}`}>
                    <th className="pb-3 font-mono">Timestamp (UTC)</th>
                    <th className="pb-3">Actor</th>
                    <th className="pb-3">Acción</th>
                    <th className="pb-3">Detalle</th>
                    <th className="pb-3 font-mono">IP</th>
                    <th className="pb-3 font-mono">Correlation ID</th>
                    <th className="pb-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-black/5">
                      <td className="py-3 font-mono opacity-80 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3 font-bold">{log.actor}</td>
                      <td className="py-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-black/10 border border-inherit text-[10px] font-bold">{log.action}</span>
                      </td>
                      <td className="py-3 opacity-90 max-w-xs truncate">{detailTarget(log.detail)}</td>
                      <td className="py-3 font-mono opacity-70">—</td>
                      <td className="py-3 font-mono text-[10px] opacity-60">{log.correlation_id}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          /fail|denied|error/i.test(log.action)
                            ? 'bg-rose-500/20 text-rose-400'
                            : /flag|moderat/i.test(log.action)
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {/fail|denied|error/i.test(log.action) ? 'DENIED' : /flag|moderat/i.test(log.action) ? 'FLAGGED' : 'SUCCESS'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className={`py-8 text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        No hay eventos con estos filtros. Las acciones de certificados, analítica y gobernanza escriben aquí.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'mlops' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            circuitBreakerTriggered ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' : isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : isMono ? 'bg-[#181C26] border-[#2A2F3D] text-zinc-200' : 'bg-[#0A1F3D] border-edumaster-cardBorder text-white'
          }`}>
            <div className="flex items-center gap-3">
              <Power className={`w-6 h-6 ${circuitBreakerTriggered ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider m-0">Interruptor de contingencia (DEMO)</h3>
                <p className="text-[11px] opacity-80 m-0">
                  {circuitBreakerTriggered
                    ? 'CIRCUITO ABIERTO: acción registrada en auditoría; no redirige tráfico real.'
                    : 'CIRCUITO CERRADO: no hay modelo en producción; solo inferencia DEMO.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => void handleToggleCircuitBreaker()}
              disabled={!canControlMlops}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                circuitBreakerTriggered ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {circuitBreakerTriggered ? 'Restaurar MTL DEMO' : 'Registrar fallback a baseline'}
            </button>
          </div>

          <p className="text-[11px] opacity-60 m-0">
            Sin Prometheus, Grafana, Celery ni Redis. La telemetría viene del artefacto expuesto por `/api/v1/neural/status`.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Estado modelo', neural?.status ?? '—'],
              ['Versión modelo', neural?.model_version ?? '—'],
              ['Épocas entrenadas', String(neural?.trained_epochs ?? '—')],
              ['Pérdida train', neural?.last_train_loss != null ? neural.last_train_loss.toFixed(4) : '—'],
            ].map(([label, value]) => (
              <div key={label} className={`p-4 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : isMono ? 'bg-[#151821] border-[#2A2F3D]' : 'glass-panel border-edumaster-cardBorder'
              }`}>
                <span className="text-[11px] opacity-60 block">{label}</span>
                <div className="text-sm font-black font-mono mt-1 break-all">{value}</div>
              </div>
            ))}
          </div>

          <div className={`p-4 rounded-2xl border text-xs ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : isMono ? 'bg-[#1C1812] border-[#3D3320] text-amber-200' : 'bg-[#06152B] border-amber-500/30 text-amber-300'
          }`}>
            <strong>Decisión de publicación:</strong> {neural?.publication_decision ?? 'DEMO: pendiente de aprobación.'}
          </div>
        </div>
      )}
    </div>
  );
};
