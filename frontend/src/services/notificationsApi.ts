import type { AppNotification, NotificationPreferences } from '../types';
import { requestWithDemo } from './apiClient';
import { readSlice, writeSlice } from './demoStore';

const NOTIFICATIONS_KEY = 'notifications';
const PREFS_KEY = 'notificationPreferences';

const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ntf-1',
    title: 'Evaluación completada',
    message: 'Cohorte DEMO registró entregas validadas por rúbrica; no es un dato institucional.',
    category: 'evaluacion',
    createdAt: '2026-11-22T00:00:00Z',
    read: false,
    actor: 'sistema-demo',
  },
  {
    id: 'ntf-2',
    title: 'Artefacto actualizado',
    message: 'El inspector cargó evaluation.json; la decisión sigue siendo no publicar.',
    category: 'mlops',
    createdAt: '2026-11-21T00:00:00Z',
    read: false,
    actor: 'sistema-demo',
  },
  {
    id: 'ntf-3',
    title: 'Certificado verificado',
    message: 'Se validó un folio sintético con hash y QR generados en entorno DEMO.',
    category: 'certificados',
    createdAt: '2026-11-20T00:00:00Z',
    read: false,
    actor: 'sistema-demo',
  },
];

const DEMO_PREFS: NotificationPreferences = {
  email: false,
  inApp: true,
  digest: 'diario',
  categories: ['evaluacion', 'mlops', 'certificados'],
};

function notifications(): AppNotification[] {
  return readSlice<AppNotification[]>(NOTIFICATIONS_KEY, DEMO_NOTIFICATIONS);
}

export function listNotifications(signal?: AbortSignal) {
  return requestWithDemo<AppNotification[]>('/api/v1/notifications', { signal }, notifications);
}

export function markNotificationRead(id: string, read: boolean, signal?: AbortSignal) {
  return requestWithDemo<AppNotification>(
    `/api/v1/notifications/${encodeURIComponent(id)}/read`,
    { method: 'POST', body: JSON.stringify({ read }), signal },
    () => {
      const current = notifications().find(item => item.id === id);
      if (!current) throw new Error('Notificación no encontrada en el store DEMO');
      const updated = { ...current, read };
      writeSlice(NOTIFICATIONS_KEY, notifications().map(item => (item.id === id ? updated : item)));
      return updated;
    },
  );
}

export function getNotificationPreferences(signal?: AbortSignal) {
  return requestWithDemo<NotificationPreferences>(
    '/api/v1/notification-preferences',
    { signal },
    () => readSlice<NotificationPreferences>(PREFS_KEY, DEMO_PREFS),
  );
}

export function updateNotificationPreferences(payload: NotificationPreferences, signal?: AbortSignal) {
  return requestWithDemo<NotificationPreferences>(
    '/api/v1/notification-preferences',
    { method: 'PUT', body: JSON.stringify(payload), signal },
    () => {
      writeSlice(PREFS_KEY, payload);
      return payload;
    },
  );
}
