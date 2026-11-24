import { useCallback, useEffect, useState } from 'react';
import type { ApiMeta, TutorMessageData } from '../types';
import { getTutorConversation, sendTutorMessage } from '../services/tutorApi';
import { writeAudit } from '../services/auditSink';

const CONVERSATION_KEY = 'edumaster_tutor_conversation';

const LOCAL_WELCOME: TutorMessageData = {
  id: 'tm-local-welcome',
  conversationId: 'local',
  sender: 'tutor',
  text: 'Hola. Soy el tutor DEMO de EduMaster.ai. Respondo con reglas trazables y señalo fuentes, sin inventar datos institucionales.',
  createdAt: '',
  confidence: null,
  sources: ['Guardrails DEMO'],
  guardrail: 'Estimación pedagógica, no sustituye al docente.',
};

function storedConversationId(): string {
  try {
    return localStorage.getItem(CONVERSATION_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Estado del tutor compartido entre la vista completa y el drawer flotante. */
export function useTutor() {
  const [conversationId, setConversationId] = useState(storedConversationId);
  const [messages, setMessages] = useState<TutorMessageData[]>([LOCAL_WELCOME]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = storedConversationId();
    if (!id) return;
    const controller = new AbortController();
    getTutorConversation(id, controller.signal)
      .then(response => {
        setConversationId(response.data.conversationId);
        setMeta(response.meta);
        if (response.data.messages.length) setMessages(response.data.messages);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo recuperar la conversación');
      });
    return () => controller.abort();
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      const response = await sendTutorMessage(trimmed, conversationId || undefined);
      setConversationId(response.data.conversationId);
      setMessages(response.data.messages);
      setMeta(response.meta);
      try {
        localStorage.setItem(CONVERSATION_KEY, response.data.conversationId);
      } catch {
        // Sin persistencia local la conversación sigue viva en memoria.
      }
      await writeAudit({
        action: 'tutor.message.sent',
        onlyDemo: true,
        detail: { conversationId: response.data.conversationId, source: response.meta.source },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  }, [conversationId, sending]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(CONVERSATION_KEY);
    } catch {
      // Nada que limpiar.
    }
    setConversationId('');
    setMessages([LOCAL_WELCOME]);
    setError(null);
  }, []);

  return {
    conversationId,
    messages,
    meta,
    sending,
    error,
    send,
    reset,
  };
}
