# Funcionalidades reales y mejoras posibles — EduMaster.ai

**Prueba realizada:** navegación real en Chromium sobre `http://127.0.0.1:5173` y sobre la IP Wi-Fi `http://192.168.18.36:5173`, con backend activo en `http://127.0.0.1:8000` y en `http://192.168.18.36:8000`.
**Fecha:** 2026-11-23 (inventario) · 2026-11-24 (núcleo real por HTTP).
**Resultado general:** 11 módulos abiertos, interacciones ejecutadas, **0 errores de consola**. El resto de la UI opera en modo **DEMO** con `localStorage`; el **núcleo** (riesgo de abandono, SpeedGrader, firma y auditoría) ya llama por HTTP real al backend activo. Ver §7. El QR de certificados es escaneable, verifica por HTTP y abre un comprobante de una sola página en el celular. Ver §8. La vista tiene un drawer lateral y controles reducidos en móvil; el despliegue público en Railway está preparado. Ver §9.

---

## 1. Funciones confirmadas

| Módulo | Qué hace realmente | Prueba ejecutada | Mejora recomendada | Prioridad |
|---|---|---|---|---|
| **Resumen** | KPIs sintéticos (24,593 alumnos, 1,248 cursos, 89,450 horas, 5,782 certificados), visualizador neuronal SVG animado, triaje de riesgo con 3 alertas y botón “Registrar mentoría (demo)”. | Clic en mentoría → toast “registrada localmente… no se envió ningún mensaje real” y evento `teacher.intervention_recorded` en auditoría. | El visualizador dice “Inferencia (Forward) 1x” aunque no hay inferencia real. Cambiar a estado `detenido` y mostrar `mode/engine` de `/health`. Quitar “0.914” o dejar solo “métrica simulada”. | P0 |
| **Planes de Aprendizaje** | Ruta de 6 hitos con prerrequisitos, progreso y botón “Continuar”. | Progreso pasó de **33% a 50%**; se guardó en `localStorage` y generó `learning_path.progress_changed`. | Persistir en backend/Supabase en vez de `localStorage`; mostrar la regla de prerrequisito cuando un hito está bloqueado. | P1 |
| **Cursos** | Catálogo de 5 cursos, filtros por nivel, búsqueda, paginación, formulario “Nuevo curso” con código, nivel, título, docente, cupo y etiquetas. | Filtros visibles; formulario se abre con código autogenerado `QA-900`. | El formulario guarda solo en DEMO. Conectar al backend o rotular “no persiste”. Validar cupo y código duplicado. | P1 |
| **Análisis** | Series semanales de progreso, actividad por semana, dominio por competencia, filtros por materia y botón “Exportar CSV”. | Gráficos y tabla renderizan con datos sintéticos. No se observó cambio visible al pulsar “Exportar CSV” (podría descargar un archivo). | Verificar la descarga real del CSV; añadir fecha de corte y fuente en el archivo exportado. | P1 |
| **IA Tutor** | Respuestas por reglas, con confianza y fuentes; conversación persistida. | Pregunta “¿Cómo se calcula el riesgo de abandono?” → respuesta con `Documento §9.5`, confianza 86% y guardrail. | El saludo muestra “Confianza: 99%” sin base. Cambiar a “reglas DEMO”. Hacer clicables las fuentes y añadir preguntas sugeridas. | P0 |
| **Evaluaciones / SpeedGrader** | Comparador nota oficial vs estimación IA, 3 entregas, SpeedGrader con rúbrica de 4 criterios, borrador asistido, firma docente obligatoria. | Abrí SpeedGrader, ajusté rúbrica, escribí nombre del docente y firmé: pendientes pasaron de **3 a 2**, apareció “Ver / Editar” y se registró `submissions.graded` con actor “Dr. Alejandro Morales”. | Enviar `X-Actor` del rol seleccionado al backend al firmar (el endpoint ya lo acepta desde la mejora anterior). Mostrar el `audit_log_id` devuelto. Sin eso la firma es solo local. | P0 |
| **Certificados** | 3 certificados sintéticos con folio, hash, fecha y nota; QR PNG escaneable que codifica `http://192.168.18.36:5173/?verify=<folio>` (IP Wi-Fi de la PC) y verificación SHA-256 contra la API activa. El botón “Abrir comprobante (celular)” lleva a `?receipt=<folio>`. | OpenCV decodificó el QR a esa URL exacta; al abrirla desde la IP se habilitó “Certificados”, apareció “Folio válido · EDU-2026-98124” con hash `6f5f33d8…` y se registró `certificate.verify`. El botón de comprobante abrió la página simple con QR, datos y “Guardar como PDF”; 0 errores de consola. | Ya es escaneable en la misma Wi-Fi y el comprobante llega al celular sin popup ni descarga bloqueada. Para internet falta publicar en Railway. | P1 |
| **Redes Neuronales** | Inspector con pestañas Arquitectura / Evaluación / Gobernanza, función de pérdida multitarea y metadatos del artefacto. | Texto: “Implementación DEMO en Python puro, sin PyTorch”, versión `0.1.0-demo`, épocas 7. | Conectar la pestaña Evaluación con `api/ml/artifacts/evaluation.json` (ya existe) para mostrar baselines reales del dataset sintético. | P1 |
| **Gobierno & Ley 29733** | Pestañas Ley/ARCO, Registro de Auditoría y Telemetría MLOps; exportar informe ANPD; bandeja ARCO con 3 solicitudes. | “Marcar atendida” cambió el estado a **Atendida** y generó `arco.request.resolved`. El registro de auditoría mostró **5 eventos** con correlation ID. | Los eventos son de `localStorage`. Enviarlos también al backend cuando haya API. Añadir filtros y exportación CSV de auditoría. El toggle de RLS ya dice “informativo”, mantenerlo así. | P1 |
| **Comunidad** | Hilos, mensajes, likes y moderación con estado local; botón “Nuevo hilo”. | Hay 2 hilos y 3 mensajes DEMO sembrados. En el build sin API se envió “Prueba DEMO de mensajería”: apareció en el hilo, quedó en `edumaster_demo_v1` y en la auditoría `community.message.posted`, y siguió visible tras recargar; 0 errores de consola. | Conectar al backend para compartir mensajes entre usuarios; hoy cada navegador tiene su propia copia. | P2 |
| **Configuración** | 3 temas visuales, parámetros de tenant, retención de eventos, protección de menores, consentimiento, preferencias de notificación. | Cambio de tema **Grises → Cyber** funcionó y persistió en `edumaster_theme`. | El campo “Marcar RLS como habilitado” ya avisa que no activa RLS real. Mantener el aviso. Guardar preferencias debería mostrar confirmación visible. | P2 |

## 2. Funciones globales confirmadas

| Función | Evidencia | Mejora |
|---|---|---|
| Simulación de 7 roles (Admin, Coordinador, Docente, Estudiante, Analista, ML Engineer, Auditor) | Al cambiar a Docente desaparecieron módulos de Admin (Planes, Redes, Gobierno, Configuración). | Es RBAC de **frontend**. Rotularlo “SIMULAR ROL RBAC” (ya aparece) y no decir que es seguridad. |
| 3 temas visuales | Grisite → Cyber → Claro. | Agregar atajo en Configuración para volver al tema por defecto. |
| Paleta de comandos | Al pulsar el botón “⌘K” se abre buscador con navegación, roles y temas. | Verificar el atajo real de teclado en la demo en vivo (en automatización no se disparó con `Ctrl+K`). |
| Correlación y auditoría local | Cada acción guarda `correlation_id` visible en Gobierno. | Enviar el mismo ID como header al backend (ya existe `newCorrelationId()`). |
| Persistencia local | Claves `edumaster_demo_v1`, `edumaster_demo_user`, `edumaster_theme`, `edumaster_tutor_conversation`. | Documentar que se borra al limpiar datos del navegador. |

## 3. Funciones del backend activo (6 rutas)

| Ruta | Función | Mejora |
|---|---|---|
| `/health` | Estado real: DEMO, motor, base y protocolo. | Ninguna urgente; ya fue corregida. |
| `/api/v1/students/at-risk` | Lista de alumnos en riesgo. | Filtrar por nivel de riesgo y tenant. |
| `/api/v1/inference/dropout-risk` | Probabilidad de abandono con factores dominantes. | Dejar de insertar alumnos como efecto secundario; separar simulación de persistencia. |
| `/api/v1/grades/submit` | Firma con hash SHA-256 y `actor_source`. | Exigir `X-Actor` de verdad (OIDC) en Fase 5. Hoy es opcional. |
| `/api/v1/audit/logs` | Consulta de auditoría. | Proteger el endpoint y paginar/filtrar. |
| `/` | Información del servicio. | Sin cambios. |

## 4. Orden recomendado de mejoras

1. **P0 (antes de sustentar):** corregir la URL de verificación (hoy es real, ver §8); bajar el “99%” del tutor; desactivar el “Forward 1x” del dashboard; enviar `X-Actor` al firmar. Los cuatro ya están aplicados (ver §5, §7 y §8).
2. **P1 (si hay un día):** conectar Evaluación y Gobierno al backend; conectar Comunidad al backend para compartir mensajes; verificar exportación CSV.
3. **P2 (Fase 5):** Supabase + OIDC, RLS real, persistencia de rutas y cursos. El QR escaneable y la configuración para QR público ya están aplicados (§8 y §9); falta ejecutar el despliegue con las URLs reales.

## 5. Estado real de los arreglos P0 (2026-11-23)

| Arreglo | Estado | Evidencia |
|---|---|---|
| URL de verificación inexistente | **Aplicado y superado** | Los certificados usan `GET /api/v1/compat/certificates/verify/{folio}`; el QR PNG apunta a `/?verify=<folio>` y se valida por SHA-256 en SQLite. Ver §8. |
| “Confianza: 99%” del tutor | **Aplicado** | El saludo ya no muestra peso; las respuestas regladas dicen “Peso regla DEMO”. Se limpia también el valor guardado en `localStorage` de versiones anteriores. |
| “Inferencia (Forward)” / “PyTorch • GRU” | **Aplicado** | El visualizador dice “DEMO · ANIMACIÓN ILUSTRATIVA”, “motor DEMO en NumPy (sin PyTorch)” y “Propagación (animada)”. |
| Enviar `X-Actor` al firmar | **Aplicado** | El frontend llama a `/api/v1/compat/submissions/{id}/grade`, el header `X-Actor` llega al backend y la respuesta confirma `actor_source=header`, hash SHA-256 e `audit_log_id`. Ver §7. |

Verificación tras los cambios: `npm.cmd run lint` sin errores, `npm.cmd run build` correcto, navegador con **0 errores de consola**, smoke test del backend **34/34** (las 6 rutas originales siguen intactas y se añadió el contrato `/compat`), QR decodificado con OpenCV cuya URL abrió la verificación real, drawer probado a 390 px y comprobante abierto por la ruta `?receipt=`. Ver §9.

## 6. Frase para la sustentación

> "Probamos el sistema en navegador: los 11 módulos abren y, en el núcleo real, el docente firma una nota contra la API por HTTP, el backend devuelve un hash SHA-256 y el evento aparece en la auditoría con el actor y el correlation ID. El QR de certificados se decodifica como URL, abre la vista y valida el folio contra la API, dejando también su evento `certificate.verify`. Lo hace con datos sintéticos y SQLite local, etiquetado como DEMO; Supabase y la autenticación real quedan para la siguiente fase."

---

## 7. Núcleo real por HTTP (2026-11-24)

Alcance elegido: **núcleo real**, no los 11 módulos en modo API ni Supabase/OIDC. Lo que es real es el **transporte HTTP, la persistencia SQLite y la firma**; los datos siguen siendo sintéticos y están etiquetados como DEMO.

| Capacidad | Contrato | Evidencia observada |
|---|---|---|
| Triaje de riesgo | `GET /api/v1/compat/students/at-risk` | 3 alumnos desde SQLite, riesgo máximo **88%**; badge “API REAL · DATOS SINTÉTICOS”. |
| Inferencia Cabeza C | `POST /api/v1/compat/inference/dropout-risk` | Probabilidad calculada por el motor NumPy y factor dominante; `confidence` y `brier` siguen siendo constantes, no mediciones. |
| Bandeja de entregas | `GET /api/v1/compat/submissions` | 3 entregas (`sub-101` a `sub-103`) leídas de SQLite; artefactos del smoke test filtrados. |
| Firma del SpeedGrader | `POST /api/v1/compat/submissions/{id}/grade` | “✓ Nota 16/20 … registrada en API · SHA-256 `6cb0b5ea1567…`”. Pendientes **2 → 1**; desglose de 4 criterios / 20 pts conservado. |
| Auditoría | `GET /api/v1/compat/audit/logs` | Fila `OFFICIAL_GRADE_SIGN` con actor `Dr. Alejandro Morales`, rol `docente`, hash y correlation ID; 0 errores de consola. |

**Configuración:** `frontend/.env.local` define `VITE_CORE_API_BASE_URL=http://127.0.0.1:8000`. `VITE_API_BASE_URL` se deja vacío, así que los otros 9 módulos permanecen en DEMO. Si la variable del núcleo se borra, el núcleo vuelve al adaptador local sin endpoints falsos.

**Límites honestos:** `X-Actor` es opt-in del frontend, todavía no hay OIDC; no se publica en actas reales; `confidence=0.94`, `calibrated_brier_score=0.082` y `PR-AUC 0.914` son constantes del contrato, no resultados medidos.

---

## 8. QR escaneable y verificación de certificados (2026-11-24)

Antes el QR era un patrón SVG decorativo sin patrones de localización ni codificación: se veía, pero ningún lector podía escanearlo. Ahora se genera con la librería `qrcode` como **PNG real** y codifica una URL absoluta de la SPA.

| Elemento | Implementación | Evidencia |
|---|---|---|
| QR | `QRCode.toDataURL()` en `certificatesApi.ts`, 192 px, corrección `M`. | `cv2.QRCodeDetector().detectAndDecode()` devolvió exactamente `http://192.168.18.36:5173/?verify=EDU-2026-98124`. |
| URL del QR | `new URL('/?verify=<folio>', VITE_PUBLIC_ORIGIN ?? window.location.origin)`. | La vista muestra `URL: http://192.168.18.36:5173/?verify=EDU-2026-98124`. |
| Escaneo | `App.tsx` abre “Certificados” si llega `?verify=`; `CertificatesView.tsx` verifica una sola vez y limpia el query string. | Al abrir la URL se mostró “Folio válido · EDU-2026-98124” y el hash `6f5f33d8e27b8088167eee46c44e77dabdb35555276a3d3b89f8a65830dadb11`. |
| API | `GET /api/v1/compat/certificates` y `GET /api/v1/compat/certificates/verify/{folio}` sobre SQLite. | Lista 3 folios con hashes de 64 caracteres; folio inexistente devuelve `status=No encontrado`. |
| Hash | Payload canónico `folio/student/course/issuedAt/grade` con SHA-256; el backend compara con `hmac.compare_digest`. | Mensaje: “DEMO · folio y hash SHA-256 coinciden en la API; no es un certificado oficial.” |
| Auditoría | Evento `certificate.verify` con folio, `valid` y `correlation_id`. | Visible en `/api/v1/compat/audit/logs`; se añadió deduplicación para que un escaneo genere una sola verificación. |

**Cómo escanearlo con el ZTE Axon 50 5G:** los servicios escuchan en `0.0.0.0` (Vite 5173 y Uvicorn 8000), `VITE_PUBLIC_ORIGIN=http://192.168.18.36:5173` fija la IP del QR y `getCoreBaseUrl()` cambia `127.0.0.1` por el host de la página solo cuando ese host es una IP privada, así que la API se llama en `http://192.168.18.36:8000`. El backend admite orígenes LAN por CORS. En la PC abre `http://192.168.18.36:5173`, entra a Certificados, pulsa “Ver QR / Folio” y escanea con la cámara del celular conectado a la misma Wi‑Fi.

**Comprobante en el celular:** el modal del QR incluye **“Abrir comprobante (celular)”**. En lugar de depender de `window.open` o de una descarga (los dos suelen bloquearse en móvil), navega a `?receipt=<folio>`, una página de la misma SPA con folio, estudiante, curso, fecha, nota, hash, QR y el botón **“Guardar como PDF”** (`window.print()`). **“Volver”** regresa a la verificación. El evento `certificate.receipt_open` queda en auditoría.

**Límites honestos:** `127.0.0.1` en el celular significaría el propio celular; por eso el QR usa la IP de la PC. Si cambia la red, actualiza `VITE_PUBLIC_ORIGIN` con el nuevo IPv4 (`ipconfig`). La publicación en Internet la ejecuta el usuario con la checklist de `RAILWAY.md` (§9). Los 3 registros son sintéticos, SQLite es local y el mensaje de verificación dice explícitamente que **no es un certificado oficial**. Si falta la API, el fallback calcula el mismo hash con Web Crypto, pero el QR sigue siendo escaneable y la UI lo rotula como verificación DEMO local.

---

## 9. Vista móvil y preparación para Railway (2026-11-24)

| Mejora | Implementación | Evidencia |
|---|---|---|
| Drawer lateral | `Sidebar.tsx` pasa a ser un panel `fixed` con `translate-x` en celular; `App.tsx` controla `isMobileNavOpen` y un overlay; `Topbar.tsx` añade el botón hamburger. En escritorio (`md:`) conserva la columna fija original. | A 390 px el sidebar queda fuera de pantalla (`-288px`), el hamburger aparece, el overlay se abre y el panel entra a `0px`; al elegir “Certificados” el drawer se cierra. |
| Topbar reducida | Filtros globales, badge de conexión y controles secundarios se ocultan en móvil; el encabezado usa `px-4` y el main `p-4 sm:p-6`. | En el iframe de 390 px no hay desbordamiento horizontal: `scrollWidth = 390` y `clientWidth = 390`. |
| Modal del QR | `max-h-[92dvh]`, `overflow-y-auto`, QR de 128 px en celular y 144 px desde `sm:`, URL con `break-all`. | Se abrió el modal en 390 px: alto máximo 776 px, scroll interno, botón “Abrir comprobante (celular)” visible y 0 errores de consola. |
| Corrección de texto largo | `min-w-0` y `break-words` en el aviso de verificación. | Antes `scrollWidth=470`; después `scrollWidth=390`. |
| QR en Railway | Sin `VITE_PUBLIC_ORIGIN`, `certificatesApi.ts` usa `window.location.origin`. Con `VITE_CORE_API_BASE_URL=https://<backend>.up.railway.app`, `getCoreBaseUrl()` ya no reescribe ese host. | Compilación sin `.env.local`: no aparece `192.168.18.36` en el bundle y sí `location.origin`. |
| CORS público | `main.py` acepta `*.vercel.app`, `*.railway.app`, `*.up.railway.app` y orígenes LAN por regex; `PUBLIC_FRONTEND_ORIGIN` añade un origen extra sin tocar secretos. | Origin simulado `https://edumaster-frontend-production.up.railway.app` → `Access-Control-Allow-Origin` igual al origin. Origen no permitido (`https://example.com`) → sin header CORS. |
| Comprobante sin popup | Ruta `?receipt=<folio>` renderiza `CertificateReceiptView`. | Desde el modal se navegó a `?receipt=EDU-2026-98124` y apareció “Certificado de finalización” con QR, hash y “Guardar como PDF”. |
| Servidor estático para Railway | `frontend/scripts/serve.mjs` (solo módulos nativos de Node) sirve `dist` en `$PORT`, responde `/health` en JSON y devuelve `index.html` para rutas de la SPA; `frontend/railway.json` fija build `npm ci && npm run build`, start `npm run start` y healthcheck `/health`. | Con `PORT=4317`: `/health` → 200 JSON, `/?verify=EDU-2026-98124` y `/ruta-inexistente` → 200 con `<div id="root">`, asset JS → `text/javascript`, y un intento de `%2e%2e` no filtró `package.json`. Build sin `.env.local`: 465.09 kB y ausencia de `192.168.18.36` / `127.0.0.1:8000` en el bundle. |

**Flujo más simple en Railway:** publicar la API desde la raíz del repo y la web con Root Directory `frontend`, definir solo `VITE_CORE_API_BASE_URL` apuntando al backend y dejar `VITE_PUBLIC_ORIGIN` sin definir. El QR codificará `https://<frontend>.up.railway.app/?verify=<folio>`; al escanearlo se abre la verificación, y el botón del modal muestra el comprobante en pantalla. La checklist operativa está en `RAILWAY.md`.

**Límites honestos:** no se hizo el despliegue real porque requiere la cuenta y las URLs del usuario; el repositorio quedó preparado para que lo ejecute él. Supabase/OIDC siguen pendientes y no se compartieron secretos. Los certificados y el comprobante mantienen la etiqueta `DEMO` y advierten que no son oficiales.

---

## 10. Tercera tanda: bundle, accesibilidad y errores claros (2026-11-24)

Se ejecutaron los puntos **M-03, M-05 y M-06** del informe de mejoras. Criterio: cambios medibles, sin credenciales nuevas y sin tocar el flujo QR/comprobante ya validado.

| Punto | Implementación | Evidencia |
|---|---|---|
| M-03 · División del bundle | `App.tsx` carga con `React.lazy()` las nueve vistas secundarias (Planes, Cursos, Análisis, Tutor, Evaluaciones, Inspector, Gobierno, Comunidad, Configuración) dentro de un `Suspense` con aviso *“Cargando módulo…”*. Inicio, dashboard y certificados siguen inmediatos para no retrasar el QR. | Build: chunk principal **580.79 kB → 465.45 kB** (gzip 158.45 → 135.04 kB). Nueve chunks de 5.69 a 18.40 kB se descargan solo al abrir cada módulo. **Desapareció el aviso de chunk > 500 kB.** |
| M-05 · Accesibilidad del drawer | `Topbar.tsx` añade `aria-controls="app-sidebar"` y `aria-expanded`; `Sidebar.tsx` expone `id="app-sidebar"`, `role="dialog"` y `aria-modal` solo en móvil abierto, e `inert` cuando está cerrado; `App.tsx` gestiona `Escape`, focus trap con `Tab`/`Shift+Tab` y retorno de foco al hamburger. Respeta el cambio de viewport con `matchMedia`. | CDP a **390 px**: `scrollWidth=390`; hamburger `aria-expanded=false → true`; drawer `x=-288 → 0`; `role=dialog`, `aria-modal=true`, `inert=false` al abrir; 12 elementos enfocables y `Tab` desde el último vuelve al primero; `Escape` cierra a `x=-288`, reactiva `inert` y devuelve el foco al hamburger. |
| M-06 · Estados offline y de error | `apiClient.ts` introduce `ApiClientError` con tipos `offline`, `http`, `invalid` y `config`, más `friendlyApiError()`; distingue fallo de red, envelope inválido y variable faltante. `CertificatesView.tsx` y `CertificateReceiptView` muestran esos mensajes; el comprobante añade **“Reintentar”** cuando falla la carga. | Con la API bloqueada por CDP se mostró: *“No se pudo contactar con la API. Revisa la Wi-Fi o el dominio publicado y vuelve a intentarlo.”* Sin `Failed to fetch` ni la IP del backend en pantalla; `scrollWidth=390`. |

**Regresión verificada:** `npm.cmd run lint` sin hallazgos; `npm.cmd run build` correcto; smoke test **34/34**. Flujo QR `?verify=EDU-2026-98124` → “Folio válido” y comprobante `?receipt=EDU-2026-98124` → QR de 96 px, “Volver” y “Guardar como PDF”, sin desbordamiento y **0 errores de consola**.

**Límites honestos:** la división por módulos reduce la carga inicial, pero no sustituye a las pruebas E2E automáticas (M-04, Playwright sigue sin instalarse). El `focus trap` cubre el drawer lateral; el modal del QR y el command palette no forman parte de este cambio. M-01 (Railway) quedó **preparado pero sin publicar**: la ejecución y las URLs definitivas dependen del usuario. M-02 (Supabase/OIDC) continúa pendiente por falta de credenciales. Todo sigue etiquetado `DEMO` y los certificados no son oficiales.
