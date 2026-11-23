# Plan de desarrollo funcional por módulo — EduMaster.ai

> Objetivo: que **cada módulo del frontend tenga comportamiento real**, primero con un adaptador DEMO persistente y luego contra la API `/api/v1`. No se trata solo de ML: incluye comunidad, tutor, certificados, evaluación, gobernanza, catálogo, analítica y operación.

---

## 0. Principios rectores

1. **Contrato primero**: todo módulo consume `{ data, meta }` con `correlationId`.
2. **DEMO funcional**: si `VITE_API_BASE_URL` está vacío, el módulo debe seguir funcionando con `localStorage` sembrado y versionado. Nunca una pantalla muerta.
3. **Una sola fuente de verdad**: el adaptador API y el adaptador DEMO devuelven exactamente el mismo tipo TypeScript.
4. **Estado, no engaño**: si algo no está implementado, se muestra `DEMO · sin conexión`, no datos falsos de producción.
5. **Auditoría transversal**: cada acción relevante escribe un evento en `/api/v1/audit/logs` (o su espejo local).
6. **Human-in-the-loop**: nota oficial, aprobación de modelos y moderación siempre requieren revisión humana.
7. **Incremental**: se termina un módulo, se validan lint/build/API y se pasa al siguiente.

---

## 1. Fundamentos transversales (hay que hacerlos antes de los módulos)

| ID | Fundamento | Qué resuelve | Estado |
|---|---|---|---|
| F1 | `src/services/apiClient.ts` unificado | `getBaseUrl`, `request<T>()`, errores normalizados, `AbortSignal`, correlation id | 🟡 parcial en `dashboardApi.ts` |
| F2 | `src/services/demoStore.ts` | localStorage versionado, seed de datos DEMO, reset controlado | ⬜ |
| F3 | `src/services/auditSink.ts` | Escribir auditoría desde cualquier módulo (API o local) | ⬜ |
| F4 | Tipos compartidos en `src/types/index.ts` | Un DTO por entidad: Course, Thread, Certificate, TutorMessage, etc. | 🟡 parcial |
| F5 | Backend `app/services/*` + routers | Servicios en memoria ya iniciados: `certificates.py`, `community.py`, `tutor.py` | 🟡 sin conectar |
| F6 | Smoke test de API | Script que llama a todos los endpoints y valida envelopes | ⬜ |

> Nota: ya existen tres servicios backend de groundwork (`certificates.py`, `community.py`, `tutor.py`) creados pero **todavía no conectados** a `main.py` ni al frontend. El plan los integra en su módulo correspondiente.

---

## 2. Roadmap de ejecución

| Fase | Módulos | Dificultad | Resultado al terminar |
|---|---|---:|---|
| 1 | Dashboard, Analytics, Certificados, Gobernanza, Neural Inspector | 🟢 | Todo lee datos reales del contrato; desaparecen cifras inventadas. |
| 2 | Comunidad, Tutor IA, Recomendaciones, Notificaciones | 🟡 | Chats y flujos con estado persistido local/API. |
| 3 | Courses, Learning Paths, Assessments/SpeedGrader, Sandbox | 🟡/🔴 | Flujos de negocio completos con estados y firma docente. |
| 4 | Settings, RBAC backend, Postgres, auditoría persistente | 🔴 | Seguridad y datos reales. |
| 5 | WebSocket/SSE, MLflow, drift, reentrenamiento gobernado | 🔴 | Operación enterprise. |

---

## 3. Plan por módulo

### M1 — Dashboard

- **Estado hoy**: KPIs, mapa, heatmap y feed reciben props del summary. Visualizador ya usa telemetría real.
- **Objetivo**: filtros por periodo/rol, refresh manual, banner de fuente y correlación visible.
- **Endpoints**: `GET /api/v1/dashboard/summary`, `GET /api/v1/analytics/progress`, `GET /api/v1/analytics/skill-mastery`.
- **Datos**: derivados de eventos DEMO + artefacto MTL.
- **Pasos**:
  1. Extraer `useDashboardData()` con loading/error/abort.
  2. Añadir selector de periodo y propagarlo a widgets.
  3. Mostrar `meta.source` y `meta.correlationId` en la cabecera.
- **Aceptación**: cambiar el periodo actualiza KPIs, mapa, heatmap y feed sin recargar.
- **Dificultad**: 🟢

### M2 — Analytics

- **Estado hoy**: vista visual con datos mock.
- **Objetivo**: series temporales y dominio por competencia calculados desde eventos.
- **Endpoints**: `GET /analytics/progress`, `GET /analytics/skill-mastery`.
- **Datos**: `active_days_14d`, `sessions_14d`, `completion_ratio`, `assessment_mean`, evidencias por competencia.
- **Pasos**:
  1. Generar series DEMO en backend con ventana de 14 días.
  2. Agregar dominio por competencia con `certifiedByDocent`.
  3. Conectar gráficas existentes a los nuevos DTO.
- **Aceptación**: los gráficos cambian con el filtro de cohorte y muestran etiqueta DEMO.
- **Dificultad**: 🟢

### M3 — Certificados

- **Estado hoy**: array hardcodeado, QR decorativo, `alert()` de descarga.
- **Objetivo**: listado real, folio único, hash SHA-256 verificable, QR scannable, descarga/impresión y auditoría.
- **Endpoints**: `GET /certificates`, `GET /certificates/verify/{folio}`, QR embebido `qrSvg` en la respuesta.
- **Datos**: `folio`, estudiante, curso, fecha, nota oficial, hash, estado.
- **Pasos**:
  1. Conectar `certificates.py` a `main.py`.
  2. `certificateApi.ts` con adaptador local.
  3. Reemplazar QR decorativo por SVG real generado con `segno`.
  4. Verificador: input de folio → resultado válido/no válido con hash.
  5. Descargar comprobante HTML/impresión; registrar auditoría.
- **Aceptación**: al verificar un folio sembrado responde `válido`; uno inventado responde `no encontrado`.
- **Dificultad**: 🟢/🟡

### M4 — Gobernanza y ARCO

- **Estado hoy**: UI de auditoría y circuit breaker con interacciones DEMO.
- **Objetivo**: every action writes audit; ARCO con estados `recibida|en_proceso|atendida|observada`.
- **Endpoints**: `GET /audit/logs?actor&action&correlation_id`, `GET/POST /arco/requests`, `POST /arco/requests/{id}/resolve`.
- **Datos**: actor, correlación, acción, detalle, timestamp.
- **Pasos**:
  1. `auditSink.ts` usado por todos los módulos.
  2. Filtros y paginación en la tabla de auditoría.
  3. State machine ARCO con plazos y responsable.
- **Aceptación**: una acción en otro módulo aparece en auditoría con el mismo `correlationId`.
- **Dificultad**: 🟡

### M5 — Neural Inspector

- **Estado hoy**: visualizador SVG con telemetría real parcial.
- **Objetivo**: mostrar arquitectura documentada, baselines vs MTL, decisión de publicación y guardrails.
- **Endpoints**: `GET /neural/status`, `GET /ml/models`, `GET /ml/training-runs/{id}`.
- **Pasos**:
  1. Mostrar tabla comparativa MTL vs baselines desde `evaluation.json`.
  2. Mostrar `publicationDecision` y λ usados.
  3. Etiquetas claras: pesos compartidos, GRU, cabezas A-D.
- **Aceptación**: no aparece ninguna métrica inventada; todo viene del artefacto.
- **Dificultad**: 🟢

### M6 — Comunidad

- **Estado hoy**: bloque inline en `App.tsx` con dos tarjetas y botones sin acción.
- **Objetivo**: hilos, mensajes, likes, moderación hide/show/flag, búsqueda y filtro por cohorte.
- **Endpoints**: `GET/POST /community/threads`, `GET/POST /community/threads/{id}/messages`, `POST /community/messages/{id}/moderate`, `POST /community/messages/{id}/like`.
- **Datos**: thread, mensaje, autor, rol, likes, moderado, oculto.
- **Pasos**:
  1. Crear `CommunityView.tsx` y reemplazar el bloque inline.
  2. Conectar `community.py` a `main.py`.
  3. `communityApi.ts` con localStorage.
  4. UI de canal + chat + acciones de moderación según rol.
- **Aceptación**: enviar un mensaje lo persiste; ocultarlo lo quita de la vista; moderación queda auditada.
- **Dificultad**: 🟡

### M7 — Tutor IA (vista + drawer flotante)

- **Estado hoy**: respuestas `setTimeout` con texto fijo; drawer dice “Conectado en vivo”.
- **Objetivo**: conversación persistida, respuestas regladas con fuentes, confianza y guardrail; historial por conversación.
- **Endpoints**: `POST /tutor/messages`, `GET /tutor/conversations/{id}`.
- **Datos**: `conversationId`, mensaje, sender, texto, fuentes, confianza, guardrail.
- **Pasos**:
  1. Conectar `tutor.py` a `main.py`.
  2. `tutorApi.ts` con adaptador local.
  3. Hook `useTutor()` compartido entre `AITutorView` y `AITutorDrawer`.
  4. Quitar “Conectado en vivo”; mostrar `DEMO · respuestas regladas`.
- **Aceptación**: preguntar por “riesgo”, “lambda” o “certificado” devuelve una respuesta distinta y trazable; se mantiene al recargar.
- **Dificultad**: 🟡

### M8 — Recomendaciones

- **Estado hoy**: aceptar/descartar local sin persistir.
- **Objetivo**: candidatos del modelo + reglas, feedback con `aceptada|descartada|completada|util|no_util`, utilidad evaluada.
- **Endpoints**: `GET /recommendations`, `POST /recommendations/{id}/feedback`.
- **Pasos**:
  1. Conectar `/neural/inference` con el catálogo de recursos.
  2. Estado por recomendación en localStorage/API.
  3. No reentrenar automáticamente con feedback sin validación.
- **Aceptación**: el feedback persiste y aparece en auditoría.
- **Dificultad**: 🟡

### M9 — Notificaciones y actividad

- **Estado hoy**: feed visual con textos DEMO.
- **Objetivo**: paginación cursor, leído/no leído, preferencias, eventual SSE.
- **Endpoints**: `GET /notifications`, `POST /notifications/{id}/read`, `GET/PUT /notification-preferences`.
- **Pasos**:
  1. Modelo de notificación con `eventId`, destinatario, estado.
  2. Reglas de autorización de destinatario.
  3. Conexión del feed del dashboard.
- **Aceptación**: marcar como leído actualiza contador y persiste.
- **Dificultad**: 🟡/🔴

### M10 — Courses

- **Estado hoy**: catálogo visual.
- **Objetivo**: listado paginado, filtros, crear/editar curso, inscripción y detalle.
- **Endpoints**: `GET/POST /courses`, `GET/PUT /courses/{id}`, `POST /courses/{id}/enroll`.
- **Pasos**:
  1. DTO Course con validación de fechas y cupos.
  2. Tabla con paginación y filtros.
  3. Formulario de creación con errores normalizados.
- **Aceptación**: crear un curso lo muestra en la lista y genera auditoría.
- **Dificultad**: 🟡

### M11 — Learning Paths

- **Estado hoy**: vista visual de rutas.
- **Objetivo**: generar ruta desde brechas de competencia + recomendaciones; marcar avance.
- **Endpoints**: `GET /learning-paths`, `POST /learning-paths/{id}/progress`.
- **Pasos**:
  1. Generador de reglas (no ML) con pasos ordenados.
  2. UI de progreso por hito.
  3. Sincronización con recomendaciones aceptadas.
- **Aceptación**: completar un paso actualiza el porcentaje de la ruta.
- **Dificultad**: 🟡/🔴

### M12 — Assessments y SpeedGrader

- **Estado hoy**: modal con rúbrica, nota asistida y firma demo.
- **Objetivo**: intentos, borrador asistido, revisión docente, nota oficial separada de la estimación IA.
- **Endpoints**: `GET /assessments`, `GET /submissions`, `POST /submissions/{id}/grade`, `POST /submissions/{id}/feedback`.
- **Reglas clave**: el modelo nunca escribe la nota oficial; el docente la firma.
- **Pasos**:
  1. Estados `pending|in_review|graded`.
  2. Comparador `estimatedAiScore` vs `officialScore`.
  3. Auditoría de firma.
- **Aceptación**: no se puede publicar nota oficial sin `signedBy`.
- **Dificultad**: 🔴

### M13 — Sandbox / Study Modal (estudiante)

- **Estado hoy**: ejecución simulada local.
- **Objetivo**: persistir intentos, mostrar feedback por rúbrica y guardrails.
- **Endpoints**: `POST /sandbox/attempts`, `GET /sandbox/attempts/{id}`.
- **Decisión**: ejecutar Python en servidor sería riesgoso en Railway Free; se mantiene simulación local con persistencia.
- **Aceptación**: el historial de intentos sobrevive al recargar y no ejecuta código real.
- **Dificultad**: 🟢/🟡

### M14 — Settings

- **Estado hoy**: tema funcional, resto visual.
- **Objetivo**: preferencias de tema, idioma, notificaciones y parámetros de demo persistidos.
- **Endpoints**: `GET/PUT /settings`, `GET/PUT /settings/preferences`.
- **Aceptación**: recargar conserva preferencias y se refleja en toda la app.
- **Dificultad**: 🟢

---

## 4. Criterios de aceptación globales

Al terminar cada módulo:

- `npm.cmd run lint` → 0 errores, 0 warnings.
- `npm.cmd run build` → OK.
- La respuesta API válida `{ data, meta }` y con `correlationId`.
- Con API desconectada, el módulo sigue funcionando en modo DEMO local.
- Ningún texto de producción falsa: sin “WS en vivo”, “Sincronizado”, “99.8%”.
- Toda acción relevante escribe auditoría.
- Si el módulo muestra una probabilidad, va acompañada de guardrail.

---

## 5. Riesgos y decisiones

| Riesgo | Decisión |
|---|---|
| Railway Free con 0.5 GB | Persistencia en memoria primero; Postgres externo después. Sin PyTorch. |
| Chat con LLM real costoso | Tutor reglado con fuentes y trazabilidad; luego se puede cambiar el proveedor detrás del mismo contrato. |
| QR / certificados “reales” | Hash verificable y QR SVG reales sobre datos DEMO; nunca emitir certificados oficiales desde el demo. |
| Feedback que entrene al modelo | Queda registrado, pero no dispara reentrenamiento automático. |
| RBAC solo frontend | Se mantiene para UX; la autoridad real llega en Fase 4. |

---

## 6. Estado y próximo paso

- **Fase 1 completada y validada**: Dashboard, Analytics, Certificados, Gobernanza y Neural Inspector leen el contrato `/api/v1` con fallback DEMO; sin métricas falsas ni etiquetas de producción.
- **Fase 2 completada y validada**: Comunidad, Tutor IA, Recomendaciones y Notificaciones funcionan con API y con store DEMO versionado; las acciones quedan en auditoría sin duplicados.
- **Fase 3 completada y validada** (`e0da0d5`): Courses, Learning Paths, Assessments/SpeedGrader y Sandbox con estados reales y firma docente obligatoria.
- **Fase 4 completada y validada** (`f172b6b`): autoridad RBAC/ABAC DEMO en backend (`X-Actor`/`X-Role`), settings institucionales y preferencias por actor, auditoría enriquecida con `role`/`status`/`tenantId`, y DDL de Supabase preparado sin RLS real. El backend sigue siendo DEMO: `auth=demo-header-rbac`, `storage=memory-demo` hasta configurar Supabase; sin OIDC/JWT.
- **Próximo paso**: **Fase 5** — alcance pendiente de definir. No activar RLS real ni etiquetas de producción sin OIDC y credenciales de Supabase.

---

**Estado del plan**: aprobado; Fases 1–4 implementadas y verificadas en navegador (`DEMO` y `API`). Autoridad backend es DEMO; sin persistencia Postgres real hasta configurar Supabase.
