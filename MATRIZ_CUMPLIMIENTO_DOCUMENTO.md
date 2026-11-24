# Matriz de cumplimiento — EduMaster.ai

**Proyecto académico · SENATI 4.º semestre · Noviembre 2026**

Fuentes:
- `EduMaster_AI_Informe_Ejecutivo.pdf` (11 páginas) — diseño original.
- `EduMaster_AI_Caso_de_Uso_Estrategico.pdf` (4 páginas) — alcance acotado del compañero.

**Alcance real evaluado:** backend `backend/` activo en `127.0.0.1:8000` (6 rutas) y frontend `frontend/` en `127.0.0.1:5173` en modo DEMO.

**Leyenda:** ✅ cumplido · ◐ parcial · ❌ no cumplido

> Nota de alcance: el informe original describe el diseño deseado completo. Por la restricción de 1 GB de Railway se implementó un solo caso de uso (riesgo de abandono + SpeedGrader). El resto se documenta como fases posteriores.

---

## 1. Contra el informe original

| # | Lo que pide el documento | Estado | Evidencia real |
|---|---|---|---|
| 1 | React 19 + TypeScript + Vite | ✅ | `package.json`: React 19.3.1, TS 7, Vite 8. Build OK en 4.20 s |
| 2 | Tailwind + primitivos accesibles shadcn/ui | ◐ | Tailwind sí; no hay dependencias shadcn/Radix |
| 3 | Grafo neuronal aislado en Canvas/WebGL con `requestAnimationFrame` | ◐ | `NeuralVisualizer.tsx` usa `requestAnimationFrame`, pero dibuja en SVG, no Canvas/WebGL |
| 4 | FastAPI + Pydantic v2 | ✅ | Backend activo; validación real (`avg_quiz_score=30` → 422) |
| 5 | PostgreSQL con UUID, RLS y particionamiento | ❌ | SQLite local activo; Supabase sin configurar |
| 6 | Transactional Outbox + Redis Streams + Celery | ❌ | `REDIS_URL` existe solo en `config.py`, `.env.example` y requirements; sin implementar |
| 7 | PyTorch real (`torch.nn`) entrenado | ❌ | `pytorch_engine.py` usa fallback a NumPy; no hay modelo `.pt` |
| 8 | MLflow + DVC + S3 | ❌ | No existe en el repo |
| 9 | Métricas rotuladas `DEMO` (transparencia activa) | ✅ | Badge `DATASET DEMO · SIN API`, `PR-AUC (demo) 0.914 — métrica simulada` |
| 10 | Prohibido simular actividad algorítmica; mostrar "Sin conexión" | ◐ | Está rotulado como demo, pero el visualizador sigue animando pulsos "Forward 1x" |
| 11 | Non-goals: sin biometría, sin emociones, sin reentrenamiento automático | ✅ | No existe ninguna de esas funciones |
| 12 | Human-in-the-loop: el docente firma la nota | ◐ | UI de SpeedGrader sí; backend acepta `teacher_id="docente-sin-autenticar"` del body |
| 13 | RBAC/ABAC en backend | ◐ | Existe en `api/` (headers X-Role/X-Actor, modo demo), pero ese backend no está activo; el activo no tiene auth |
| 14 | Multi-tenancy con `organization_id` + RLS | ❌ | No hay `organization_id` en el backend activo |
| 15 | MTL de 4 cabezas + rama GRU + capa de fusión | ❌ | Solo hay inferencia de riesgo (Cabeza C) por función; las 4 cabezas se dibujan en la UI |
| 16 | Baselines interpretables antes de publicar la red | ❌ | No hay LogReg, árboles ni XGBoost |
| 17 | DataOps: split temporal, ventanas estrictas, ≥98% completitud | ❌ | No hay pipeline ETL; datos sintéticos en `localStorage` |
| 18 | Ley 29733: consentimiento expreso y derechos ARCO | ❌ | Panel de gobernanza solo informativo; no hay flujo ARCO real |
| 19 | Auditoría inmutable | ◐ | `audit_logs` + hash SHA-256 de 64 chars sí son reales; pero endpoint público y SQLite local |
| 20 | KPIs desde vistas materializadas + nav protegida por JWT | ❌ | KPIs de `mockData.ts`; roles solo en frontend |
| 21 | Cambiar "Ingresos" por horas efectivas | ✅ | UI muestra `HORAS DE APRENDIZAJE` |
| 22 | SSE/WebSocket + ciclo de actualización en 6 etapas | ❌ | UI dice `SINCRONIZACIÓN SIMULADA`; no hay WS/SSE en backend |
| 23 | SOPs completos (matrícula, recomendación, certificados QR) | ◐ | Módulos visibles; QR ilustrativo, no escaneable (`certificatesApi.ts`) |
| 24 | DoD: pruebas unitarias/E2E, CI/CD, OWASP, canary, RPO/RTO | ❌ | Solo lint + build + smoke test (no versionado) |

**Resultado:** 5 cumplidos · 7 parciales · 12 no cumplidos (de 24 requisitos).

---

## 2. Contra el caso de uso estratégico del compañero

| Requisito | Estado | Evidencia real |
|---|---|---|
| Caso acotado: deserción + SpeedGrader | ✅ | Es lo que corre en el backend de 6 rutas |
| Frontend compila para Vercel | ✅ | `npm.cmd run build` exitoso; `vercel.json` existe |
| Backend "ligero" en Railway | ◐ | Dockerfile ya sin PyTorch; despliegue y consumo real aún no medidos |
| Cifras: 220 MB, 75 MB RAM, <20 ms, 84.2/11.6/4.2% | ❌ | No medidas; `confidence=0.94` y `brier=0.082` son constantes en el schema |
| URL de API en Vercel | ◐ | Falta `VITE_API_BASE_URL`; sin eso la UI entra en DEMO (estado actual) |
| Guion de demo ante el docente | ✅ | Dashboard → Analítica → SpeedGrader → Audit Logs ejecutable en local |

---

## 3. Evidencia de pruebas (2026-11-23)

- Backend: **25/25** comprobaciones HTTP pasaron.
- Fallback sin torch: `HAS_TORCH=False`, `model=None`, probability `0.7474`, 4 factores → funciona.
- Frontend: lint 0 errores, build en 4.20 s, 2166 módulos, bundle 546.83 kB / gzip 145.42 kB.
- Navegador: 0 errores de consola, badge `DATASET DEMO · SIN API` visible.

---

## 4. Frase para sustentar

> "El informe original describe el diseño deseado a completo; por la restricción de 1 GB de Railway se acotó la implementación a un caso de uso: detección de riesgo con firma docente. El resto queda documentado como fases posteriores."

## 5. No afirmar

- "Cumple el informe técnico enterprise".
- "PyTorch/TorchScript real", "Redis Streams", "RLS", "MLflow", "DVC".
- "Aprobado para producción", "220 MB", "<20 ms", "99.9% de estabilidad".
