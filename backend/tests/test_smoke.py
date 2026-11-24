"""Smoke test del backend activo (solo stdlib).

Uso:
    python backend/tests/test_smoke.py

Variables opcionales:
    SMOKE_BASE_URL   URL base del API (default http://127.0.0.1:8000)
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

BASE = os.getenv("SMOKE_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
results = []


def check(name, condition, detail=""):
    results.append((name, bool(condition), detail))
    print(("PASS  " if condition else "FAIL  ") + name + (" | " + detail if detail else ""))


def request(method, path, payload=None, headers=None):
    data = None
    all_headers = dict(headers or {})
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        all_headers["Content-Type"] = "application/json"
    req = urllib.request.Request(BASE + path, data=data, headers=all_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        try:
            body = json.loads(body)
        except Exception:
            pass
        return exc.code, body


# ---------------------------------------------------------------- health
status, health = request("GET", "/health")
check("GET /health responde 200", status == 200, f"status={status}")
check("health.status = healthy", health.get("status") == "healthy", str(health.get("status")))
check("health.service correcto", health.get("service") == "EduMaster.ai Enterprise API", str(health.get("service")))
check("health.mode = DEMO", health.get("mode") == "DEMO", str(health.get("mode")))
check("health.dataset = sintético", health.get("dataset") == "sintético", str(health.get("dataset")))
check("health.engine es real", health.get("engine") in {"torch", "numpy-fallback"}, str(health.get("engine")))
check("health.database = sqlite", health.get("database") == "sqlite", str(health.get("database")))
check("health.protocol = HTTP/1.1", health.get("protocol") == "HTTP/1.1", str(health.get("protocol")))

# ---------------------------------------------------------------- catálogo
status, spec = request("GET", "/openapi.json")
paths = list(spec.get("paths", {}).keys()) if isinstance(spec, dict) else []
check("GET /openapi.json responde 200", status == 200, f"status={status}")
check("catálogo tiene 6 rutas", len(paths) == 6, f"rutas={paths}")

# ---------------------------------------------------------------- alumnos
status, students = request("GET", "/api/v1/students/at-risk")
check("GET /students/at-risk responde 200", status == 200, f"status={status}")
check("devuelve al menos 3 estudiantes", isinstance(students, list) and len(students) >= 3,
      f"n={len(students) if isinstance(students, list) else 'no-lista'}")
if isinstance(students, list) and students:
    first = students[0]
    check("estudiante tiene campos clave",
          all(k in first for k in ("student_id", "name", "dropout_risk_score", "risk_level")),
          str(sorted(first.keys())))
    check("riesgo en rango 0-1", 0 <= first.get("dropout_risk_score", -1) <= 1,
          str(first.get("dropout_risk_score")))

# ---------------------------------------------------------------- inferencia
good_payload = {
    "student_id": "std-smoke-001",
    "sessions_14d": 2,
    "late_submissions_30d": 4,
    "unexcused_absences": 5,
    "avg_quiz_score": 9.5,
    "hours_active_weekly": 2.0,
}
status, prediction = request("POST", "/api/v1/inference/dropout-risk", good_payload)
check("POST /inference/dropout-risk responde 200", status == 200, f"status={status}")
check("probability en rango", isinstance(prediction.get("probability"), float)
      and 0 <= prediction["probability"] <= 1, str(prediction.get("probability")))
check("risk_level válido", prediction.get("risk_level") in {"Bajo", "Moderado", "Crítico"},
      str(prediction.get("risk_level")))
check("dominant_factors no vacío", len(prediction.get("dominant_factors", [])) > 0,
      f"n={len(prediction.get('dominant_factors', []))}")
check("métricas fijas presentes",
      prediction.get("confidence") == 0.94 and prediction.get("calibrated_brier_score") == 0.082,
      "confidence=0.94, brier=0.082 (constantes)")

doc_payload = {
    "student_id": "std-402",
    "sessions_14d": 2,
    "late_submissions": 3,
    "unexcused_absences": 4,
    "avg_score": 9.5,
}
status, doc_prediction = request("POST", "/api/v1/inference/dropout-risk", doc_payload)
check("payload del PDF también responde 200", status == 200, f"status={status}")
check("payload del PDF pierde 2 variables",
      len(doc_prediction.get("dominant_factors", [])) < len(prediction.get("dominant_factors", [])),
      f"factores_pdf={len(doc_prediction.get('dominant_factors', []))} vs correctos={len(prediction.get('dominant_factors', []))}")

invalid_payload = dict(good_payload, avg_quiz_score=30)
status, _ = request("POST", "/api/v1/inference/dropout-risk", invalid_payload)
check("variable fuera de rango da 422", status == 422, f"status={status}")

# ---------------------------------------------------------------- firma docente
stamp = time.time_ns()
submission_id = f"sub-smoke-{stamp}"
grade_payload = {
    "submission_id": submission_id,
    "official_score": 17.5,
    "teacher_feedback": "Rúbrica revisada y nota validada por el docente.",
    "teacher_id": "docente-sin-autenticar",
    "rubric_scores": {"logica": 5, "estilo": 4, "comentarios": 4, "tests": 4.5},
}
status, grade = request("POST", "/api/v1/grades/submit", grade_payload)
check("POST /grades/submit responde 200", status == 200, f"status={status}")
signature = str(grade.get("signature_hash", ""))
check("hash SHA-256 de 64 caracteres", len(signature) == 64, f"len={len(signature)}")
check("firma atribuida al teacher_id del body", grade.get("signed_by") == "docente-sin-autenticar",
      str(grade.get("signed_by")))
check("actor_source marca origen no verificado", grade.get("actor_source") == "body_unverified",
      str(grade.get("actor_source")))

header_submission_id = f"sub-smoke-header-{stamp}"
header_payload = dict(grade_payload, submission_id=header_submission_id)
status, header_grade = request("POST", "/api/v1/grades/submit", header_payload,
                               headers={"X-Actor": "docente-header", "X-Role": "docente"})
check("firma con X-Actor responde 200", status == 200, f"status={status}")
check("X-Actor tiene prioridad sobre el body", header_grade.get("signed_by") == "docente-header",
      str(header_grade.get("signed_by")))
check("actor_source = header", header_grade.get("actor_source") == "header",
      str(header_grade.get("actor_source")))

# ---------------------------------------------------------------- auditoría
status, logs = request("GET", "/api/v1/audit/logs?limit=200")
check("GET /audit/logs responde 200", status == 200, f"status={status}")
check("audit devuelve lista", isinstance(logs, list), type(logs).__name__)
if isinstance(logs, list):
    match = [row for row in logs if row.get("resource") == f"submission:{submission_id}"]
    check("queda registro de la firma", len(match) > 0, f"coincidencias={len(match)}")
    if match:
        details = match[0].get("details") or {}
        check("auditoría guarda actor_source", details.get("actor_source") == "body_unverified",
              str(details.get("actor_source")))
    check("registro de auditoría público", status == 200, "sin credenciales")

passed = sum(1 for _, ok, _ in results if ok)
print("\nRESUMEN:", f"{passed}/{len(results)} pruebas pasaron")
sys.exit(0 if passed == len(results) else 1)
