"""Baselines interpretables requeridos antes de publicar la red neuronal.

Incluye:
- regresion logistica/multinomial simple sobre variables agregadas,
- gradient boosting de decision stumps (arboles poco profundos).

Ambas son DEMO y usan el mismo dataset sintetico que el modelo MTL.
"""

from __future__ import annotations

import math
import random
from typing import Any

from demo_dataset import MASTERY_LEVELS, StudentRecord
from mtl_model import NUMERIC_KEYS, NUMERIC_MAX, RESOURCE_COUNT, softmax


def _raw_features(record: StudentRecord) -> list[float]:
    return [
        float(record.active_days_14d) / NUMERIC_MAX[0],
        float(record.sessions_14d) / NUMERIC_MAX[1],
        float(record.completion_ratio) / NUMERIC_MAX[2],
        float(record.assessment_mean) / NUMERIC_MAX[3],
        float(record.assignment_late_rate) / NUMERIC_MAX[4],
        float(record.help_requests_14d) / NUMERIC_MAX[5],
    ]


def _stats(records: list[StudentRecord]) -> dict[str, list[float]]:
    result: dict[str, list[float]] = {}
    for i, key in enumerate(NUMERIC_KEYS):
        values = [_raw_features(r)[i] for r in records]
        mean = sum(values) / max(len(values), 1)
        var = sum((v - mean) ** 2 for v in values) / max(len(values), 1)
        result[key] = [mean, max(math.sqrt(var), 1e-3)]
    return result


def _normalize(values: list[float], stats: dict[str, list[float]]) -> list[float]:
    return [
        (value - stats[key][0]) / stats[key][1]
        for value, key in zip(values, NUMERIC_KEYS)
    ]


class LogisticBaseline:
    """Baseline lineal interpretable con las mismas cuatro salidas."""

    name = "logistic_regression_demo"
    version = "0.1.0-demo"

    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)
        self.stats: dict[str, list[float]] = {}
        self.w_a = [0.0] * 6
        self.b_a = 0.0
        self.w_b = [[0.0] * 6 for _ in MASTERY_LEVELS]
        self.b_b = [0.0] * len(MASTERY_LEVELS)
        self.w_c = [0.0] * 6
        self.b_c = 0.0
        self.item_bias = [0.0] * RESOURCE_COUNT
        self.type_bias = [0.0] * 4

    def _features(self, record: StudentRecord) -> list[float]:
        return _normalize(_raw_features(record), self.stats)

    @staticmethod
    def _sigmoid(x: float) -> float:
        return 1.0 / (1.0 + math.exp(-x)) if x >= 0 else math.exp(x) / (1.0 + math.exp(x))

    def fit(self, records: list[StudentRecord], epochs: int = 250, lr: float = 0.04) -> "LogisticBaseline":
        self.stats = _stats(records)
        indices = list(range(len(records)))
        for epoch in range(epochs):
            self.rng.shuffle(indices)
            for idx in indices:
                r = records[idx]
                x = self._features(r)
                if r.finalizado is not None:
                    p = self._sigmoid(sum(w * v for w, v in zip(self.w_a, x)) + self.b_a)
                    d = p - float(r.finalizado)
                    for i in range(6):
                        self.w_a[i] -= lr * (d * x[i] + 0.001 * self.w_a[i])
                    self.b_a -= lr * d
                if r.riesgo is not None:
                    p = self._sigmoid(sum(w * v for w, v in zip(self.w_c, x)) + self.b_c)
                    d = p - float(r.riesgo)
                    for i in range(6):
                        self.w_c[i] -= lr * (d * x[i] + 0.001 * self.w_c[i])
                    self.b_c -= lr * d
                if r.dominio is not None:
                    logits = [sum(w * v for w, v in zip(row, x)) + b for row, b in zip(self.w_b, self.b_b)]
                    probs = softmax(logits)
                    for j in range(len(MASTERY_LEVELS)):
                        d = probs[j] - (1.0 if j == r.dominio else 0.0)
                        for i in range(6):
                            self.w_b[j][i] -= lr * (d * x[i] + 0.001 * self.w_b[j][i])
                        self.b_b[j] -= lr * d
                if r.recursos_relevantes:
                    relevant = {int(rid[-3:]) for rid in r.recursos_relevantes}
                    for pos in relevant:
                        neg = (pos + 3) % RESOURCE_COUNT
                        if neg in relevant:
                            continue
                        base = sum(w * v for w, v in zip(self.w_a, x))
                        s_pos = base + self.item_bias[pos] + self.type_bias[pos % 4]
                        s_neg = base + self.item_bias[neg] + self.type_bias[neg % 4]
                        d = self._sigmoid(s_pos - s_neg) - 1.0
                        self.item_bias[pos] -= lr * d
                        self.item_bias[neg] += lr * d
                        self.type_bias[pos % 4] -= lr * d
                        self.type_bias[neg % 4] += lr * d
        return self

    def predict(self, record: StudentRecord) -> dict[str, Any]:
        x = self._features(record)
        completion = self._sigmoid(sum(w * v for w, v in zip(self.w_a, x)) + self.b_a)
        risk = self._sigmoid(sum(w * v for w, v in zip(self.w_c, x)) + self.b_c)
        logits = [sum(w * v for w, v in zip(row, x)) + b for row, b in zip(self.w_b, self.b_b)]
        probs = softmax(logits)
        base = sum(w * v for w, v in zip(self.w_a, x))
        items = [
            {
                "resource_id": f"REC-{idx:03d}",
                "score": round(base + self.item_bias[idx] + self.type_bias[idx % 4], 4),
            }
            for idx in range(RESOURCE_COUNT)
        ]
        return {
            "completion_probability": round(completion, 4),
            "mastery_probabilities": {level: round(p, 4) for level, p in zip(MASTERY_LEVELS, probs)},
            "mastery_level": MASTERY_LEVELS[max(range(len(probs)), key=lambda i: probs[i])],
            "dropout_risk_probability": round(risk, 4),
            "resource_ranking": sorted(items, key=lambda i: i["score"], reverse=True),
        }


def _fit_stump(X: list[list[float]], residual: list[float]) -> dict[str, Any]:
    best: dict[str, Any] = {"loss": float("inf")}
    n_features = len(X[0]) if X else 0
    for feature in range(n_features):
        thresholds = sorted({row[feature] for row in X})
        if len(thresholds) > 12:
            step = max(1, len(thresholds) // 12)
            thresholds = thresholds[::step]
        for threshold in thresholds:
            left = [residual[i] for i, row in enumerate(X) if row[feature] <= threshold]
            right = [residual[i] for i, row in enumerate(X) if row[feature] > threshold]
            if not left or not right:
                continue
            left_value = sum(left) / len(left)
            right_value = sum(right) / len(right)
            loss = sum((v - left_value) ** 2 for v in left) + sum((v - right_value) ** 2 for v in right)
            if loss < best["loss"]:
                best = {
                    "loss": loss,
                    "feature": feature,
                    "threshold": threshold,
                    "left": left_value,
                    "right": right_value,
                }
    return best


class TreeBaseline:
    """Gradient boosting de stumps: arboles interpretables y baratos."""

    name = "gradient_boosting_stumps_demo"
    version = "0.1.0-demo"

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.stats: dict[str, list[float]] = {}
        self.models: dict[str, dict[str, Any]] = {}

    def _features(self, record: StudentRecord) -> list[float]:
        return _normalize(_raw_features(record), self.stats)

    @staticmethod
    def _sigmoid(x: float) -> float:
        return 1.0 / (1.0 + math.exp(-x)) if x >= 0 else math.exp(x) / (1.0 + math.exp(x))

    @staticmethod
    def _stump_predict(stump: dict[str, Any], x: list[float]) -> float:
        return stump["left"] if x[stump["feature"]] <= stump["threshold"] else stump["right"]

    def _fit_binary(self, X: list[list[float]], y: list[float], n_estimators: int = 8,
                    lr: float = 0.5) -> dict[str, Any]:
        mean = sum(y) / max(len(y), 1)
        base = math.log(max(mean, 1e-6) / max(1 - mean, 1e-6))
        F = [base] * len(y)
        stumps: list[dict[str, Any]] = []
        for _ in range(n_estimators):
            residual = [yi - self._sigmoid(fi) for yi, fi in zip(y, F)]
            stump = _fit_stump(X, residual)
            preds = [self._stump_predict(stump, row) for row in X]
            denom = sum(p * p for p in preds) + 1e-9
            gamma = sum(r * p for r, p in zip(residual, preds)) / denom
            stump["gamma"] = gamma
            stumps.append(stump)
            F = [fi + lr * gamma * p for fi, p in zip(F, preds)]
        return {"base": base, "stumps": stumps, "lr": lr}

    def _fit_regression(self, X: list[list[float]], y: list[float], n_estimators: int = 8,
                        lr: float = 0.5) -> dict[str, Any]:
        base = sum(y) / max(len(y), 1)
        F = [base] * len(y)
        stumps: list[dict[str, Any]] = []
        for _ in range(n_estimators):
            residual = [yi - fi for yi, fi in zip(y, F)]
            stump = _fit_stump(X, residual)
            preds = [self._stump_predict(stump, row) for row in X]
            denom = sum(p * p for p in preds) + 1e-9
            gamma = sum(r * p for r, p in zip(residual, preds)) / denom
            stump["gamma"] = gamma
            stumps.append(stump)
            F = [fi + lr * gamma * p for fi, p in zip(F, preds)]
        return {"base": base, "stumps": stumps, "lr": lr}

    def fit(self, records: list[StudentRecord]) -> "TreeBaseline":
        self.stats = _stats(records)
        X = [self._features(r) for r in records]
        if any(r.finalizado is not None for r in records):
            self.models["completion"] = self._fit_binary(
                X, [float(r.finalizado or 0) for r in records]
            )
        if any(r.riesgo is not None for r in records):
            self.models["risk"] = self._fit_binary(
                X, [float(r.riesgo or 0) for r in records]
            )
        if any(r.dominio is not None for r in records):
            self.models["mastery"] = self._fit_regression(
                X, [float(r.dominio or 0) for r in records]
            )
        return self

    def _predict_binary(self, model: dict[str, Any], x: list[float]) -> float:
        value = model["base"]
        for stump in model["stumps"]:
            value += model["lr"] * stump["gamma"] * self._stump_predict(stump, x)
        return self._sigmoid(value)

    def _predict_regression(self, model: dict[str, Any], x: list[float]) -> float:
        value = model["base"]
        for stump in model["stumps"]:
            value += model["lr"] * stump["gamma"] * self._stump_predict(stump, x)
        return value

    def predict(self, record: StudentRecord) -> dict[str, Any]:
        x = self._features(record)
        completion = self._predict_binary(self.models["completion"], x)
        risk = self._predict_binary(self.models["risk"], x)
        mastery_value = self._predict_regression(self.models["mastery"], x)
        mastery_idx = max(0, min(len(MASTERY_LEVELS) - 1, int(round(mastery_value))))
        probs = [0.02] * len(MASTERY_LEVELS)
        probs[mastery_idx] = 0.94
        total = sum(probs)
        probs = [p / total for p in probs]
        base = 0.5 * record.completion_ratio + 0.3 * record.assessment_mean - 0.2 * record.assignment_late_rate
        items = [
            {
                "resource_id": f"REC-{idx:03d}",
                "score": round(base + (0.15 if idx % 4 == mastery_idx else 0.0), 4),
            }
            for idx in range(RESOURCE_COUNT)
        ]
        return {
            "completion_probability": round(completion, 4),
            "mastery_probabilities": {level: round(p, 4) for level, p in zip(MASTERY_LEVELS, probs)},
            "mastery_level": MASTERY_LEVELS[mastery_idx],
            "dropout_risk_probability": round(risk, 4),
            "resource_ranking": sorted(items, key=lambda i: i["score"], reverse=True),
        }
