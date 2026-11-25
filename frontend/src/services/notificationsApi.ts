import type { ApiAuditLog, AppNotification, NotificationPreferences } from '../types';
import { requestWithDemo } from './apiClient';
import { readLocalAudit, readSlice, writeSlice } from './demoStore';

const NOTIFICATIONS_KEY = 'notifications';
const PREFS_KEY = 'notificationPreferences';
const READ_ALL_KEY = 'notificationReadAllAt';

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

/** Traduce eventos de auditoría en notificaciones DEMO trazables, sin duplicar las sembradas. */
function deriveAuditNotifications(stored: AppNotification[]): AppNotification[] {
  const readAllAt = readSlice<string>(READ_ALL_KEY, '');
  const storedById = new Map(stored.map(item => [item.id, item]));
  const presets: Record<string, { title: string; category: string; message: string }> = {
    'community.message.posted': { title: 'Mensaje en Comunidad', category: 'comunidad', message: 'Se publicó un mensaje DEMO en un hilo.' },
    'community.message.simulated': { title: 'Respuesta simulada', category: 'comunidad', message: 'El chat DEMO generó una respuesta etiquetada como simulada.' },
    'submissions.graded': { title: 'Entrega firmada', category: 'evaluacion', message: 'Una entrega quedó firmada en el store DEMO; no es acta oficial.' },
    'certificate.verify': { title: 'Certificado verificado', category: 'certificados', message: 'Se validó un folio sintético con hash DEMO.' },
    'analytics.export_csv': { title: 'CSV EXPORTADO', category: 'analitica', message: 'Se generó una exportación con datos sintéticos.' },
    'arco.request.resolved': { title: 'Solicitud ARCO atendida', category: 'privacidad', message: 'Una solicitud DEMO cambió a estado Atendida.' },
    'learning_path.progress_changed': { title: 'Progreso actualizado', category: 'aprendizaje', message: 'El avance se guardó en el store local.' },
  };
  return readLocalAudit()
    .filter((log: ApiAuditLog) => !log.action.startsWith('notification.'))
    .slice(0, 12)
    .map(log => {
      const preset = presets[log.action] ?? {
        title: 'Evento registrado en auditoría',
        category: 'auditoria',
        message: `Acción ${log.action} registrada por ${log.actor}.`,
      };
      const id = `ntf-audit-${log.id}`;
      const known = storedById.get(id);
      const detail = Object.entries(log.detail ?? {})
        .slice(0, 2)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
        .join(' · ');
      return {
        id,
        title: preset.title,
        message: `${preset.message}${detail ? ` ${detail}` : ''}`,
        category: preset.category,
        createdAt: log.timestamp,
        read: known?.read ?? (readAllAt !== '' && log.timestamp <= readAllAt),
        actor: log.actor,
      };
    });
}

function mergedNotifications(): AppNotification[] {
  const stored = notifications();
  const derived = deriveAuditNotifications(stored);
  return [...derived, ...stored.filter(item => !item.id.startsWith('ntf-audit-'))];
}

export function listNotifications(signal?: AbortSignal) {
  return requestWithDemo<AppNotification[]>('/api/v1/notifications', { signal }, mergedNotifications);
}

export function markNotificationRead(id: string, read: boolean, signal?: AbortSignal) {
  return requestWithDemo<AppNotification>(
    `/api/v1/notifications/${encodeURIComponent(id)}/read`,
    { method: 'POST', body: JSON.stringify({ read }), signal },
    () => {
      const stored = notifications();
      const current = stored.find(item => item.id === id) ?? deriveAuditNotifications(stored).find(item => item.id === id);
      if (!current) throw new Error('Notificación no encontrada en el store DEMO');
      const updated = { ...current, read };
      const exists = stored.some(item => item.id === id);
      writeSlice(
        NOTIFICATIONS_KEY,
        exists ? stored.map(item => (item.id === id ? updated : item)) : [updated, ...stored],
      );
      return updated;
    },
  );
}

export function markAllNotificationsRead(signal?: AbortSignal) {
  return requestWithDemo<AppNotification[]>(
    '/api/v1/notifications/read-all',
    { method: 'POST', signal },
    () => {
      const readAt = new Date().toISOString();
      const stored = notifications().map(item => ({ ...item, read: true }));
      writeSlice(NOTIFICATIONS_KEY, stored);
      writeSlice(READ_ALL_KEY, readAt);
      return mergedNotifications().map(item => ({ ...item, read: true }));
    },
  );
}

export function getNotificationPreferences(signal?: AbortSignal) {
  return requestWithDemo<NotificationPreferences>(
    '/api/v1/notification-preferences',
    { signal },
    () => readSlice<NotificationPreferences | null>(PREFS_KEY, null)
      ?? readSlice<NotificationPreferences | null>('settingsPreferences', null)
      ?? DEMO_PREFS,
  );
}

export function updateNotificationPreferences(payload: NotificationPreferences, signal?: AbortSignal) {
  return requestWithDemo<NotificationPreferences>(
    '/api/v1/notification-preferences',
    { method: 'PUT', body: JSON.stringify(payload), signal },
    () => {
      // Unifica las dos pantallas: Topbar y Configuración comparten preferencias.
      writeSlice(PREFS_KEY, payload);
      writeSlice('settingsPreferences', payload);
      return payload;
    },
  );
}
