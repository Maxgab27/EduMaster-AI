# Informe de trabajo realizado, mejoras y añadidos — EduMaster.ai

**Proyecto académico · SENATI 4.º semestre · Noviembre 2026**

**Estado del demo:** `GOTY ✅` — listo para presentación académica, confirmado por el usuario.  
**Estado de Git al cerrar la tanda funcional:** rama `main`, HEAD `9acf27e`, sincronizado con `origin/main`.  
**Repositorio:** `https://github.com/Maxgab27/EduMaster-AI.git`

---

## 1. Alcance y criterios seguidos

- Se trabajó con `backend/` como backend activo y `frontend/` como aplicación principal; la carpeta `api/` se conservó sin modificaciones.
- Railway es el destino de despliegue, pero **no se ejecutó deploy**: `RAILWAY.md` quedó como checklist operativa para que lo ejecute el usuario.
- Todo lo entregado está etiquetado `DEMO`. Los certificados, comprobantes y métricas no son evidencia institucional ni oficial.
- No se compartieron secretos de Supabase, OIDC ni Railway. `frontend/.env.local` está ignorado por Git.
- En Windows se usaron comandos `npm.cmd`.
- El chat y las nuevas funciones se ven reales, pero son honestamente DEMO: sin autenticación real, sin broker de mensajería y sin WebSocket/SSE.

---

## 2. Cronología de commits

| Commit | Fecha | Hito | Resultado |
|---|---|---|---|
| `324d907` | 2026-11-24 | Aclaración del QR DEMO y su etiqueta de verificación | El comprobante deja claro que es sintético. |
| `e8b9164` | 2026-11-24 | QR escaneable y verificación por HTTP | El QR deja de ser ilustrativo. |
| `db38bec` | 2026-11-24 | QR accesible desde celular en la Wi-Fi local | Se usa `VITE_PUBLIC_ORIGIN` sin fijar IP pública en el repo. |
| `1d17191` | 2026-11-24 | Mejora de vista móvil y preparación para QR público | Drawer lateral y controles reducidos en móvil. |
| `b2d9233` | 2026-11-24 | Informe académico de mejoras de Kevin | PDF `EduMaster_AI_Informe_Mejoras_y_Puntos_de_Mejoria_Kevin.pdf`. |
| `2ad37d1` | 2026-11-24 | División de bundle, accesibilidad del drawer y errores de API claros | Carga inicial reducida y mensajes más honestos. |
| `23acb83` | 2026-11-24 | Preparación Railway y servicio estático del frontend | `serve.mjs`, `railway.json`, `RAILWAY.md` como checklist. |
| `320c0e8` | 2026-11-24 | Documentación de mensajería comunitaria verificada | Se confirma que el flujo funciona en DEMO. |
| `63d8ab6` | 2026-11-24 | Chat de Comunidad con respuestas simuladas y acciones | Mensajes, respuestas etiquetadas, editar, borrar y responder. |
| `a0d1661` | 2026-11-24 | Selector `Escribir como` en Comunidad | 7 participantes simulados; cambia autor y permisos del chat. |
| `46de8be` | 2026-11-24 | Notificaciones, Tutor IA, firma y CSV verificables | Cuatro mejoras aplicadas y probadas en vivo. |
| `9acf27e` | 2026-11-24 | Preferencias compartidas, respaldo DEMO, badge honesto y Playwright | Quinta tanda; 7 pruebas E2E versionadas. |

---

## 3. Lo que hemos hecho

### 3.1 Backend activo y contrato DEMO

- Se conservó `backend/` con sus 6 rutas originales más el healthcheck `/health`.
- Smoke test: **34/34** sobre el contrato `/compat`, incluidos certificados.
- Seed automático: `EDU-2026-98124`, `EDU-2026-98125` y `EDU-2026-98126`.
- El header `X-Actor` sigue siendo opcional; la identidad se deriva de `localStorage.edumaster_demo_user`.
- Con API real aparecen `signatureHash`, `auditLogId` y `actorSource=header`; sin backend, la UI indica `no disponible en DEMO local`.
- CORS acepta `*.railway.app`, `*.up.railway.app` y orígenes LAN por regex; `PUBLIC_FRONTEND_ORIGIN` es opcional.

### 3.2 Frontend, build y servicio estático

- React 19.3.1, TypeScript 7, Vite 8 y Tailwind 3.4.
- División de bundle por módulos para reducir la carga inicial.
- `frontend/scripts/serve.mjs` sirve `frontend/dist`, respeta `$PORT`, expone `/health` y hace fallback SPA sin path traversal.
- `frontend/railway.json` y `railway.json` en la raíz preparan dos servicios: backend y frontend.
- `backend/Dockerfile` define el servicio API.
- Build final sin `.env.local`: **sin `192.168.18.36` ni `127.0.0.1:8000` en el bundle**.

### 3.3 Módulos DEMO funcionales

- **Certificados:** QR PNG escaneable, verificación HTTP, comprobante `?verify=EDU-2026-98124` y `?receipt=EDU-2026-98124`.
- **Comunidad:** hilos, búsqueda, mensajes, responder, editar, borrar, máximo 200 mensajes y respuesta simulada `DEMO · SIMULADO`.
- **Selector de identidad:** “Escribir como” simula 7 participantes; cambia autor y permisos del chat, no el rol global ni la autenticación.
- **Notificaciones:** derivadas de la auditoría local, contador, filtros `Todas / Sin leer`, `Marcar todas`, tiempo relativo y actor.
- **Tutor IA:** preguntas sugeridas, `Peso regla DEMO: 86 %`, fuentes clicables y conversación persistida.
- **SpeedGrader:** rúbrica de 4 criterios, feedback validado, firma docente obligatoria, `X-Actor` visible y comprobante de firma.
- **Gobierno y Análisis:** registro de auditoría con filtros y descarga real de CSV con BOM UTF-8.
- **Configuración:** 3 temas visuales, parámetros multi-tenant, RLS informativo, preferencias compartidas y respaldo JSON.
- **Transparencia:** badge `DATOS LOCALES DEMO · SIN API /api/v1` y avisos claros cuando no hay conexión al núcleo.

### 3.4 Documentación

- `README.md`: secciones 2.6, 2.7 y 7; comandos de lint, build, E2E, smoke y servidor estático.
- `FUNCIONALIDADES_Y_MEJORAS.md`: inventario, §11 y §12 con los límites honestos de cada tanda.
- `MATRIZ_CUMPLIMIENTO_DOCUMENTO.md`: actualizada a **5 ✅ · 8 ◐ · 11 ❌** sobre 24 requisitos.
- `RAILWAY.md`: checklist para que el usuario cree los dos servicios y defina variables.
- PDF académico `EduMaster_AI_Informe_Mejoras_y_Puntos_de_Mejoria_Kevin.pdf`.

---

## 4. Mejoras aplicadas

| Mejora | Situación anterior | Situación actual | Evidencia | Límite honesto |
|---|---|---|---|---|
| Bundle y accesibilidad | Carga inicial pesada; drawer sin `focus trap` | Módulos divididos y drawer con foco controlado | Build correcto; M-04 cerrado después con E2E | El modal del QR y el command palette no entran en ese cambio. |
| QR de certificados | Ilustrativo, no escaneable | PNG escaneable, verificación HTTP y comprobante de una página | Flujo revisado en vivo y documentado en §8 | Sigue siendo un folio sintético; no es certificado oficial. |
| Vista móvil | Controles anchos | Drawer lateral y controles reducidos | Revisión visual en navegador | No sustituye pruebas E2E ni auditoría de accesibilidad completa. |
| Railway | Sin servicio estático ni checklist | `serve.mjs`, `railway.json`, `backend/Dockerfile`, `RAILWAY.md` | `/health`, fallback SPA y sin path traversal verificados | No se publicó nada; URLs definitivas dependen del usuario. |
| Chat de Comunidad | Sin conversación funcional | Mensajes, respuestas simuladas, editar, borrar y responder | E2E: actions `community.message.posted` y `community.message.simulated` | Sin backend de mensajería ni entrega real. |
| Selector de usuario | Autor único | 7 identidades simuladas con permisos de chat | E2E y revisión en vivo | No es login; no cambia el rol global. |
| Notificaciones | Listado estático | Derivadas de auditoría, contador, filtros y persistencia | `notificationReadAllAt` guardado y persistido tras recarga | Sin broker; se borran al limpiar el navegador salvo respaldo. |
| Tutor IA | Respuestas genéricas | Sugerencias, peso regla DEMO y fuentes clicables | E2E: `Peso regla DEMO: 86 %` y referencia DEMO | Reglas trazables, no LLM ni modelo entrenado. |
| SpeedGrader | Firma poco verificable | Validación de feedback, firma y comprobante con `correlation_id` | E2E: botón deshabilitado con `OK`; comprobante visible | Hash, `audit_log_id` y `actor_source` reales solo con API. |
| CSV | Sin exportación comprobada | `auditoria-YYYY-MM-DD.csv` y `analitica-<cohorte>-YYYY-MM-DD.csv` | Descargas reales en E2E con BOM UTF-8 | Datos sintéticos etiquetados `DEMO`. |
| Preferencias | Dos claves contradictorias | `notificationPreferences` y `settingsPreferences` sincronizadas | Toggle de campanita reflejado en Configuración | Persistencia local, no perfil de usuario real. |
| Respaldo DEMO | Limpiar navegador perdía todo | Exportar/importar JSON validado y `Recargar ahora` | Descarga e reimportación verificadas en E2E | El usuario debe guardar el JSON fuera del navegador. |
| Estado sin API | Badge ambiguo | `DATOS LOCALES DEMO · SIN API /api/v1` | Visible en Topbar, Configuración y E2E | Describe configuración del build, no detecta red en tiempo real. |
| Pruebas E2E | Sin suite versionada | `@playwright/test`, config y 7 pruebas | `npm.cmd run test:e2e` → **7/7 en 28.3 s** | No cubre seguridad, CI/CD, OWASP, canary ni RPO/RTO. |

---

## 5. Añadidos hechos

### 5.1 Archivos y scripts nuevos

- `frontend/scripts/serve.mjs` — servidor estático que respeta `$PORT`.
- `frontend/railway.json` y `railway.json` — configuración de los servicios en Railway.
- `backend/Dockerfile` — imagen del backend activo.
- `frontend/playwright.config.ts` — configuración E2E con webServer en `127.0.0.1:5174` sin variables locales.
- `frontend/tests/demo-flows.spec.ts` — 7 pruebas de notificaciones, preferencias, respaldo, Comunidad, Tutor IA, SpeedGrader y CSV.
- `frontend/src/services/demoStore.ts` — funciones `exportDemoData()` e `importDemoData()` con validación de versión, tipo y claves permitidas.
- `EduMaster_AI_Informe_Mejoras_y_Puntos_de_Mejoria_Kevin.pdf` — informe académico.
- `demo-showcase.html` — resumen visual generado con Playwright; se guardó en `C:\Users\sanhu\AppData\Local\Temp\opencode\`, **fuera del repo**.

### 5.2 Dependencias y scripts npm

- `@playwright/test` como dependencia de desarrollo.
- Script `test:e2e` en `frontend/package.json`.
- Entradas en `frontend/.gitignore`: `playwright-report/`, `test-results/`, `blob-report/` y `playwright/.cache/`.

### 5.3 Datos y constantes DEMO

- Folios: `EDU-2026-98124`, `EDU-2026-98125`, `EDU-2026-98126`.
- Métricas simuladas: `confidence=0.94`, `calibrated_brier_score=0.082`, `PR-AUC=0.914`.
- Claves de `localStorage`: `edumaster_demo_v1`, `edumaster_demo_user`, `edumaster_theme`, `edumaster_tutor_conversation`, `edumaster_student_notes`, `notificationPreferences`, `settingsPreferences` y `notificationReadAllAt`.
- CSV con BOM UTF-8: `auditoria-YYYY-MM-DD.csv` y `analitica-<cohorte>-YYYY-MM-DD.csv`.

---

## 6. Validación y evidencia

| Verificación | Resultado |
|---|---|
| `npm.cmd run lint` | 0 hallazgos. |
| `npm.cmd run build` | Correcto con `.env.local` y sin él. |
| Build sin `.env.local` | Sin IPs locales en el bundle. |
| `npm.cmd run test:e2e` | **7 passed (28.3 s)**, 0 errores de consola. |
| `python backend/tests/test_smoke.py` | **34/34**. |
| `GET /health` | `{"status":"ok",...}`. |
| Fallback SPA y path traversal | Verificados en el servidor estático. |
| Git | `HEAD` y `@{u}` iguales; `git status --short --branch` sin diferencias. |
| `.env.local` | Ignorado por `*.local`; no subido al repo. |

---

## 7. Demo visual

Se generaron seis capturas desde la compilación final sin `.env.local` y se presentaron en `demo-showcase.html`:

1. **Notificaciones DEMO** — eventos de auditoría, contador, filtros y `Marcar todas`.
2. **Comunidad** — chat local con respuesta simulada y selector de identidad.
3. **Tutor IA** — sugerencias, peso regla DEMO y fuentes clicables.
4. **Respaldo DEMO** — preferencias compartidas, exportar/importar JSON y badge honesto.
5. **SpeedGrader** — firma con `X-Actor`, feedback validado y comprobante.
6. **Auditoría y CSV** — filtros, correlación y descarga real del archivo.

El usuario confirmó el estado del demo como **`GOTY ✅`**.

---

## 8. Límites honestos y decisiones pendientes

- **No se hizo deploy.** Railway queda listo para que el usuario cree los dos servicios siguiendo `RAILWAY.md`.
- Falta decidir **Postgres de Railway** o **SQLite efímero** para persistencia del backend.
- Falta decidir si se migra `railway.json` a `.railway/railway.ts` antes del `2026-12-01` o se configura por dashboard.
- Supabase/OIDC siguen pendientes por falta de credenciales; `X-Actor` no es autenticación.
- No hay WebSocket/SSE: la sincronización es simulada y las animaciones son ilustrativas.
- Los certificados y comprobantes no son oficiales; las métricas son constantes DEMO, no mediciones.
- Playwright cubre flujos DEMO, no seguridad, CI/CD, OWASP, canary ni RPO/RTO.
- El respaldo depende de que el usuario guarde el JSON fuera del navegador.

---

## 9. Comandos reproducibles en Windows

```powershell
cd frontend
npm.cmd run lint
npm.cmd run build
npm.cmd exec playwright install chromium
npm.cmd run test:e2e
python ../backend/tests/test_smoke.py
```

Para simular el servicio web de Railway:

```powershell
cd frontend
$env:PORT = 4317
npm.cmd run start
```

---

## 10. Conclusión

El proyecto quedó académicamente listo en modo **DEMO**: módulos funcionales y verificables, backend activo, documentación actualizada, respaldo local, preferencias coherentes y 7 pruebas E2E versionadas. Todo el trabajo versionable está commiteado y pusheado; el despliegue público y las decisiones de infraestructura quedan en manos del usuario.
