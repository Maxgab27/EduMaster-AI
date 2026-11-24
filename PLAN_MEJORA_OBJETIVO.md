# Plan de mejora objetivo — EduMaster.ai

**Contexto:** proyecto académico de SENATI, 4.º semestre. Alcance real: demostración funcional para sustentación, no sistema de producción.  
**Fecha:** 2026-11-23.  
**Backend activo en el momento de las pruebas:** `backend/` (versión del compañero), en `http://127.0.0.1:8000`.  
**Frontend activo:** `frontend/`, en `http://127.0.0.1:5173`, en modo DEMO.

---

## 1. Pruebas ejecutadas

### 1.1 Backend (smoke test sobre el servicio en vivo)

Se ejecutó una batería de 25 comprobaciones HTTP contra el backend activo.

| Prueba | Resultado |
|---|---|
| `GET /health` → 200, `status=healthy`, `service=EduMaster.ai Enterprise API` | ✅ |
| `GET /openapi.json` → 6 rutas exactas | ✅ |
| Rutas expuestas | `/`, `/health`, `/api/v1/inference/dropout-risk`, `/api/v1/grades/submit`, `/api/v1/audit/logs`, `/api/v1/students/at-risk` |
| `GET /students/at-risk` devuelve lista con campos clave | ✅ |
| `POST /inference/dropout-risk` con payload correcto | ✅ |
| `probability` en `[0,1]`, `risk_level` válido, factores no vacíos | ✅ |
| Validación Pydantic: `avg_quiz_score=30` → 422 | ✅ |
| `POST /grades/submit` → 200, hash SHA-256 de 64 caracteres | ✅ |
| Registro generado en `/audit/logs` | ✅ |
| Resultado total | **25/25 pasaron** |

**Observaciones medidas durante las pruebas:**

1. El catálogo tiene **6 rutas**, no 44. El otro backend del repo (`api/`) no está activo.
2. El endpoint de inferencia **inserta/actualiza alumnos**: la lista pasó de 3 a 5 registros durante las pruebas. Es un efecto secundario real del `upsert`.
3. El payload que aparece en la guía PDF (`late_submissions`, `avg_score`) **no coincide** con el schema (`late_submissions_30d`, `avg_quiz_score`). Con el payload del PDF la respuesta sigue siendo 200 porque los campos extra se ignoran y se usan defaults, pero solo devolvió **2 factores** contra **4** del payload correcto.
4. `confidence=0.94` y `calibrated_brier_score=0.082` son **valores constantes** en el schema, no mediciones.
5. `POST /grades/submit` aceptó `teacher_id="docente-sin-autenticar"` sin credenciales. `/audit/logs` también respondió sin autenticación.
6. La firma SHA-256 es real como hash, pero su autoría depende de un campo del body.

### 1.2 Frontend (lint, build y ejecución real)

| Prueba | Comando / método | Resultado |
|---|---|---|
| Linter | `npm.cmd run lint` (oxlint) | **0 errores, 0 advertencias** |
| Build de producción | `npm.cmd run build` (`tsc -b && vite build`) | ✅ exitoso en **4.20 s** |
| Módulos transformados | Vite | 2166 |
| Bundle JS | `dist/assets/index-*.js` | 546.83 kB (**gzip 145.42 kB**) |
| Advertencia de build | Vite | chunk > 500 kB, **no bloqueante** |
| Carga en navegador | Chromium, `http://127.0.0.1:5173/` | ✅ renderiza, **0 errores de consola** |
| Badge visible | UI | `DATASET DEMO · SIN API` / `SIN API · DATOS SINTÉTICOS` |
| Métrica visible | UI | `PR-AUC (demo) 0.914 — métrica simulada` |

Conclusión de pruebas: **lo que existe funciona**. El problema no es que esté roto, sino que la documentación y la configuración dicen más de lo que el código realmente hace.

---

## 2. Hallazgos objetivos

| # | Hallazgo | Severidad | Evidencia |
|---|---|---|---|
| H1 | Conviven dos backends: `api/` (44 endpoints, contrato `{data, meta}`, RBAC/ABAC) y `backend/` (6 rutas, activo). `railway.json` apunta a `backend/`. | Alta | `git ls-tree`, `openapi.json` |
| H2 | El frontend real usa `apiClient.ts` con `VITE_API_BASE_URL`. Sin esa variable entra en DEMO. El `api.ts` del compañero apunta a `:8000`, pero **nadie lo importa**. | Alta | `grep` en `frontend/src` |
| H3 | No hay autenticación en `grades/submit` ni en `audit/logs`. | Alta | Prueba 5 y 6 del smoke |
| H4 | Documentación con afirmaciones no verificables: PyTorch/TorchScript, Redis Streams, PostgreSQL 16, "<15 ms", "220 MB", "70 % de ahorro", "100 % de éxito", "aprobado para producción". | Alta | PDFs revisados |
| H5 | `Dockerfile` instala PyTorch CPU aunque el código usa `try/except ImportError` y cae a NumPy. El tamaño de imagen no fue medido. | Media | `backend/Dockerfile`, `pytorch_engine.py` |
| H6 | La guía de pruebas usa nombres de campos incorrectos en CP-02. | Media | Smoke test, payload del PDF |
| H7 | Bundle de frontend sobre 500 kB; advertencia de Vite. | Baja | Build output |
| H8 | La UI muestra "Red Neuronal Multitarea PyTorch" aunque `torch` es opcional. Al menos está etiquetada como DEMO y sin medición de latencia. | Baja | Texto renderizado |

---

## 3. Decisión de backend

| Opción | Descripción | Ventaja real | Coste real | Adecuada para |
|---|---|---|---|---|
| **A. Mantener `backend/` como oficial** | Estado actual. 6 rutas, Docker/Railway listo. | Sustentación simple del caso de uso en 3 minutos. | La mayoría de módulos de la UI siguen en DEMO. Sin auth. | Sustentación académica corta. |
| **B. Mantener `api/` como oficial** | 44 endpoints, envelope, correlación, RBAC/ABAC, firma por actor. | Prácticamente toda la UI puede conectarse. | Requiere crear/adaptar Dockerfile y `railway.json`; requiere quitar PyTorch/SQLAlchemy/Redis del otro lado. | App completa funcionando. |
| **C. Cruce controlado (recomendado si el objetivo es "todo funcione")** | Código de `api/` + empaquetado de `backend/` adaptado. `backend/` queda como experimento o se elimina. | Funcionalidad + despliegue. | 1–2 días de trabajo. | Producto final consistente. |

**Recomendación objetiva:** para la sustentación inmediata de 4.º semestre alcanza con la **Opción A** aplicando P0. Si el objetivo es que el frontend deje de estar en DEMO, la opción técnica correcta es la **C**. No se recomienda borrar `api/` antes de decidir, porque contiene 38 rutas que no existen en `backend/`.

---

## 4. Factibilidad de plataformas

### Railway (plan de 1 GB)

| Ítem | Evaluación |
|---|---|
| FastAPI + Uvicorn + SQLAlchemy + SQLite | Viable, consumo bajo. |
| Instalar PyTorch CPU en el Dockerfile | **Desaconsejado**: el código no lo necesita (hay fallback NumPy) y aumenta imagen y memoria. No hay medición que respalde "<220 MB". |
| Base de datos en el mismo Railway | Desaconsejado con 1 GB si se añade PostgreSQL además de la app. |
| Base externa (Supabase) | **Viable y recomendable**: libera memoria de Railway. |
| `railway.json` actual | Correcto en `healthcheckPath: /health`; apunta a `backend/Dockerfile`. Debe apuntar al Dockerfile que se decida usar. |

**Conclusión:** Railway 1 GB **sí es viable**, siempre que se elimine PyTorch del build y la base de datos sea externa (Supabase) o SQLite local solo para DEMO.

### Vercel

| Ítem | Evaluación |
|---|---|
| Build de frontend | ✅ Probado: 4.20 s, sin errores de tipos. |
| Root Directory | Debe ser `frontend`. |
| Variable de entorno | Requiere `VITE_API_BASE_URL=<URL de Railway>`. Sin ella la app entra en DEMO por diseño. |
| Bundle >500 kB | Advertencia no bloqueante. Se puede mejorar con lazy imports, no es prioritario. |

**Conclusión:** Vercel **sí es viable** y ya compila. Solo falta configurar la URL del backend cuando se decida el contrato.

### Supabase

| Ítem | Evaluación |
|---|---|
| ¿Se puede usar? | **Sí**, por REST/PostgREST con `urllib`, sin ORM pesado. |
| Estado actual | **No configurado**. No hay `SUPABASE_URL`, service role key ni anon key en el repo. |
| Backend | Necesita service role key, configurada en Railway, nunca en el chat. |
| Frontend | Necesita anon key, configurada en Vercel. |
| RLS | Decisión previa: Fase 5 sin RLS real; debe documentarse como limitación. Para un despliegue real se recomendaría RLS. |
| ¿Bloquea la sustentación? | **No**. La DEMO local funciona sin Supabase. |

**Conclusión:** Supabase **sí se puede usar**, pero es Fase 5 y está bloqueada solo por credenciales y por la decisión de contrato de backend. No es necesaria para la sustentación de 4.º semestre.

---

## 5. Plan de mejora por prioridades

### P0 — Antes de la sustentación (1–2 h, obligatorio)

1. **Elegir un solo backend activo** y documentarlo en el README. Mientras tanto, no borrar el otro.
2. **Corregir los PDF/HTML** con generadores existentes:
   - Quitar "Aprobado para producción", "100 % de éxito", "PyTorch/TorchScript real", Redis/Celery/PostgreSQL, "220 MB", "<15 ms", "70 % de ahorro".
   - Cambiar esas cifras por "valores ilustrativos, no medidos".
   - Corregir el payload del CP-02 a `late_submissions_30d` y `avg_quiz_score`.
3. **Ajustar `/health`** para que reporte el motor real: `numpy-fallback` si `torch` no está instalado, y `label=DEMO`.
4. **Proteger la firma y la auditoría**: tomar `signedBy` de un header/token, no del body; exigir al menos `X-Actor`/`X-Role` para `grades/submit` y `audit/logs`.
5. **Quitar `torch` del Dockerfile** si se mantiene `backend/`. El fallback NumPy ya está implementado.
6. **Declarar el modo DEMO en el launcher**: si no se configura `VITE_API_BASE_URL`, que el `.bat` diga explícitamente "frontend en DEMO, backend disponible en Swagger".

### P1 — Si hay un día más (recomendable)

7. **Mover el smoke test al repo** como `backend/tests/test_smoke.py` para que "pruebas pasaron" tenga evidencia versionada.
8. **Conectar frontend y backend elegidos**:
   - Con Opción A: dejar la UI en DEMO y sustentar el backend por Swagger; no prometer integración.
   - Con Opción C: configurar `VITE_API_BASE_URL` y verificar módulos uno por uno.
9. **Reducir el bundle** con lazy imports de vistas pesadas (Analítica, Redes Neuronales, Gobernanza). No bloqueante.
10. **Documentar el efecto secundario de `/inference`**: inserta alumnos en la BD. Si no se desea, separar simulación de persistencia.

### P2 — Fase 5 (solo con credenciales)

11. Supabase REST con service role key en Railway; base limpia, sin semillas sintéticas.
12. Supabase Auth/OIDC: frontend envía Bearer; backend verifica JWT; `signedBy` = actor autenticado.
13. Quitar fallbacks en memoria de certificados y auditoría cuando la base real esté activa.
14. Desplegar: Railway sin PyTorch + Vercel con `VITE_API_BASE_URL` + Supabase como base externa.
15. Medir antes de afirmar: tamaño de imagen, latencia real, tamaño de bundle y resultados de tests.

---

## 6. Criterios de aceptación mínimos para sustentar

- [x] Backend responde `/health` y `/docs`.
- [x] Frontend compila y abre sin errores de consola.
- [x] La demo explica que los datos son sintéticos.
- [ ] La documentación coincide con el código que se está mostrando.
- [ ] La firma docente no depende de un `teacher_id` cualquiera del body.
- [ ] Queda claro qué backend se está usando y por qué.

**Regla final:** para SENATI 4.º semestre no hace falta "producción". Hace falta que funcione, que se pueda explicar y que no se diga algo que el código no hace.
