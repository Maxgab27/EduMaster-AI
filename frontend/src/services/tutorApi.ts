import type { ApiMeta, TutorConversationData, TutorMessageData } from '../types';
import { requestWithDemo } from './apiClient';
import { readSlice, writeSlice } from './demoStore';

const CONVERSATIONS_KEY = 'tutorConversations';

const WELCOME: TutorMessageData = {
  id: 'tm-demo-welcome',
  conversationId: 'demo',
  sender: 'tutor',
  text: 'Hola. Soy el tutor DEMO de EduMaster.ai. Respondo con reglas trazables y señalo fuentes, sin inventar datos institucionales.',
  createdAt: '2026-11-22T00:00:00Z',
  confidence: null,
  sources: ['Guardrails DEMO'],
  guardrail: 'Estimación pedagógica, no sustituye al docente.',
};

interface Rule {
  text: string;
  confidence: number;
  sources: string[];
}

function matchRule(text: string): Rule {
  const value = text.toLowerCase();
  if (/riesgo|abandono|desconexi[oó]n|sancion/.test(value)) {
    return {
      text: 'La señal de riesgo de desconexión es una estimación DEMO con fines de apoyo humano. No debe usarse para sancionar; revisa active_days_14d, completion_ratio y assignment_late_rate antes de contactar al estudiante.',
      confidence: 0.86,
      sources: ['Documento §9.5', 'Guardrails del modelo'],
    };
  }
  if (/lambda|p[eé]rdida|loss|peso|λ/.test(value)) {
    return {
      text: 'La pérdida multitarea es λ₁·BCE(finalización) + λ₂·CE(dominio) + λ₃·BCE(riesgo) + λ₄·RankingLoss. En el artefacto DEMO todas las λ son 1 salvo ranking, que es 0.5. Los pesos requieren validación, no copia de otro dominio.',
      confidence: 0.91,
      sources: ['Documento §9.3', 'ml/config.json'],
    };
  }
  if (/certificado|folio|qr|nota oficial|calificaci[oó]n/.test(value)) {
    return {
      text: 'La nota oficial no la emite el modelo: el docente revisa la evidencia y firma. El certificado usa folio único y hash verificable; el QR es ilustrativo porque aún no existe endpoint público de verificación.',
      confidence: 0.93,
      sources: ['Documento §4.10', 'Política human-in-the-loop'],
    };
  }
  if (/comunidad|foro|chat|moderaci[oó]n/.test(value)) {
    return {
      text: 'Los espacios de comunidad se moderan por cohorte. Los mensajes quedan registrados y pueden ocultarse o marcarse; la retroalimentación útil se evalúa, no solo el número de clics.',
      confidence: 0.84,
      sources: ['Documento §4.11', 'Flujo de recomendaciones'],
    };
  }
  return {
    text: 'Puedo ayudarte con finalización, dominio, riesgo, recomendaciones, evaluación y gobernanza. Esta respuesta es DEMO y usa reglas trazables, no un modelo generativo externo. Menciona uno de esos temas para obtener una respuesta específica.',
    confidence: 0.72,
    sources: ['Base de conocimiento DEMO'],
  };
}

const WELCOME_IDS = new Set(['tm-demo-welcome', 'tm-local-welcome']);

/**
 * Las conversaciones guardadas antes de esta versión traen un `confidence: 0.99`
 * inventado en el saludo. Se limpia al leer para no mostrar una métrica falsa.
 */
function sanitizeWelcome(messages: TutorMessageData[]): TutorMessageData[] {
  return messages.map(message =>
    WELCOME_IDS.has(message.id) && message.confidence !== null
      ? { ...message, confidence: null }
      : message,
  );
}

function readConversations(): Record<string, TutorMessageData[]> {
  const store = readSlice<Record<string, TutorMessageData[]>>(CONVERSATIONS_KEY, {});
  return Object.fromEntries(
    Object.entries(store).map(([id, messages]) => [id, sanitizeWelcome(messages ?? [])]),
  );
}

function newId(): string {
  return `tm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getTutorConversation(conversationId: string, signal?: AbortSignal) {
  return requestWithDemo<TutorConversationData>(
    `/api/v1/tutor/conversations/${encodeURIComponent(conversationId)}`,
    { signal },
    () => ({
      conversationId,
      messages: readConversations()[conversationId] ?? [],
    }),
  );
}

export function sendTutorMessage(message: string, conversationId?: string, signal?: AbortSignal) {
  return requestWithDemo<TutorConversationData>(
    '/api/v1/tutor/messages',
    { method: 'POST', body: JSON.stringify({ message, conversationId }), signal },
    () => {
      const id = conversationId || `conv-${Date.now().toString(36)}`;
      const store = readConversations();
      const existing = store[id] ? [...store[id]] : [{ ...WELCOME, conversationId: id }];
      const now = new Date().toISOString();
      const rule = matchRule(message);
      existing.push(
        {
          id: newId(),
          conversationId: id,
          sender: 'user',
          text: message,
          createdAt: now,
          confidence: null,
          sources: [],
        },
        {
          id: newId(),
          conversationId: id,
          sender: 'tutor',
          text: rule.text,
          createdAt: new Date().toISOString(),
          confidence: rule.confidence,
          sources: rule.sources,
          guardrail: 'DEMO · respuesta reglada, no diagnóstico ni nota oficial; requiere criterio docente.',
        },
      );
      store[id] = existing;
      writeSlice(CONVERSATIONS_KEY, store);
      return { conversationId: id, messages: existing };
    },
  );
}

/** Etiqueta de fuente para mostrar honestidad en ambos componentes de tutor. */
export function tutorSourceLabel(meta: ApiMeta | null): string {
  return meta?.source === 'api' ? 'API · respuestas regladas DEMO' : 'DEMO · respuestas regladas';
}
