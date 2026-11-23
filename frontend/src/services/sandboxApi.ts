import type { ApiResponse, NewSandboxAttemptInput, SandboxAttempt } from '../types';
import { requestWithDemo } from './apiClient';
import { readSlice, writeSlice } from './demoStore';

const ATTEMPTS_KEY = 'phase3SandboxAttempts';

const BLOCKED = ['eval(', 'exec(', '__import__', 'subprocess', 'os.system'];
const WARN = ['open(', 'requests.', 'socket.', 'urllib.request'];

function attempts(): SandboxAttempt[] {
  return readSlice<SandboxAttempt[]>(ATTEMPTS_KEY, []);
}

function withoutComments(code: string): string {
  return code.split('\n').map(line => {
    let quote: string | null = null;
    let cleaned = '';
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (quote) {
        cleaned += char;
        if (char === quote && line[index - 1] !== '\\') quote = null;
      } else if (char === "'" || char === '"') {
        quote = char;
        cleaned += char;
      } else if (char === '#') {
        break;
      } else {
        cleaned += char;
      }
    }
    return cleaned;
  }).join('\n');
}

function analyse(code: string): Pick<SandboxAttempt, 'output' | 'status' | 'findings' | 'guardrail'> {
  const lowered = withoutComments(code).toLowerCase();
  const findings: string[] = [];

  BLOCKED.forEach(pattern => {
    if (lowered.includes(pattern)) findings.push(`Patrón bloqueado por guardrail: ${pattern}`);
  });
  WARN.forEach(pattern => {
    if (lowered.includes(pattern)) findings.push(`Acceso externo no ejecutado: ${pattern}`);
  });
  if (lowered.includes('torch')) {
    findings.push('PyTorch no está disponible en el backend DEMO; solo análisis estático.');
  }
  if (lowered.includes('print(')) {
    findings.push('Se detectó print(); la salida mostrada es simulada, no real.');
  }
  if (!findings.length) findings.push('Sin hallazgos de riesgo en el análisis estático.');

  const blocked = findings.some(item => item.startsWith('Patrón bloqueado'));
  return {
    output: `SIMULACIÓN LOCAL · no se ejecutó código en el navegador ni en el servidor. ${findings.join(' ')}`,
    status: blocked ? 'bloqueado' : 'simulado',
    findings,
    guardrail: 'El código no se ejecuta. La nota oficial requiere firma docente; este intento no modifica calificaciones.',
  };
}

export function createAttempt(
  payload: NewSandboxAttemptInput,
): Promise<ApiResponse<SandboxAttempt>> {
  return requestWithDemo<SandboxAttempt>(
    '/api/v1/sandbox/attempts',
    { method: 'POST', body: JSON.stringify(payload) },
    () => {
      const record: SandboxAttempt = {
        id: `sa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        studentId: payload.studentId,
        code: payload.code,
        createdAt: new Date().toISOString(),
        ...analyse(payload.code),
      };
      writeSlice(ATTEMPTS_KEY, [...attempts(), record].slice(-200));
      return record;
    },
  );
}

export function getAttempt(id: string): Promise<ApiResponse<SandboxAttempt>> {
  return requestWithDemo<SandboxAttempt>(`/api/v1/sandbox/attempts/${encodeURIComponent(id)}`, {}, () => {
    const record = attempts().find(item => item.id === id);
    if (!record) throw new Error('Intento no encontrado en el store DEMO');
    return record;
  });
}

/** Historial sincronizado: API cuando está configurada, store local en DEMO. */
export function listAttemptsAsync(limit = 10): Promise<ApiResponse<SandboxAttempt[]>> {
  return requestWithDemo<SandboxAttempt[]>(
    '/api/v1/sandbox/attempts',
    { query: { limit } },
    () => attempts().slice(-limit).reverse(),
  );
}

export function listAttempts(): SandboxAttempt[] {
  return attempts();
}
