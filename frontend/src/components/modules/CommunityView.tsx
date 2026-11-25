import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Users2,
  Search,
  Send,
  ThumbsUp,
  EyeOff,
  Eye,
  Flag,
  Plus,
  RefreshCw,
  ShieldCheck,
  Hash,
  CornerUpLeft,
  Pencil,
  Trash2,
  Check,
  X,
  Bot,
} from 'lucide-react';
import type {
  ApiMeta,
  CommunityMessage,
  CommunityThread,
  ThemeMode,
  UserRole,
} from '../../types';
import { can } from '../../auth/permissions';
import {
  createThread,
  deleteMessage,
  DEMO_REPLY_AUTHORS,
  DEMO_REPLIES,
  editMessage,
  likeMessage,
  listMessages,
  listThreads,
  moderateMessage,
  postMessage,
  type ModerationAction,
} from '../../services/communityApi';
import { writeAudit } from '../../services/auditSink';

interface CommunityViewProps {
  theme?: ThemeMode;
  role?: UserRole;
  actor?: string;
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

function relativeTime(value: string): string {
  const date = new Date(value);
  const delta = Date.now() - date.getTime();
  if (!Number.isFinite(delta)) return formatTime(value);
  if (delta < 60_000) return 'ahora';
  if (delta < 3_600_000) return `hace ${Math.floor(delta / 60_000)} min`;
  if (delta < 86_400_000) return `hace ${Math.floor(delta / 3_600_000)} h`;
  if (delta < 604_800_000) return `hace ${Math.floor(delta / 86_400_000)} d`;
  return formatTime(value);
}

function dayLabel(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (sameDay(date, today)) return 'Hoy';
  if (sameDay(date, yesterday)) return 'Ayer';
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || '?';
}

function avatarClass(role: string, isLight: boolean, isMono: boolean): string {
  if (role === 'docente') return isLight ? 'bg-blue-100 text-blue-700' : isMono ? 'bg-zinc-200 text-zinc-900' : 'bg-blue-500/20 text-blue-300';
  if (role === 'mle') return isLight ? 'bg-amber-100 text-amber-700' : isMono ? 'bg-zinc-300 text-zinc-900' : 'bg-amber-500/20 text-amber-300';
  if (role === 'admin' || role === 'coordinador') return isLight ? 'bg-violet-100 text-violet-700' : isMono ? 'bg-zinc-400 text-zinc-950' : 'bg-violet-500/20 text-violet-300';
  return isLight ? 'bg-emerald-100 text-emerald-700' : isMono ? 'bg-zinc-700 text-zinc-100' : 'bg-emerald-500/20 text-emerald-300';
}

function badgeClass(role: string, isLight: boolean): string {
  const base = 'text-[9px] font-mono px-1.5 py-0.5 rounded border';
  if (role === 'docente') return `${base} ${isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'}`;
  if (role === 'mle') return `${base} ${isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`;
  return `${base} ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'}`;
}

/** Participantes disponibles para simular una conversación dentro del chat DEMO. */
const DEMO_CHAT_USERS: Array<{ name: string; role: UserRole }> = [
  { name: 'Dra. López', role: 'admin' },
  { name: 'Dr. Alejandro Morales', role: 'docente' },
  { name: 'Ana Torres', role: 'docente' },
  { name: 'Sofia Ramírez Vargas', role: 'estudiante' },
  { name: 'Luis Paredes', role: 'estudiante' },
  { name: 'Ing. Carlos Mendoza', role: 'mle' },
  { name: 'Marta Ruiz', role: 'mle' },
];

export const CommunityView: React.FC<CommunityViewProps> = ({
  theme = 'monochrome',
  role = 'estudiante',
  actor = 'demo-user',
}) => {
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [query, setQuery] = useState('');
  const [messageQuery, setMessageQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [newThread, setNewThread] = useState({ name: '', title: '', description: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [replyTo, setReplyTo] = useState<CommunityMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [autoReply, setAutoReply] = useState(true);
  const [typing, setTyping] = useState(false);
  const [chatUser, setChatUser] = useState<{ name: string; role: UserRole } | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const replyTimer = useRef<number | null>(null);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';
  const activeActor = chatUser?.name ?? actor;
  const activeRole = chatUser?.role ?? role;
  const canModerate = can(activeRole, 'governance:view') || activeRole === 'docente' || activeRole === 'mle';
  const canCreate = can(activeRole, 'community:view');

  useEffect(() => {
    const controller = new AbortController();
    listThreads(controller.signal)
      .then(response => {
        setThreads(response.data);
        setMeta(response.meta);
        setSelectedId(current => current ?? response.data[0]?.id ?? null);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar la comunidad');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    listMessages(selectedId, controller.signal)
      .then(response => setMessages(response.data))
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los mensajes');
      });
    return () => controller.abort();
  }, [selectedId, reloadKey]);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [messages, selectedId]);

  useEffect(() => () => {
    if (replyTimer.current !== null) window.clearTimeout(replyTimer.current);
  }, []);

  const filteredThreads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return threads;
    return threads.filter(thread =>
      `${thread.title} ${thread.name} ${thread.description}`.toLowerCase().includes(needle),
    );
  }, [threads, query]);

  const filteredMessages = useMemo(() => {
    const needle = messageQuery.trim().toLowerCase();
    if (!needle) return messages;
    return messages.filter(item =>
      `${item.author} ${item.text}`.toLowerCase().includes(needle),
    );
  }, [messages, messageQuery]);

  const notify = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 4500);
  };

  const reload = () => {
    setLoading(true);
    setError(null);
    setReloadKey(key => key + 1);
  };

  const selectThread = (threadId: string) => {
    setReplyTo(null);
    setEditingId(null);
    setMessageQuery('');
    setTyping(false);
    setSelectedId(threadId);
  };

  const scheduleDemoReply = (threadId: string, toMessage: CommunityMessage) => {
    if (replyTimer.current !== null) window.clearTimeout(replyTimer.current);
    setTyping(true);
    replyTimer.current = window.setTimeout(async () => {
      replyTimer.current = null;
      const author = DEMO_REPLY_AUTHORS[Math.floor(Math.random() * DEMO_REPLY_AUTHORS.length)];
      const text = DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)];
      try {
        const response = await postMessage(threadId, {
          text,
          author,
          role: author === 'Ana Torres' ? 'docente' : author === 'Marta Ruiz' ? 'mle' : 'estudiante',
          simulated: true,
          replyToId: toMessage.id,
          replyToAuthor: toMessage.author,
          replyToText: toMessage.text.slice(0, 140),
        });
        setMessages(prev => [...prev, response.data]);
        await writeAudit({
          action: 'community.message.simulated',
          correlationId: response.meta.correlationId,
          detail: { threadId, messageId: response.data.id, author },
        });
      } catch {
        // La respuesta simulada es decorativa: si falla, no rompe el envío real del usuario.
      } finally {
        setTyping(false);
      }
    }, 1400);
  };

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    const threadId = selectedId;
    if (!threadId || !text || sending) return;
    setSending(true);
    try {
      const response = await postMessage(threadId, {
        text,
        author: activeActor,
        role: activeRole,
        ...(replyTo
          ? {
              replyToId: replyTo.id,
              replyToAuthor: replyTo.author,
              replyToText: replyTo.text.slice(0, 140),
            }
          : {}),
      });
      setMessages(prev => [...prev, response.data]);
      setDraft('');
      setReplyTo(null);
      await writeAudit({
        action: 'community.message.posted',
        correlationId: response.meta.correlationId,
        detail: { threadId, messageId: response.data.id },
      });
      if (autoReply) scheduleDemoReply(threadId, response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleDraftKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleModerate = async (messageId: string, action: ModerationAction) => {
    try {
      const response = await moderateMessage(messageId, action);
      if (action === 'show') {
        setMessages(prev => [...prev, response.data].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      } else {
        setMessages(prev =>
          prev.map(item => (item.id === messageId ? response.data : item)).filter(item => !item.hidden),
        );
      }
      await writeAudit({
        action: 'community.message.moderated',
        correlationId: response.meta.correlationId,
        detail: { messageId, action },
      });
      notify(`Moderación ${action} registrada en auditoría.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo moderar el mensaje');
    }
  };

  const handleLike = async (messageId: string) => {
    try {
      const response = await likeMessage(messageId);
      setMessages(prev => prev.map(item => (item.id === messageId ? response.data : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el like');
    }
  };

  const handleSaveEdit = async (messageId: string) => {
    const text = editingText.trim();
    if (!text) return;
    try {
      const response = await editMessage(messageId, text);
      setMessages(prev => prev.map(item => (item.id === messageId ? response.data : item)));
      setEditingId(null);
      await writeAudit({
        action: 'community.message.edited',
        correlationId: response.meta.correlationId,
        detail: { messageId },
      });
      notify('Mensaje editado en el store DEMO.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo editar el mensaje');
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      const response = await deleteMessage(messageId);
      setMessages(prev => prev.filter(item => item.id !== messageId));
      if (replyTo?.id === messageId) setReplyTo(null);
      await writeAudit({
        action: 'community.message.deleted',
        correlationId: response.meta.correlationId,
        detail: { messageId },
      });
      notify('Mensaje eliminado del store DEMO.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el mensaje');
    }
  };

  const handleCreateThread = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newThread.name.trim() || !newThread.title.trim() || !newThread.description.trim()) return;
    try {
      const response = await createThread({ ...newThread, author: activeActor });
      setThreads(prev => [response.data, ...prev]);
      selectThread(response.data.id);
      setShowCreate(false);
      setNewThread({ name: '', title: '', description: '' });
      await writeAudit({
        action: 'community.thread.created',
        correlationId: response.meta.correlationId,
        detail: { threadId: response.data.id },
      });
      notify('Hilo creado y registrado en auditoría.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el hilo');
    }
  };

  const selected = threads.find(thread => thread.id === selectedId) ?? null;

  const cardClass = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
    : isMono
    ? 'bg-[#151821] border-[#2A2F3D] text-zinc-100'
    : 'glass-panel border-edumaster-cardBorder text-slate-100';
  const subtleClass = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-700'
    : isMono
    ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-200'
    : 'bg-[#06152B] border-edumaster-cardBorder text-slate-200';
  const actionClass = `px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${subtleClass}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <Users2 className={`w-5 h-5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
            Comunidad de Aprendizaje y Espacios de Debate
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Chat DEMO · mensajes y respuestas simuladas dentro del navegador, sin servidor ni notificaciones reales.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
            chatUser
              ? isLight ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`} title="Usuario que escribe en este chat; no cambia tu rol global">
            {chatUser ? 'SIMULANDO' : 'ACTUAL'}: {activeActor} · {activeRole}
          </span>
          <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            {meta ? `${meta.source} · ${meta.correlationId.slice(0, 14)}` : 'sin fuente'}
          </span>
          <button
            onClick={reload}
            className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'}`}
            title="Recargar comunidad"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canCreate && (
            <button
              onClick={() => setShowCreate(value => !value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                isLight ? 'bg-slate-900 text-white' : isMono ? 'bg-white text-zinc-950 font-black' : 'bg-edumaster-blue text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo hilo
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className={`p-3 rounded-xl border text-xs ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
          {notice}
        </div>
      )}
      {error && (
        <div className={`p-3 rounded-xl border text-xs ${isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          {error}
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreateThread} className={`p-4 rounded-2xl border space-y-3 ${cardClass}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              aria-label="Identificador del hilo"
              value={newThread.name}
              onChange={event => setNewThread(prev => ({ ...prev, name: event.target.value }))}
              placeholder="identificador-del-hilo"
              className={`px-3 py-2 rounded-xl border text-xs ${subtleClass}`}
            />
            <input
              aria-label="Título del hilo"
              value={newThread.title}
              onChange={event => setNewThread(prev => ({ ...prev, title: event.target.value }))}
              placeholder="Título del hilo"
              className={`px-3 py-2 rounded-xl border text-xs ${subtleClass}`}
            />
          </div>
          <textarea
            aria-label="Descripción del hilo"
            value={newThread.description}
            onChange={event => setNewThread(prev => ({ ...prev, description: event.target.value }))}
            placeholder="Descripción del hilo"
            rows={2}
            className={`w-full px-3 py-2 rounded-xl border text-xs ${subtleClass}`}
          />
          <button type="submit" className={`px-4 py-2 rounded-xl text-xs font-bold ${isLight ? 'bg-slate-900 text-white' : isMono ? 'bg-white text-zinc-950' : 'bg-edumaster-blue text-white'}`}>
            Crear hilo
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <aside className={`rounded-2xl border p-4 space-y-3 ${cardClass}`}>
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              aria-label="Buscar hilos"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar hilos..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs ${subtleClass}`}
            />
          </div>
          <div className="max-h-[420px] overflow-y-auto space-y-2">
            {filteredThreads.map(thread => (
              <button
                key={thread.id}
                onClick={() => selectThread(thread.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  thread.id === selectedId
                    ? isLight ? 'bg-blue-50 border-blue-300' : 'bg-white/10 border-white/30'
                    : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  <Hash className="w-3 h-3" />
                  <span className="truncate">{thread.name}</span>
                  {thread.pinned && <span className="text-[9px] px-1.5 rounded bg-amber-500/20 text-amber-400">FIJADO</span>}
                </div>
                <p className={`text-xs font-semibold mt-1 m-0 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{thread.title}</p>
                <p className={`text-[10px] mt-1 m-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {thread.members.toLocaleString('es-PE')} miembros · {thread.messageCount} mensajes · {relativeTime(thread.lastActivity)}
                </p>
              </button>
            ))}
            {!loading && filteredThreads.length === 0 && (
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No hay hilos que coincidan con la búsqueda.</p>
            )}
          </div>
        </aside>

        <section className={`lg:col-span-2 rounded-2xl border flex flex-col h-[560px] overflow-hidden ${cardClass}`}>
          {selected ? (
            <>
              <header className={`p-4 border-b ${isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-black m-0 flex items-center gap-2">
                      <Hash className="w-4 h-4" /> {selected.name}
                    </h2>
                    <p className={`text-[11px] m-0 mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{selected.description}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-1 rounded border shrink-0 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                  }`}>
                    {selected.members.toLocaleString('es-PE')} miembros
                  </span>
                </div>
              </header>

              <div className={`px-4 pt-3 border-b ${isLight ? 'border-slate-200' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder'}`}>
                <div className="relative">
                  <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    aria-label="Buscar mensajes del hilo"
                    value={messageQuery}
                    onChange={event => setMessageQuery(event.target.value)}
                    placeholder="Buscar mensajes en este hilo..."
                    className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-[11px] ${subtleClass}`}
                  />
                </div>
              </div>

              <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredMessages.map((message, index) => {
                  const label = dayLabel(message.createdAt);
                  const previous = index > 0 ? dayLabel(filteredMessages[index - 1].createdAt) : null;
                  const isOwn = message.author === activeActor;
                  const quoted = message.replyToId
                    ? messages.find(item => item.id === message.replyToId)
                    : null;
                  return (
                    <React.Fragment key={message.id}>
                      {label !== previous && (
                        <div className="flex items-center gap-2 py-1">
                          <span className={`h-px flex-1 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                          <span className={`text-[9px] font-mono uppercase ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                          <span className={`h-px flex-1 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                        </div>
                      )}
                      <article className={`p-3 rounded-xl border ${isOwn
                        ? isLight ? 'bg-blue-50 border-blue-200' : 'bg-edumaster-blue/10 border-edumaster-blue/30'
                        : isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-black/25 border-white/10'
                      }`}>
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 shrink-0 rounded-full grid place-items-center text-[11px] font-black ${avatarClass(message.role, isLight, isMono)}`}>
                            {initials(message.author)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold">{message.author}</span>
                              <span className={badgeClass(message.role, isLight)}>{message.role}</span>
                              {message.simulated && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                                  DEMO · SIMULADO
                                </span>
                              )}
                              {message.edited && <span className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>editado</span>}
                              {message.moderated && (
                                <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> MODERADO
                                </span>
                              )}
                              <span
                                className={`ml-auto text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                                title={formatTime(message.createdAt)}
                              >
                                {relativeTime(message.createdAt)}
                              </span>
                            </div>

                            {(quoted || message.replyToText) && (
                              <div className={`mt-2 pl-2 border-l-2 ${isLight ? 'border-slate-300' : 'border-white/20'}`}>
                                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                  ↳ {message.replyToAuthor ?? quoted?.author}: {(message.replyToText ?? quoted?.text ?? '').slice(0, 140)}
                                </span>
                              </div>
                            )}

                            {editingId === message.id ? (
                              <div className="mt-2 space-y-2">
                                <textarea
                                  aria-label="Editar mensaje"
                                  value={editingText}
                                  onChange={event => setEditingText(event.target.value)}
                                  rows={2}
                                  className={`w-full px-3 py-2 rounded-xl border text-xs ${subtleClass}`}
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => void handleSaveEdit(message.id)} className={actionClass}>
                                    <Check className="w-3 h-3" /> Guardar
                                  </button>
                                  <button onClick={() => setEditingId(null)} className={actionClass}>
                                    <X className="w-3 h-3" /> Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className={`text-xs m-0 leading-relaxed whitespace-pre-wrap break-words ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                                {message.text}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <button onClick={() => void handleLike(message.id)} className={actionClass} title="Me gusta">
                                <ThumbsUp className="w-3 h-3" /> {message.likes}
                              </button>
                              <button
                                onClick={() => { setReplyTo(message); setEditingId(null); }}
                                className={actionClass}
                                title="Responder"
                              >
                                <CornerUpLeft className="w-3 h-3" /> Responder
                              </button>
                              {isOwn && (
                                <>
                                  <button
                                    onClick={() => { setEditingId(message.id); setEditingText(message.text); setReplyTo(null); }}
                                    className={actionClass}
                                    title="Editar mensaje"
                                  >
                                    <Pencil className="w-3 h-3" /> Editar
                                  </button>
                                  <button
                                    onClick={() => void handleDelete(message.id)}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 bg-rose-500/10 border-rose-500/30 text-rose-300"
                                    title="Eliminar mensaje"
                                  >
                                    <Trash2 className="w-3 h-3" /> Borrar
                                  </button>
                                </>
                              )}
                              {canModerate && (
                                <>
                                  <button
                                    onClick={() => void handleModerate(message.id, message.hidden ? 'show' : 'hide')}
                                    className={actionClass}
                                    title={message.hidden ? 'Mostrar mensaje' : 'Ocultar mensaje'}
                                  >
                                    {message.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    {message.hidden ? 'Mostrar' : 'Ocultar'}
                                  </button>
                                  <button
                                    onClick={() => void handleModerate(message.id, 'flag')}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300"
                                    title="Marcar para revisión"
                                  >
                                    <Flag className="w-3 h-3" /> Marcar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    </React.Fragment>
                  );
                })}
                {filteredMessages.length === 0 && (
                  <p className={`text-xs text-center py-10 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {messageQuery ? 'Ningún mensaje coincide con la búsqueda.' : 'Sin mensajes visibles en este hilo.'}
                  </p>
                )}
                {typing && (
                  <div className={`flex items-center gap-2 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Bot className="w-3.5 h-3.5 animate-pulse" /> Simulando respuesta DEMO…
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSend}
                className={`p-3 border-t ${isLight ? 'border-slate-200 bg-slate-50' : isMono ? 'border-[#2A2F3D] bg-[#1C202B]' : 'border-edumaster-cardBorder bg-[#0A1F3D]'}`}
              >
                {replyTo && (
                  <div className={`mb-2 p-2 rounded-lg border text-[10px] flex items-start gap-2 ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                    <CornerUpLeft className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="min-w-0 truncate">Respondiendo a <b>{replyTo.author}</b>: {replyTo.text.slice(0, 90)}</span>
                    <button type="button" onClick={() => setReplyTo(null)} className="ml-auto shrink-0" aria-label="Cancelar respuesta">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <label className={`text-[10px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`} htmlFor="community-chat-user">
                    Escribir como
                  </label>
                  <select
                    id="community-chat-user"
                    aria-label="Usuario DEMO activo"
                    value={activeActor}
                    onChange={event => {
                      const found = DEMO_CHAT_USERS.find(item => item.name === event.target.value);
                      setChatUser(found ?? null);
                    }}
                    className={`px-2 py-1 rounded-lg border text-[10px] ${isLight ? 'bg-white border-slate-300 text-slate-700' : isMono ? 'bg-[#12141A] border-[#2A2F3D] text-zinc-200' : 'bg-[#06152B] border-edumaster-cardBorder text-slate-200'}`}
                  >
                    {DEMO_CHAT_USERS.map(item => (
                      <option key={item.name} value={item.name}>{item.name} · {item.role}</option>
                    ))}
                    {!DEMO_CHAT_USERS.some(item => item.name === activeActor) && (
                      <option value={activeActor}>{activeActor} · {activeRole} (rol global)</option>
                    )}
                  </select>
                  {chatUser && (
                    <button
                      type="button"
                      onClick={() => setChatUser(null)}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'}`}
                      title="Volver al usuario del rol global"
                    >
                      Usar mi rol global
                    </button>
                  )}
                  <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    Cambia solo el autor dentro del chat; no es autenticación.
                  </span>
                </div>
                <div className="flex gap-2 items-end">
                  <textarea
                    aria-label="Mensaje"
                    value={draft}
                    onChange={event => setDraft(event.target.value)}
                    onKeyDown={handleDraftKeyDown}
                    placeholder="Escribe un mensaje… (Enter envía, Shift+Enter salto)"
                    rows={2}
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs resize-none ${isLight ? 'bg-white border-slate-300' : isMono ? 'bg-[#12141A] border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder'}`}
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 ${
                      isLight ? 'bg-slate-900 text-white' : isMono ? 'bg-white text-zinc-950' : 'bg-edumaster-blue text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" /> {sending ? '…' : 'Enviar'}
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <label className={`flex items-center gap-1.5 text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <input
                      type="checkbox"
                      checked={autoReply}
                      onChange={event => setAutoReply(event.target.checked)}
                    />
                    Respuestas DEMO automáticas
                  </label>
                  <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    Los mensajes quedan solo en este navegador.
                  </span>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-xs opacity-60">Selecciona un hilo para ver la conversación.</div>
          )}
        </section>
      </div>
    </div>
  );
};
