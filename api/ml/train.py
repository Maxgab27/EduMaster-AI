"""Entrena el modelo MTL DEMO y guarda artefactos + informe de comparacion."""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from baselines import LogisticBaseline, TreeBaseline  # noqa: E402
from demo_dataset import load_or_generate, save_dataset, split_temporal  # noqa: E402
from metrics import evaluate  # noqa: E402
from mtl_model import MTLModel  # noqa: E402


HERE = Path(__file__).resolve().parent


def main() -> None:
    parser = argparse.ArgumentParser(description="Entrenamiento DEMO de EduMaster MTL")
    parser.add_argument("--config", default=str(HERE / "config.json"))
    parser.add_argument("--data", default=None, help="Dataset JSON opcional; si no existe se genera DEMO")
    parser.add_argument("--size", type=int, default=240)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", default=str(HERE / "artifacts" / "model.json"))
    parser.add_argument("--report", default=str(HERE / "artifacts" / "evaluation.json"))
    parser.add_argument("--save-dataset", default=str(HERE / "artifacts" / "demo_dataset.json"))
    args = parser.parse_args()

    config = json.loads(Path(args.config).read_text(encoding="utf-8"))
    seed = int(config.get("seed", args.seed))
    records = load_or_generate(args.data, size=args.size, seed=seed)
    save_dataset(records, args.save_dataset)
    train, test = split_temporal(records)

    started = time.time()
    model = MTLModel(config).fit(train, verbose=True)
    training_seconds = round(time.time() - started, 3)
    model.save(args.output)

    logistic = LogisticBaseline(seed=seed).fit(train)
    tree = TreeBaseline(seed=seed).fit(train)

    report = {
        "label": "DEMO - comparacion tecnica sobre datos sinteticos, no evidencia pedagogica",
        "dataset": {
            "source": args.data or "synthetic_demo_v1",
            "rows": len(records),
            "train_rows": len(train),
            "test_rows": len(test),
            "split": "temporal 70/30",
        },
        "model": {
            "name": config["model_name"],
            "version": config["model_version"],
            "trained_epochs": model.trained_epochs,
            "training_seconds": training_seconds,
            "loss_last": round(model.train_loss_history[-1], 4) if model.train_loss_history else None,
            "temperature": model.temperature,
            "decision_thresholds": model.thresholds,
            "lambdas": config["lambdas"],
        },
        "mtl_train": evaluate(train, model.predict),
        "mtl_test": evaluate(test, model.predict),
        "baselines_test": {
            "logistic_regression": evaluate(test, logistic.predict),
            "gradient_boosting_stumps": evaluate(test, tree.predict),
        },
        "publication_decision": (
            "DEMO: no publicar. Comparar en dataset real, validar calibracion/equidad/coste "
            "y obtener aprobacion de responsable tecnico y dueno funcional."
        ),
    }
    Path(args.report).parent.mkdir(parents=True, exist_ok=True)
    Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "artifact": args.output,
        "report": args.report,
        "training_seconds": training_seconds,
        "mtl_test": report["mtl_test"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
