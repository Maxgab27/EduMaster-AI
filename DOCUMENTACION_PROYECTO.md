# EduMaster.ai — Documentación completa del proyecto

> Estado: Fases 1, 2, 3 y 4 completadas, validadas y pusheadas. Fase 5 planificada, pendiente de credenciales.
> Última actualización: 2026-11-23.

---

## 1. Resumen ejecutivo

EduMaster.ai es una plataforma empresarial de aprendizaje con un frontend React/Vite y una API REST FastAPI bajo el contrato versionado `/api/v1`. El objetivo del trabajo fue dar **funcionalidad real** a todos los módulos del frontend, primero con un adaptador DEMO persistente en `localStorage` y luego contra la API, sin depender de infraestructura pesada.

Se completaron cuatro fases:

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Dashboard, Analytics, Certificados, Gobernanza y Neural Inspector conectados al contrato `/api/v1` | Completada y validada |
| 2 | Comunidad, Tutor IA, Recomendaciones y Notificaciones con API + store DEMO | Completada y validada |
| 3 | Cursos, Rutas, Evaluaciones/SpeedGrader y Sandbox con firma docente | Completada y validada |
| 4 | Autoridad RBAC/ABAC en backend, settings institucionales, preferencias por actor y auditoría enriquecida | Completada y validada |
| 5 | Supabase real + OIDC (Supabase Auth), autoridad en la API, base limpia | Planificada; requiere credenciales |

El backend sigue siendo **DEMO** hasta que se configuren Supabase y OIDC: sin autenticación real, sin persistencia Postgres y con la decisión oficial del artefacto MTL conservada como `DEMO: no publicar`.

---

## 2. Principios rectores

1. **Contrato primero**: toda respuesta usa el envelope `{ data, meta }` con `correlationId`.
2. **DEMO funcional**: sin `VITE_API_BASE_URL`, los módulos siguen funcionando con `localStorage` sembrado y versionado (`edumaster_demo_v1`).
3. **Una sola fuente de verdad**: el adaptador API y el adaptador DEMO devuelven el mismo tipo TypeScript.
4. **Estado, no engaño**: si algo no está implementado se muestra `DEMO · sin conexión`; nunca datos falsos de producción.
5. **Auditoría transversal**: cada acción relevante escribe un evento en `/api/v1/audit/logs` o su espejo local.
6. **Human-in-the-loop**: nota oficial, aprobación de modelos y moderación requieren revisión humana.
7. **Optimización Railway Free / 1 GB**: sin PyTorch, Redis, Celery ni MLflow; REST con `urllib`, sin ORM ni clientes pesados.
8. **No publicar métricas falsas ni etiquetas de producción** mientras no haya OIDC y Supabase reales.

---

## 3. Arquitectura general

### Frontend
- React + Vite + TypeScript, tema visual (`monochrome`, `cyber`, `light`).
- `apiClient.ts` es el único cliente HTTP: envía `X-Correlation-ID`, `X-Actor` y `X-Role`.
- Servicios con doble adaptador (`requestWithDemo`): API real o factory local.
- RBAC en `auth/permissions.ts` es **solo UX**; la autoridad real está en la API.

### Backend
- FastAPI, una sola app en `api/app/main.py`, contrato `/api/v1`.
- Middleware de correlación que fija `request.state.correlation_id` y `request.state.actor`.
- `storage.py` capa de persistencia ligera: Supabase REST (PostgREST) con fallback en memoria.
- Artefacto MTL entrenado en `ml/artifacts/model.json`; la API solo hace inferencia.

### Despliegue previsto
- Frontend → Vercel (`VITE_API_BASE_URL`).
- Backend → Railway (1 GB).
- Base de datos → Supabase (Fase 5).

---

## 4. Trabajo realizado por fase

### Fase 1 — Contrato y módulos base
- Dashboard, Analytics, Certificados, Gobernanza y Neural Inspector leen `/api/v1` con fallback DEMO.
- Se eliminaron textos de producción falsa (“WS en vivo”, “Sincronizado”, “99.8%”).
- Auditoría con `correlationId` y envelope `{ data, meta }` validado en el frontend.

### Fase 2 — Comunidad, Tutor, Recomendaciones y Notificaciones
- Comunidad con hilos, mensajes, likes y moderación.
- Tutor DEMO reglado con hook compartido `useTutor()`, reglas trazables y fuentes, sin LLM externo.
- Recomendaciones derivadas del artefacto MTL + catálogo local; feedback persistente sin reentrenamiento automático.
- Notificaciones y preferencias con store DEMO versionado.
- `AuditEventInput.onlyDemo` evita duplicar en API las acciones que el backend ya audita.

### Fase 3 — Cursos, rutas, evaluaciones y sandbox
- Catálogo de cursos con filtros, paginación, detalle e inscripción.
- Rutas de aprendizaje con progreso persistente.
- Evaluaciones y SpeedGrader: la nota oficial **requiere** `signedBy`; nota sobre rúbrica rechazada con 422.
- Sandbox con análisis estático: detecta patrones peligrosos sin ejecutar código; ignora líneas comentadas.
- Historial del sandbox sincronizado (`GET /api/v1/sandbox/attempts?limit=10`) y store local en DEMO.
- Commit: `e0da0d5 feat: completar fase 3 con cursos, rutas, evaluaciones y sandbox auditado`.

### Fase 4 — Autoridad, settings y auditoría enriquecida

#### Backend (archivos nuevos y modificados)
| Archivo | Contenido |
|---|---|
| `api/app/auth.py` | Roles y permisos, `current_actor()`, `can()`, `require()`, `require_signature()`. Allowlist de roles, `RBAC_ENFORCE`, `DEMO_DEFAULT_ROLE=estudiante`, `TENANT_ID`. |
| `api/app/services/audit.py` | `add_audit()` y `audit_denied()` con `role`, `actor_id`, `tenant_id`, `method`, `path`, `ip_address`, `status`. |
| `api/app/services/settings.py` | Configuración institucional por tenant sobre `storage.py`. |
| `api/app/services/notifications.py` | Preferencias por actor, compartidas por `/settings/preferences` y `/notification-preferences`. |
| `api/app/schemas.py` | Campos nuevos de `AuditLog`, DTOs `AppSettings`, `AppSettingsUpdate`, `SettingsPreferences`. |
| `api/app/main.py` | Dependencias RBAC en endpoints, endpoints `/settings*`, auditoría derivada del actor, `/health` con `auth`, `rbacEnforced`, `tenantId`. |
| `api/supabase/schema.sql` | Columnas nuevas de `audit_logs`, tablas `settings` y `notification_preferences`, RLS comentado. |
| `api/README.md`, `api/.env.example` | Documentación de Fase 4 y variables `RBAC_ENFORCE`, `DEMO_DEFAULT_ROLE`, `TENANT_ID`. |

#### Frontend
| Archivo | Contenido |
|---|---|
| `frontend/src/auth/permissions.ts` | Mapa espejo del backend con permisos nuevos (`courses:edit`, `courses:enroll`, `learning-paths:progress`, `moderation:execute`, `audit:write`, `sandbox:use`, `submissions:view`). |
| `frontend/src/services/apiClient.ts` | Helper `getDemoActor()` y header `X-Role`. |
| `frontend/src/services/auditSink.ts` | Actor/rol reales, `onlyDemo` para no duplicar auditoría API. |
| `frontend/src/services/auditApi.ts` | Filtros `actor`, `action`, `correlationId`, `limit` también en DEMO. |
| `frontend/src/services/settingsApi.ts` | Servicio nuevo con adaptador API y DEMO. |
| `frontend/src/components/modules/SettingsView.tsx` | Carga/guarda configuración y preferencias; badge DEMO/API; RLS informativo; solo-lectura por permisos. |
| `frontend/src/App.tsx` | Rehidratación del rol DEMO desde `localStorage` (antes siempre volvía a `admin`). |
| `frontend/src/types/index.ts` | `AppSettings`, `SettingsUpdate`, `SettingsPreferences` y campos nuevos de `ApiAuditLog`. |
| `frontend/src/services/demoStore.ts` | Entradas de auditoría local con `role` y `status`. |

#### Commits
- `f172b6b feat: completar fase 4 con autoridad RBAC/ABAC DEMO y settings persistentes`
- `b71c716 docs: registrar hash real del commit de fase 4 en el plan`

---

## 5. Validación ejecutada

### Backend
- `python -m compileall -q api` → OK.
- Import de `app.main` → OK.
- Uvicorn reiniciado en `127.0.0.1:8000` con código Fase 4.
- Smoke con `TestClient`:
  - `/health` anuncia `auth=demo-header-rbac`, `rbacEnforced=true`, `storage=memory-demo`.
  - `settings GET/PUT` con admin → 200; con estudiante → 403.
  - Preferencias aisladas por actor (admin vs coordinador).
  - `audit GET` con admin → 200; con docente → 403.
  - Auditoría con `role=admin`, `status=success`, `path=/api/v1/settings`.
  - Firma ajena en calificación → 403; firma correcta → 200.
  - Eventos `auth.access_denied` con `status=denied`.

### Frontend
- `npm.cmd run lint` → 0 errores, 0 warnings.
- `npm.cmd run build` → OK. Bundle `546.83 kB` / gzip `145.42 kB` (advertencia no bloqueante de chunk > 500 kB).
- Smoke en navegador:
  - DEMO (`http://127.0.0.1:5173`): guardado de settings en store local, auditoría local con actor real.
  - API (`http://127.0.0.1:5174`): `PUT /api/v1/settings` → 200, header `x-role: admin` confirmado en la red.
  - Sin errores de consola.
  - Cursos, Evaluaciones, Gobernanza y Neural Inspector siguen funcionando con los nuevos headers.

---

## 6. Decisiones y restricciones

- La decisión oficial del artefacto MTL permanece: **`DEMO: no publicar`**. El modelo nunca publica nota oficial.
- Sin OIDC/JWT real, la autoridad backend es DEMO de headers `X-Actor`/`X-Role`; no debe presentarse como seguridad de producción.
- `settings.rlsEnabled` es informativo y default `false`; nunca activa RLS real.
- `signedBy` debe coincidir con el actor autenticado.
- Las preferencias de notificaciones son por actor; el endpoint legacy sigue abierto pero actor-scoped.
- No se publican métricas falsas ni etiquetas de producción.
- Backend sin PyTorch, Redis, Celery ni MLflow.
- En PowerShell usar `npm.cmd`, no `npm`.
- Los certificados son hoy 3 registros sintéticos fijos (mismo seed en backend y frontend), con hash y QR DEMO; **no** se generan por estudiante ni se vinculan a progreso o nota oficial. Se decidió no cambiarlos por ahora.

---

## 7. Estado actual y limitaciones

- Git: `main` sincronizado con `origin/main`, árbol de trabajo limpio para el código Fase 4.
- Backend en `http://127.0.0.1:8000` ejecutando código Fase 4.
- Sin credenciales de Supabase: `/health` reporta `storage=memory-demo`; la auditoría se pierde al reiniciar.
- Sin OIDC: `/health` reporta `auth=demo-header-rbac`.
- El plan `PLAN_DESARROLLO_MODULOS.md` tiene su sección 6 actualizada con el estado real.

---

## 8. Fase 5 — Plan acordado

### Decisiones tomadas
- **Persistencia**: Supabase real.
- **Autenticación**: Supabase Auth como proveedor OIDC.
- **RLS**: NO se activa. La autoridad sigue 100 % en la API, usando la service role key.
- **Datos**: base limpia; no se migran los registros sintéticos actuales.

### Arquitectura prevista
1. Login en el frontend con Supabase Auth → JWT.
2. Frontend envía `Authorization: Bearer <JWT>` (en DEMO siguen `X-Actor`/`X-Role`).
3. API verifica el JWT con JWKS vía `urllib`, con caché de claves, sin librerías pesadas.
4. El `Actor` se deriva de `sub`, claim de rol y claim de tenant del token.
5. Si no hay variables OIDC configuradas, el modo DEMO queda intacto.
6. `/health` reportará `auth=oidc-supabase` y `storage=supabase` cuando esté activo.

### Trabajo pendiente de implementación
- Verificador JWT con JWKS + cache.
- Actor derivado del token reemplazando headers cuando OIDC esté configurado.
- `storage.py` usando service role key (RLS apagado).
- Quitar el fallback en memoria de `certificates.list_certificates()` para respetar la base limpia.
- Tests con tokens firmados localmente y verificación de permisos por rol.
- Mantener `DEMO: no publicar` y todas las etiquetas de no producción.

### Guía para entregar credenciales
Ver `GUIA_FASE5.txt`: pasos para Supabase, creación de usuarios y claims, variables de Railway/Vercel, y plantilla rellenable. **La service_role key y la anon key no se comparten por chat**; se configuran en los dashboards o en `.env` local (ya ignorado por git).

---

## 9. Archivos de apoyo creados

| Archivo | Propósito |
|---|---|
| `ESTADO_PROYECTO.txt` | Resumen del estado del proyecto, validación, limitaciones y comandos. |
| `GUIA_FASE5.txt` | Guía paso a paso y plantilla para entregar los datos de Supabase/OIDC. |
| `DOCUMENTACION_PROYECTO.md` | Este documento. |

Estos tres archivos están creados pero **no commiteados**.

---

## 10. Comandos de referencia

```powershell
# API
cd api
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Frontend DEMO
cd frontend
npm.cmd run dev -- --host 127.0.0.1 --port 5173

# Frontend con API
$env:VITE_API_BASE_URL='http://127.0.0.1:8000'
npm.cmd run dev -- --host 127.0.0.1 --port 5174

# Calidad
npm.cmd run lint
npm.cmd run build
python -m compileall -q api
```

---

## 11. Siguiente paso

Rellenar la plantilla del `GUIA_FASE5.txt` y entregar los valores no secretos. Con eso se implementa la Fase 5 y se deja de reportar `DEMO` en `auth` y `storage`, manteniendo intacta la decisión `DEMO: no publicar` hasta que exista aprobación humana explícita.
