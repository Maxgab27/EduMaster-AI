import type { ApiResponse } from '../types';

/**
 * Cliente HTTP único del contrato /api/v1.
 *
 * - Con VITE_API_BASE_URL: llama a la API y exige envelope { data, meta }.
 * - Sin esa variable: los servicios usan requestWithDemo() con adaptadores locales.
 * - El correlationId se envía como header y el backend lo devuelve en meta.
 */

export const DEMO_DELAY_MS = 180;

export function getBaseUrl(): string | null {
  const raw = import.meta.env.VITE_API_BASE_URL;
  return typeof raw === 'string' && raw.trim() ? raw.trim().replace(/\/$/, '') : null;
}

/** Base del núcleo real (riesgo + SpeedGrader + auditoría). Independiente del modo DEMO global. */
export function getCoreBaseUrl(): string | null {
  const raw = import.meta.env.VITE_CORE_API_BASE_URL;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const url = new URL(raw.trim());
  // Si la página se abre desde otra IP (por ejemplo el celular en la misma
  // Wi-Fi), 127.0.0.1 ya no es la PC: se sustituye por el host de la página.
  const loopback = ['127.0.0.1', 'localhost', '::1'];
  const pageHost = typeof window !== 'undefined' ? window.location.hostname : '';
  if (loopback.includes(url.hostname) && pageHost && !loopback.includes(pageHost)) {
    url.hostname = pageHost;
  }
  return url.toString().replace(/\/$/, '');
}

export function isDemoMode(): boolean {
  return getBaseUrl() === null;
}

export function newCorrelationId(): string {
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function demoEnvelope<T>(data: T): ApiResponse<T> {
  return {
    data,
    meta: {
      source: 'demo',
      generatedAt: new Date().toISOString(),
      correlationId: newCorrelationId(),
    },
  };
}

export function delay(ms = DEMO_DELAY_MS): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface DemoActor {
  name: string;
  role: string;
}

/** Identidad DEMO persistida por App.tsx; la API la valida contra su allowlist. */
export function getDemoActor(): DemoActor {
  try {
    const raw = localStorage.getItem('edumaster_demo_user');
    if (!raw) return { name: 'demo-user', role: 'estudiante' };
    const parsed = JSON.parse(raw) as { name?: string; role?: string };
    return {
      name: parsed.name || 'demo-user',
      role: parsed.role || 'estudiante',
    };
  } catch {
    return { name: 'demo-user', role: 'estudiante' };
  }
}

function actor(): string {
  return getDemoActor().name;
}

export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
}

async function requestFrom<T>(baseUrl: string, path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { query, headers, ...init } = options;
  const url = new URL(`${baseUrl}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const correlationId = newCorrelationId();
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    'X-Correlation-ID': correlationId,
    'X-Actor': actor(),
    'X-Role': getDemoActor().role,
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  const response = await fetch(url.toString(), { ...init, headers: finalHeaders });

  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as {
        message?: string;
        detail?: string | Array<{ msg?: string }>;
      };
      const rawDetail = body.message ?? body.detail;
      if (typeof rawDetail === 'string' && rawDetail) {
        detail = `: ${rawDetail}`;
      } else if (Array.isArray(rawDetail)) {
        detail = `: ${rawDetail.map(item => item.msg).filter(Boolean).join('; ')}`;
      }
    } catch {
      detail = '';
    }
    throw new Error(`${path} devolvió HTTP ${response.status}${detail}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload || !Object.prototype.hasOwnProperty.call(payload, 'data') || !payload.meta) {
    throw new Error(`Respuesta inválida de ${path}: falta envelope { data, meta }`);
  }
  return payload;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL no está configurado');
  }
  return requestFrom<T>(baseUrl, path, options);
}

/** Llama al núcleo real por HTTP. Sin fallback silencioso: si falla, se ve el error. */
export async function requestCore<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const baseUrl = getCoreBaseUrl();
  if (!baseUrl) {
    throw new Error('VITE_CORE_API_BASE_URL no está configurado');
  }
  return requestFrom<T>(baseUrl, path, options);
}

/** Núcleo real cuando hay base configurada; adaptador DEMO local cuando no. */
export async function requestCoreWithDemo<T>(
  path: string,
  options: RequestOptions,
  demoFactory: () => T | Promise<T>,
): Promise<ApiResponse<T>> {
  if (!getCoreBaseUrl()) {
    await delay();
    return demoEnvelope(await demoFactory());
  }
  return requestCore<T>(path, options);
}

export async function requestWithDemo<T>(
  path: string,
  options: RequestOptions,
  demoFactory: () => T | Promise<T>,
): Promise<ApiResponse<T>> {
  if (!isDemoMode()) {
    return request<T>(path, options);
  }
  await delay();
  return demoEnvelope(await demoFactory());
}
