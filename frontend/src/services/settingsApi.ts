import type {
  AppSettings,
  NotificationPreferences,
  SettingsPreferences,
  SettingsUpdate,
  ThemeMode,
} from '../types';
import { getDemoActor, requestWithDemo } from './apiClient';
import { readSlice, writeSlice } from './demoStore';

const SETTINGS_KEY = 'settings';
const PREFS_KEY = 'settingsPreferences';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'monochrome',
  organization: 'Universidad Tecnológica Enterprise',
  tenantId: 'org-ute-peru-2026',
  // Informativo en DEMO: nunca activa RLS real.
  rlsEnabled: false,
  retentionDays: 730,
  minorsProtection: true,
  consentOnFirstLogin: true,
  arcoPortal: true,
  updatedAt: '2026-11-22T00:00:00Z',
  updatedBy: 'sistema-demo',
};

const DEFAULT_PREFS: SettingsPreferences = {
  email: false,
  inApp: true,
  digest: 'diario',
  categories: ['evaluacion', 'mlops', 'certificados'],
};

function defaultSettings(): AppSettings {
  let theme: ThemeMode = DEFAULT_SETTINGS.theme;
  try {
    const saved = localStorage.getItem('edumaster_theme') as ThemeMode | null;
    if (saved === 'monochrome' || saved === 'cyber' || saved === 'light') {
      theme = saved;
    }
  } catch {
    // Sin localStorage se usa el tema por defecto.
  }
  return { ...DEFAULT_SETTINGS, theme };
}

export function getSettings(signal?: AbortSignal) {
  return requestWithDemo<AppSettings>(
    '/api/v1/settings',
    { signal },
    () => {
      const stored = readSlice<AppSettings | null>(SETTINGS_KEY, null);
      if (stored) return { ...defaultSettings(), ...stored, theme: stored.theme || defaultSettings().theme };
      return defaultSettings();
    },
  );
}

export function updateSettings(payload: SettingsUpdate, signal?: AbortSignal) {
  const actor = getDemoActor();
  return requestWithDemo<AppSettings>(
    '/api/v1/settings',
    { method: 'PUT', body: JSON.stringify(payload), signal },
    () => {
      const next: AppSettings = {
        ...defaultSettings(),
        ...payload,
        updatedAt: new Date().toISOString(),
        updatedBy: actor.name,
      };
      writeSlice(SETTINGS_KEY, next);
      try {
        localStorage.setItem('edumaster_theme', next.theme);
      } catch {
        // Sin localStorage el tema aplica solo en memoria durante la sesión.
      }
      return next;
    },
  );
}

export function getSettingsPreferences(signal?: AbortSignal) {
  return requestWithDemo<SettingsPreferences>(
    '/api/v1/settings/preferences',
    { signal },
    () => readSlice<SettingsPreferences>(PREFS_KEY, DEFAULT_PREFS),
  );
}

export function updateSettingsPreferences(
  payload: NotificationPreferences,
  signal?: AbortSignal,
) {
  return requestWithDemo<SettingsPreferences>(
    '/api/v1/settings/preferences',
    { method: 'PUT', body: JSON.stringify(payload), signal },
    () => {
      writeSlice(PREFS_KEY, payload);
      return payload;
    },
  );
}
