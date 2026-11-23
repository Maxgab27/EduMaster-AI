import type { CommunityMessage, CommunityThread } from '../types';
import { requestWithDemo } from './apiClient';
import { readSlice, writeSlice } from './demoStore';

export interface NewCommunityThread {
  name: string;
  title: string;
  description: string;
  author: string;
}

export interface NewCommunityMessage {
  text: string;
  author: string;
  role: string;
}

export type ModerationAction = 'hide' | 'show' | 'flag';

const THREADS_KEY = 'communityThreads';
const MESSAGES_KEY = 'communityMessages';

const DEMO_THREADS: CommunityThread[] = [
  {
    id: 'thr-1',
    name: 'deep-learning-transformers',
    title: 'FlashAttention-2 y costo O(N²)',
    description: 'Discusión sobre implementación de matrices de atención y reducción de complejidad cuadrática.',
    members: 1420,
    pinned: true,
    createdAt: '2026-11-01T00:00:00Z',
    lastActivity: '2026-11-22T00:00:00Z',
    messageCount: 2,
  },
  {
    id: 'thr-2',
    name: 'mlops-pipeline-fastapi',
    title: 'Versionado de modelos y rollback',
    description: 'Buenas prácticas con MLflow, contenedores ligeros y promoción controlada en staging.',
    members: 980,
    pinned: false,
    createdAt: '2026-11-02T00:00:00Z',
    lastActivity: '2026-11-21T00:00:00Z',
    messageCount: 1,
  },
];

const DEMO_MESSAGES: CommunityMessage[] = [
  {
    id: 'msg-demo-1',
    threadId: 'thr-1',
    author: 'Ana Torres',
    role: 'docente',
    text: '¿Alguien ha comparado el consumo real de FlashAttention frente a la atención estándar en secuencias largas?',
    createdAt: '2026-11-20T10:00:00Z',
    likes: 4,
    moderated: false,
    hidden: false,
  },
  {
    id: 'msg-demo-2',
    threadId: 'thr-1',
    author: 'Luis Paredes',
    role: 'estudiante',
    text: 'En nuestro experimento DEMO bajó cerca de 30% el tiempo de epoch; todavía no es evidencia oficial.',
    createdAt: '2026-11-21T10:00:00Z',
    likes: 2,
    moderated: false,
    hidden: false,
  },
  {
    id: 'msg-demo-3',
    threadId: 'thr-2',
    author: 'Marta Ruiz',
    role: 'mle',
    text: 'Recomiendo separar el registro de experimentos del artefacto final y firmar la versión promovida.',
    createdAt: '2026-11-21T12:00:00Z',
    likes: 3,
    moderated: false,
    hidden: false,
  },
];

function threads(): CommunityThread[] {
  return readSlice<CommunityThread[]>(THREADS_KEY, DEMO_THREADS);
}

function messages(): CommunityMessage[] {
  return readSlice<CommunityMessage[]>(MESSAGES_KEY, DEMO_MESSAGES);
}

function saveMessages(next: CommunityMessage[]): void {
  writeSlice(MESSAGES_KEY, next.slice(-200));
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listThreads(signal?: AbortSignal) {
  return requestWithDemo<CommunityThread[]>('/api/v1/community/threads', { signal }, () => threads());
}

export function createThread(payload: NewCommunityThread, signal?: AbortSignal) {
  return requestWithDemo<CommunityThread>(
    '/api/v1/community/threads',
    { method: 'POST', body: JSON.stringify(payload), signal },
    () => {
      const now = new Date().toISOString();
      const record: CommunityThread = {
        id: nextId('thr'),
        ...payload,
        members: 1,
        pinned: false,
        createdAt: now,
        lastActivity: now,
        messageCount: 0,
      };
      writeSlice(THREADS_KEY, [record, ...threads()]);
      saveMessages([
        ...messages(),
        {
          id: nextId('msg'),
          threadId: record.id,
          author: payload.author,
          role: 'estudiante',
          text: `Hilo creado: ${payload.title}`,
          createdAt: now,
          likes: 0,
          moderated: false,
          hidden: false,
        },
      ]);
      return record;
    },
  );
}

export function listMessages(threadId: string, signal?: AbortSignal) {
  return requestWithDemo<CommunityMessage[]>(
    `/api/v1/community/threads/${encodeURIComponent(threadId)}/messages`,
    { signal },
    () => messages().filter(item => item.threadId === threadId && !item.hidden),
  );
}

export function postMessage(threadId: string, payload: NewCommunityMessage, signal?: AbortSignal) {
  return requestWithDemo<CommunityMessage>(
    `/api/v1/community/threads/${encodeURIComponent(threadId)}/messages`,
    { method: 'POST', body: JSON.stringify(payload), signal },
    () => {
      const record: CommunityMessage = {
        id: nextId('msg'),
        threadId,
        ...payload,
        createdAt: new Date().toISOString(),
        likes: 0,
        moderated: false,
        hidden: false,
      };
      saveMessages([...messages(), record]);
      return record;
    },
  );
}

export function moderateMessage(messageId: string, action: ModerationAction, signal?: AbortSignal) {
  return requestWithDemo<CommunityMessage>(
    `/api/v1/community/messages/${encodeURIComponent(messageId)}/moderate`,
    { method: 'POST', body: JSON.stringify({ action }), signal },
    () => {
      const current = messages().find(item => item.id === messageId);
      if (!current) throw new Error('Mensaje no encontrado en el store DEMO');
      const updated: CommunityMessage = {
        ...current,
        moderated: true,
        hidden: action === 'hide' ? true : action === 'show' ? false : current.hidden,
      };
      saveMessages(messages().map(item => (item.id === messageId ? updated : item)));
      return updated;
    },
  );
}

export function likeMessage(messageId: string, signal?: AbortSignal) {
  return requestWithDemo<CommunityMessage>(
    `/api/v1/community/messages/${encodeURIComponent(messageId)}/like`,
    { method: 'POST', signal },
    () => {
      const current = messages().find(item => item.id === messageId);
      if (!current) throw new Error('Mensaje no encontrado en el store DEMO');
      const updated = { ...current, likes: current.likes + 1 };
      saveMessages(messages().map(item => (item.id === messageId ? updated : item)));
      return updated;
    },
  );
}
