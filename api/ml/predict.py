"""Inferencia local DEMO con artefacto entrenado."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from demo_dataset import StudentRecord, load_or_generate, to_feature_dict  # noqa: E402
from mtl_model import MTLModel  # noqa: E402


HERE = Path(__file__).resolve().parent


def main() -> None:
    parser = argparse.ArgumentParser(description="Inferencia local DEMO")
    parser.add_argument("--model", default=str(HERE / "artifacts" / "model.json"))
    parser.add_argument("--data", default=str(HERE / "artifacts" / "demo_dataset.json"))
    parser.add_argument("--student-id", default=None)
    parser.add_argument("--features", default=None, help="JSON con features autorizadas")
    parser.add_argument("--size", type=int, default=240)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    model = MTLModel.load(args.model)

    if args.features:
        payload = json.loads(args.features)
        record = StudentRecord(
            student_id=payload.get("student_id", "DEMO-LOCAL"),
            category=payload.get("category", "MATEMATICA"),
            active_days_14d=int(payload.get("active_days_14d", 0)),
            sessions_14d=int(payload.get("sessions_14d", 0)),
            completion_ratio=float(payload.get("completion_ratio", 0.0)),
            assessment_mean=float(payload.get("assessment_mean", 0.0)),
            assignment_late_rate=float(payload.get("assignment_late_rate", 0.0)),
            help_requests_14d=int(payload.get("help_requests_14d", 0)),
            event_sequence=tuple(payload.get("event_sequence", [])),
            finalizado=None,
            dominio=None,
            riesgo=None,
            recursos_relevantes=(),
        )
    else:
        records = load_or_generate(args.data, size=args.size, seed=args.seed)
        record = next(
            (r for r in records if r.student_id == args.student_id),
            records[0] if records else None,
        )
        if record is None:
            raise SystemExit("No hay registros en el dataset")

    result = {
        "label": "DEMO - inferencia tecnica, no nota oficial ni diagnostico",
        "student_id": record.student_id,
        "input_features": to_feature_dict(record),
        "prediction": model.predict(record),
        "explanation": model.explain(record),
        "model": {
            "name": model.config["model_name"],
            "version": model.config["model_version"],
            "feature_schema_version": model.config["feature_schema_version"],
        },
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
