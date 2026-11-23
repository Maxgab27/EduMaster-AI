import React, { useEffect, useMemo, useState } from 'react';
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
  const [draft, setDraft] = useState('');
  const [newThread, setNewThread] = useState({ name: '', title: '', description: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';
  const canModerate = can(role, 'governance:view') || role === 'docente' || role === 'mle';
  const canCreate = can(role, 'community:view');

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

  const filteredThreads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return threads;
    return threads.filter(thread =>
      `${thread.title} ${thread.name} ${thread.description}`.toLowerCase().includes(needle),
    );
  }, [threads, query]);

  const notify = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 4500);
  };

  const reload = () => {
    setLoading(true);
    setError(null);
    setReloadKey(key => key + 1);
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    try {
      const response = await postMessage(selectedId, { text: draft.trim(), author: actor, role });
      setMessages(prev => [...prev, response.data]);
      setDraft('');
      await writeAudit({
        action: 'community.message.posted',
        correlationId: response.meta.correlationId,
        onlyDemo: true,
        detail: { threadId: selectedId, messageId: response.data.id },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
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
        onlyDemo: true,
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

  const handleCreateThread = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newThread.name.trim() || !newThread.title.trim() || !newThread.description.trim()) return;
    try {
      const response = await createThread({ ...newThread, author: actor });
      setThreads(prev => [response.data, ...prev]);
      setSelectedId(response.data.id);
      setShowCreate(false);
      setNewThread({ name: '', title: '', description: '' });
      await writeAudit({
        action: 'community.thread.created',
        correlationId: response.meta.correlationId,
        onlyDemo: true,
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <Users2 className={`w-5 h-5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-cyan'}`} />
            Comunidad de Aprendizaje y Espacios de Debate
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Hilos, mensajes y moderación con estado persistido. Datos DEMO cuando no hay API configurada.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
              className={`px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder'}`}
            />
            <input
              aria-label="Título del hilo"
              value={newThread.title}
              onChange={event => setNewThread(prev => ({ ...prev, title: event.target.value }))}
              placeholder="Título del hilo"
              className={`px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder'}`}
            />
          </div>
          <textarea
            aria-label="Descripción del hilo"
            value={newThread.description}
            onChange={event => setNewThread(prev => ({ ...prev, description: event.target.value }))}
            placeholder="Descripción del hilo"
            rows={2}
            className={`w-full px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder'}`}
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
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder'}`}
            />
          </div>
          <div className="max-h-[420px] overflow-y-auto space-y-2">
            {filteredThreads.map(thread => (
              <button
                key={thread.id}
                onClick={() => setSelectedId(thread.id)}
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
                  {thread.members.toLocaleString('es-PE')} miembros · {thread.messageCount} mensajes
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
                  <div>
                    <h2 className="text-sm font-black m-0 flex items-center gap-2">
                      <Hash className="w-4 h-4" /> {selected.name}
                    </h2>
                    <p className={`text-[11px] m-0 mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{selected.description}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-1 rounded border shrink-0 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                    {selected.members.toLocaleString('es-PE')} miembros
                  </span>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(message => (
                  <article
                    key={message.id}
                    className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : isMono ? 'bg-[#1C202B] border-[#2A2F3D]' : 'bg-black/25 border-white/10'}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{message.author}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                          {message.role}
                        </span>
                        {message.moderated && (
                          <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> MODERADO
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{formatTime(message.createdAt)}</span>
                    </div>
                    <p className={`text-xs m-0 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{message.text}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => void handleLike(message.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'}`}
                        title="Me gusta"
                      >
                        <ThumbsUp className="w-3 h-3" /> {message.likes}
                      </button>
                      {canModerate && (
                        <>
                          <button
                            onClick={() => void handleModerate(message.id, message.hidden ? 'show' : 'hide')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'}`}
                            title={message.hidden ? 'Mostrar mensaje' : 'Ocultar mensaje'}
                          >
                            {message.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {message.hidden ? 'Mostrar' : 'Ocultar'}
                          </button>
                          <button
                            onClick={() => void handleModerate(message.id, 'flag')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}
                            title="Marcar para revisión"
                          >
                            <Flag className="w-3 h-3" /> Marcar
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
                {messages.length === 0 && (
                  <p className={`text-xs text-center py-10 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Sin mensajes visibles en este hilo.
                  </p>
                )}
              </div>

              <form
                onSubmit={handleSend}
                className={`p-3 border-t flex gap-2 ${isLight ? 'border-slate-200 bg-slate-50' : isMono ? 'border-[#2A2F3D] bg-[#1C202B]' : 'border-edumaster-cardBorder bg-[#0A1F3D]'}`}
              >
                <input
                  aria-label="Mensaje"
                  value={draft}
                  onChange={event => setDraft(event.target.value)}
                  placeholder="Escribe un mensaje..."
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-300' : isMono ? 'bg-[#12141A] border-[#2A2F3D]' : 'bg-[#06152B] border-edumaster-cardBorder'}`}
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 ${isLight ? 'bg-slate-900 text-white' : isMono ? 'bg-white text-zinc-950' : 'bg-edumaster-blue text-white'}`}
                >
                  <Send className="w-3.5 h-3.5" /> Enviar
                </button>
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
