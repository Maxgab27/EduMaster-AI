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
  input: Pick<ApiAuditLog, 'action' | 'actor' | 'detail' | 'correlation_id' | 'role' | 'status'>,
): ApiAuditLog {
  const entry: ApiAuditLog = {
    id: `AUD-LOCAL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    correlation_id: input.correlation_id,
    action: input.action,
    actor: input.actor,
    detail: input.detail,
    timestamp: new Date().toISOString(),
    role: input.role,
    status: input.status ?? 'success',
    tenant_id: 'demo-tenant',
  };
  writeSlice('auditLogs', [entry, ...readLocalAudit()].slice(0, 200));
  return entry;
}

/** Claves auxiliares que también deben viajar en el respaldo DEMO. */
const AUX_KEYS = [
  'edumaster_demo_user',
  'edumaster_theme',
  'edumaster_tutor_conversation',
  'edumaster_student_notes',
] as const;

const ARRAY_KEYS = [
  'auditLogs',
  'phase3Submissions',
  'communityThreads',
  'communityMessages',
  'phase3Courses',
  'phase3Enrollments',
  'phase3LearningPaths',
  'phase3PathProgress',
  'notifications',
] as const;

const OBJECT_KEYS = [
  'recommendationStatus',
  'tutorConversations',
  'settings',
  'settingsPreferences',
  'notificationPreferences',
] as const;

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

interface DemoSnapshot {
  kind: 'edumaster-demo-snapshot';
  version: number;
  exportedAt: string;
  state: DemoState;
  auxiliary: Record<string, string | null>;
}

export type ImportResult =
  | { ok: true; keys: number }
  | { ok: false; error: string };

/** Genera un respaldo JSON legible con el store y las preferencias auxiliares. */
export function exportDemoData(): string {
  const auxiliary: Record<string, string | null> = {};
  for (const key of AUX_KEYS) {
    auxiliary[key] = localStorage.getItem(key);
  }
  const snapshot: DemoSnapshot = {
    kind: 'edumaster-demo-snapshot',
    version: VERSION,
    exportedAt: new Date().toISOString(),
    state: readState(),
    auxiliary,
  };
  return JSON.stringify(snapshot, null, 2);
}

/** Restaura un respaldo validado; nunca ejecuta código ni acepta claves peligrosas. */
export function importDemoData(raw: string): ImportResult {
  try {
    const parsed = JSON.parse(raw) as Partial<DemoSnapshot>;
    if (parsed.kind !== 'edumaster-demo-snapshot') {
      return { ok: false, error: 'El archivo no es un respaldo DEMO de EduMaster.ai.' };
    }
    if (parsed.version !== VERSION) {
      return { ok: false, error: `Versión no compatible: se espera ${VERSION}.` };
    }
    const state = parsed.state;
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      return { ok: false, error: 'Falta el estado DEMO dentro del archivo.' };
    }
    if (state.version !== VERSION || !Array.isArray(state.auditLogs)) {
      return { ok: false, error: 'El estado DEMO es inválido o tiene otra versión.' };
    }
    for (const key of Object.keys(state)) {
      if (FORBIDDEN_KEYS.has(key)) return { ok: false, error: `Clave no permitida: ${key}.` };
    }
    for (const key of ARRAY_KEYS) {
      if (state[key] !== undefined && !Array.isArray(state[key])) {
        return { ok: false, error: `El campo ${key} debe ser una lista.` };
      }
    }
    for (const key of OBJECT_KEYS) {
      const value = state[key];
      if (value !== undefined && (!value || typeof value !== 'object' || Array.isArray(value))) {
        return { ok: false, error: `El campo ${key} debe ser un objeto.` };
      }
    }
    if (state.notificationReadAllAt !== undefined && typeof state.notificationReadAllAt !== 'string') {
      return { ok: false, error: 'La fecha de lectura debe ser texto ISO.' };
    }

    const auxiliary = parsed.auxiliary ?? {};
    const safeState: DemoState = { ...emptyState(), ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
    for (const key of AUX_KEYS) {
      const value = auxiliary[key];
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else if (typeof value === 'string') {
        localStorage.setItem(key, value);
      }
    }
    return {
      ok: true,
      keys: Object.keys(safeState).length + AUX_KEYS.filter(key => typeof auxiliary[key] === 'string').length,
    };
  } catch {
    return { ok: false, error: 'No se pudo leer el JSON del respaldo.' };
  }
}

export function resetDemoStore(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin persistencia no hay nada que limpiar.
  }
}
