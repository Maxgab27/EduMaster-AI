# EduMaster.ai API DEMO

Backend mínimo que implementa la **lógica del documento** sin PyTorch, pensado para el plan Free de Railway.

## Estado

- **DEMO**: datos sintéticos, sin autenticación real, sin base de datos, sin entrenamiento en caliente.
- El artefacto `ml/artifacts/model.json` se entrega entrenado; la API solo carga y hace inferencia.
- La metadata de cada respuesta lleva `source: "api"` y la etiqueta DEMO.
- Auditoría en memoria: se pierde al reiniciar el servicio.

## Lógica implementada (sección 9 del documento)

- Baselines interpretables primero: regresión logística y gradient boosting de decision stumps.
- Red multitarea compacta en Python puro:
  - rama tabular normalizada + categoria one-hot,
  - rama temporal tipo GRU sobre secuencias de eventos,
  - fusión compartida,
  - Cabeza A finalización, B dominio ordinal, C riesgo de desconexión, D ranking de recursos.
- Pérdida multitarea ponderada con **mascarado** de etiquetas ausentes.
- Early stopping por validación temporal, calibración de temperatura y umbrales por caso de uso.
- Métricas por tarea: ROC-AUC, PR-AUC, F1, recall, Brier, calibración, macro-F1, balanced accuracy, MAE ordinal, NDCG@K, recall@K, cobertura y diversidad.
- Reglas de negocio después del modelo: disponibilidad, umbral de score y diversidad.
- Guardrails: estimación no es certeza, no es nota oficial, riesgo solo para apoyo humano, explicación sin causalidad.

> El informe `ml/artifacts/evaluation.json` compara MTL contra baselines. En datos DEMO el baseline gana en varias tareas, por lo que la decisión registrada es **no publicar**. Eso es coherente con el documento: no se despliega una red solo por ser red.

## Ejecutar local

```powershell
cd api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Probar:

```powershell
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/v1/neural/status
```

Inferencia de ejemplo:

```powershell
curl -X POST http://127.0.0.1:8000/api/v1/neural/inference ^
  -H "Content-Type: application/json" ^
  -d "{\"features\":{\"student_id\":\"EST-DEMO-01\",\"category\":\"MATEMATICA\",\"active_days_14d\":9,\"sessions_14d\":13,\"completion_ratio\":0.94,\"assessment_mean\":0.82,\"assignment_late_rate\":0.2,\"help_requests_14d\":1,\"event_sequence\":[\"login\",\"content_view\",\"activity_complete\"]}}"
```

## Reentrenar

```powershell
python api\ml\train.py
python api\ml\evaluate.py
python api\ml\predict.py --student-id EST-0001
```

## Endpoints

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/health` | Salud del servicio |
| GET | `/api/v1/dashboard/summary` | KPIs DEMO compatibles con el frontend |
| GET | `/api/v1/neural/status` | Estado, hiperparámetros y decisión de publicación |
| GET | `/api/v1/ml/models` | Métricas MTL vs baselines |
| POST | `/api/v1/neural/inference` | Inferencia con features autorizadas |
| POST | `/api/v1/recommendations/feedback` | Registro DEMO de feedback |
| GET | `/api/v1/audit/logs` | Auditoría DEMO en memoria |

## Railway Free

- Un servicio API con `Procfile`/`railway.json`.
- El frontend debe desplegarse en Vercel/Cloudflare y apuntar con `VITE_API_BASE_URL`.
- Sin PyTorch, sin Redis, sin worker: el Free de 0.5 GB no garantiza `torch`.
- El servicio duerme tras inactividad; la primera petición puede tardar unos segundos.
- Para producción real harían falta OIDC/OAuth2, Postgres, secretos, auditoría persistente, MLflow/Registry y aprobación humana explicitamente implementada.

## Conexión con el frontend

El frontend ya usa `VITE_API_BASE_URL`. Si está vacío usa su adaptador DEMO local. Si se define, consume:

```text
{VITE_API_BASE_URL}/api/v1/dashboard/summary
```

El contrato `ApiResponse<T>` coincide con `frontend/src/types/index.ts`.
