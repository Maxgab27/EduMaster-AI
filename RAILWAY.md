# Railway: checklist de despliegue (lo ejecuta el usuario)

> **Estado del repositorio:** preparado, **sin despliegue ejecutado**. No se ejecutó `railway link`, `railway up` ni se creó ningún servicio desde esta sesión. El backend activo es `backend/`; `api/` se conserva solo como referencia y no se modifica. Todo sigue etiquetado `DEMO`: los certificados **no son oficiales**.

Esta guía deja dos servicios en el mismo proyecto de Railway:

| Servicio | Root Directory | Configuración en el repo | Dominio |
| :--- | :--- | :--- | :--- |
| API (`edumaster-api`) | `/` (raíz) | `railway.json` → `backend/Dockerfile`, healthcheck `/health` | `https://<TU-BACKEND>.up.railway.app` |
| Web (`edumaster-web`) | `frontend` | `frontend/railway.json` → build + `npm run start`, healthcheck `/health` | `https://<TU-FRONTEND>.up.railway.app` |

`<TU-BACKEND>` y `<TU-FRONTEND>` son marcadores: los sustituyes por los dominios que Railway te entregue en **Settings → Networking → Generate Domain**, sin barra final.

## Antes de empezar

- Repo: `https://github.com/Maxgab27/EduMaster-AI.git`, rama `main`.
- Usa tu cuenta de Railway y el botón **Deploy from GitHub repo** dos veces (una por servicio).
- **No pegues `DATABASE_URL`, tokens ni credenciales en el repo ni en el chat.** En Railway usa **Reference** para conectar variables entre servicios.
- No copies `frontend/.env.local` a Railway: contiene la IP de la Wi-Fi local y `127.0.0.1`.

## 1. Base de datos (recomendado: PostgreSQL de Railway)

1. En el proyecto: **New → Database → PostgreSQL**.
2. Railway crea la variable `DATABASE_URL` dentro de ese servicio de base de datos.
3. En el servicio de la API, añade una **Reference** a esa variable (paso 2.3).

El código ya soporta dos formatos:

- `postgres://…` o `postgresql://…` → `clean_database_url` lo convierte a `postgresql+asyncpg://…` (`asyncpg` ya está en `backend/requirements.txt`).
- Sin `DATABASE_URL`, cae a `sqlite+aiosqlite:///./edumaster_enterprise.db` dentro del contenedor.

**No hace falta crear tablas ni sembrar datos a mano:** `init_db()` crea el esquema al arrancar y `ensure_seed()` inserta los 3 folios sintéticos la primera vez que se consulta `/api/v1/compat/certificates` o `/api/v1/compat/certificates/verify/{folio}`.

> Si eliges SQLite sin volumen, los datos se pierden al redeployar. Para una sustentación corta funciona; para conservar la auditoría entre despliegues usa Postgres o un volumen montado en la ruta del `.db`.

## 2. API (backend activo)

1. **New Service → Deploy from GitHub repo** → selecciona el repo y deja **Root Directory = `/`**. El `railway.json` de la raíz ya define el Dockerfile y el healthcheck.
2. **Settings → Networking → Generate Domain**. Guarda `https://<TU-BACKEND>.up.railway.app`.
3. **Settings → Variables:**

   | Variable | Valor | Estado |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | Reference → servicio Postgres → `DATABASE_URL` | Recomendada |
   | `ENVIRONMENT` | `production` | Opcional |
   | `PUBLIC_FRONTEND_ORIGIN` | `https://<TU-FRONTEND>.up.railway.app` | Opcional; solo si ves error de CORS |
   | Variables `VITE_*` | — | No van aquí, van en el frontend |

   No definas `SECRET_KEY` ni credenciales de Supabase/OIDC: esta entrega es DEMO y no implementa autenticación real.

4. **Comprobación:** abre `https://<TU-BACKEND>.up.railway.app/health`. Debe mostrar `"status": "healthy"`, `"mode": "DEMO"` y `"database": "postgres"` si conectaste Postgres. Abre también `/api/v1/compat/certificates`: deben aparecer los folios `EDU-2026-98124`, `98125` y `98126`.

## 3. Web (frontend)

1. **New Service → Deploy from GitHub repo** → mismo repo → **Root Directory = `frontend`**.
2. Si Railway detecta `frontend/railway.json`, ya viene con:

   | Ajuste | Valor |
   | :--- | :--- |
   | Build Command | `npm ci && npm run build` |
   | Start Command | `npm run start` |
   | Healthcheck Path | `/health` |

   `npm run start` ejecuta `frontend/scripts/serve.mjs`: un servidor Node sin dependencias nuevas que sirve `frontend/dist`, respeta `$PORT` y devuelve `index.html` para rutas de la SPA. Si Railway no detecta el archivo de configuración, copia esos tres valores en **Settings → Build & Deploy**.

3. **Settings → Variables, antes de compilar:**

   | Variable | Valor | Estado |
   | :--- | :--- | :--- |
   | `VITE_CORE_API_BASE_URL` | `https://<TU-BACKEND>.up.railway.app` | **Obligatoria** para que el QR verifique por HTTP real |
   | `VITE_PUBLIC_ORIGIN` | sin definir | Correcto: el QR usa `window.location.origin` |
   | `VITE_API_BASE_URL` | sin definir | Correcto: los otros módulos siguen en DEMO local |

   Si defines `VITE_PUBLIC_ORIGIN` con una URL antigua, el QR apuntará a esa URL en vez del dominio nuevo. Si defines `VITE_API_BASE_URL`, cambias el modo global de la app.

4. **Settings → Networking → Generate Domain**. Guarda `https://<TU-FRONTEND>.up.railway.app`.
5. **Comprobación:** `https://<TU-FRONTEND>.up.railway.app/health` → `{"status":"ok","service":"edumaster-ai-frontend","mode":"DEMO"}`. Luego abre `/`: debe cargar el panel sin errores.

## 4. Prueba del QR desde el celular

1. En el escritorio entra a **Certificados → Ver QR / Folio**. El QR codifica
   `https://<TU-FRONTEND>.up.railway.app/?verify=EDU-2026-98124`.
2. Escanea con el celular usando **datos móviles** (desactiva la Wi-Fi): así compruebas que ya no depende de la IP `192.168.18.36`.
3. Resultado esperado: **“Folio válido · EDU-2026-98124”**, con mensaje `DEMO`, y evento `certificate.verify` en `/api/v1/compat/audit/logs`.
4. Pulsa **“Abrir comprobante (celular)”**: se abre `?receipt=EDU-2026-98124` en la misma SPA, con QR, datos, **“Guardar como PDF”** y **“Volver”**. No depende de ventanas emergentes.
5. Otros folios sintéticos: `EDU-2026-98125` y `EDU-2026-98126`.

## 5. Si algo falla

| Síntoma | Causa probable | Acción |
| :--- | :--- | :--- |
| “No se pudo contactar con la API” | `VITE_CORE_API_BASE_URL` ausente, con barra final o apuntando a `127.0.0.1` | Corrige la variable del frontend y **recompila** (las variables `VITE_*` se graban en el bundle). |
| Error de CORS en la consola | Dominio del frontend no aceptado | Añade `PUBLIC_FRONTEND_ORIGIN=https://<TU-FRONTEND>.up.railway.app` en la API y reinicia el servicio. |
| “Folio no encontrado” | Base nueva sin seed todavía | Llama una vez a `/api/v1/compat/certificates`; `ensure_seed()` inserta los 3 folios. |
| `/health` de la web en rojo | Falta `dist` o el Start Command es distinto | Confirma `npm ci && npm run build` y `npm run start`, y que Root Directory sea `frontend`. |
| Ruta directa da 404 | Servidor estático sin fallback | `scripts/serve.mjs` ya devuelve `index.html`; revisa que no estés sirviendo `dist` con otro comando. |
| `"database": "sqlite"` en la API | No conectaste Postgres | Añade la Reference de `DATABASE_URL` o acepta persistencia efímera. |

## 6. Límites honestos

- Es una demostración académica SENATI: datos sintéticos, certificados no oficiales, sin autenticación real. `X-Actor` es opcional y no prueba identidad.
- `confidence=0.94`, `calibrated_brier_score=0.082` y `PR-AUC=0.914` son constantes de la DEMO, no métricas medidas en Railway.
- Supabase/OIDC siguen pendientes; las 7 pruebas E2E con Playwright ya están versionadas y se ejecutan con `npm.cmd run test:e2e`. No se compartieron credenciales.
- `railway.json` es “Config as Code” y Railway lo marca como obsoleto a partir del **2026-12-01**; hoy sigue funcionando. La alternativa futura es `.railway/railway.ts` o configurar todo desde el dashboard. No se migró ahora para no tocar lo ya validado.
- Si quieres que actualice esta guía con tus dominios definitivos, pásamelos después del despliegue y reemplazo los marcadores.
