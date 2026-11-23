import type { ApiAuditLog } from '../types';

/**
 * Store DEMO versionado en localStorage.
 * Se usa para auditoría local y para estado de los módulos cuando no hay API.
 */

const STORAGE_KEY = 'edumaster_demo_v1';
const VERSION = 1;

export interface DemoState {
  version: number;
  auditLogs: ApiAuditLog[];
  [key: string]: unknown;
}

function emptyState(): DemoState {
  return { version: VERSION, auditLogs: [] };
}

export function readState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    if (parsed.version !== VERSION) return emptyState();
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export function readSlice<T>(key: string, fallback: T): T {
  const value = readState()[key];
  return value === undefined ? fallback : (value as T);
}

export function writeSlice<T>(key: string, value: T): void {
  const state = readState();
  state[key] = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage puede estar lleno o deshabilitado; el modulo sigue en memoria.
  }
}

export function readLocalAudit(): ApiAuditLog[] {
  return readSlice<ApiAuditLog[]>('auditLogs', []);
}

export function appendLocalAudit(
  input: Pick<ApiAuditLog, 'action' | 'actor' | 'detail' | 'correlation_id'>,
): ApiAuditLog {
  const entry: ApiAuditLog = {
    id: `AUD-LOCAL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    correlation_id: input.correlation_id,
    action: input.action,
    actor: input.actor,
    detail: input.detail,
    timestamp: new Date().toISOString(),
  };
  writeSlice('auditLogs', [entry, ...readLocalAudit()].slice(0, 200));
  return entry;
}

export function resetDemoStore(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin persistencia no hay nada que limpiar.
  }
}
