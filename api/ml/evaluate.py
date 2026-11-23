"""Evalua artefacto entrenado con metricas por tarea y baselines."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from baselines import LogisticBaseline, TreeBaseline  # noqa: E402
from demo_dataset import load_or_generate, split_temporal  # noqa: E402
from metrics import evaluate  # noqa: E402
from mtl_model import MTLModel  # noqa: E402


HERE = Path(__file__).resolve().parent


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluacion DEMO")
    parser.add_argument("--model", default=str(HERE / "artifacts" / "model.json"))
    parser.add_argument("--data", default=str(HERE / "artifacts" / "demo_dataset.json"))
    parser.add_argument("--size", type=int, default=240)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", default=None)
    args = parser.parse_args()

    model = MTLModel.load(args.model)
    records = load_or_generate(args.data, size=args.size, seed=args.seed)
    _, test = split_temporal(records)
    seed = int(model.config.get("seed", args.seed))

    result = {
        "label": "DEMO - metricas sobre dataset sintetico",
        "model": {
            "name": model.config["model_name"],
            "version": model.config["model_version"],
            "feature_schema_version": model.config["feature_schema_version"],
            "trained_epochs": model.trained_epochs,
        },
        "mtl_test": evaluate(test, model.predict),
        "logistic_test": evaluate(test, LogisticBaseline(seed=seed).fit(records).predict),
        "tree_test": evaluate(test, TreeBaseline(seed=seed).fit(records).predict),
    }
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).write_text(text, encoding="utf-8")
    print(text)


if __name__ == "__main__":
    main()
