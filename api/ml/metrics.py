"""Metricas de evaluacion por tarea segun seccion 9.5 del documento."""

from __future__ import annotations

import math
from typing import Any, Callable

from demo_dataset import MASTERY_LEVELS, StudentRecord


def _binary_metrics(labels: list[int], scores: list[float], threshold: float = 0.5) -> dict[str, float]:
    if not labels:
        return {"roc_auc": 0.0, "pr_auc": 0.0, "f1": 0.0, "recall": 0.0, "brier": 0.0, "calibration": 0.0}

    pairs = sorted(zip(scores, labels), key=lambda item: item[0], reverse=True)
    positives = sum(labels)
    negatives = len(labels) - positives
    tp_cum, fp_cum, roc_auc, pr_auc = 0, 0, 0.0, 0.0
    prev_score = None
    roc_points: list[tuple[float, float]] = []
    pr_points: list[tuple[float, float]] = []
    for score, label in pairs:
        if prev_score is not None and score != prev_score:
            if negatives:
                roc_points.append((fp_cum / negatives, tp_cum / max(positives, 1)))
            if positives:
                pr_points.append((tp_cum / max(positives, 1), tp_cum / max(tp_cum + fp_cum, 1)))
        prev_score = score
        if label == 1:
            tp_cum += 1
        else:
            fp_cum += 1
    if negatives:
        roc_points.append((fp_cum / negatives, tp_cum / max(positives, 1)))
    if positives:
        pr_points.append((tp_cum / max(positives, 1), tp_cum / max(tp_cum + fp_cum, 1)))

    for i in range(1, len(roc_points)):
        x0, y0 = roc_points[i - 1]
        x1, y1 = roc_points[i]
        roc_auc += (x1 - x0) * (y1 + y0) / 2
    for i in range(1, len(pr_points)):
        r0, p0 = pr_points[i - 1]
        r1, p1 = pr_points[i]
        pr_auc += (r1 - r0) * (p1 + p0) / 2

    tp = sum(1 for s, y in zip(scores, labels) if s >= threshold and y == 1)
    fp = sum(1 for s, y in zip(scores, labels) if s >= threshold and y == 0)
    fn = sum(1 for s, y in zip(scores, labels) if s < threshold and y == 1)
    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    f1 = 2 * precision * recall / max(precision + recall, 1e-9)
    brier = sum((s - y) ** 2 for s, y in zip(scores, labels)) / len(labels)

    bins = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    calibration = 0.0
    used_bins = 0
    for low, high in zip(bins[:-1], bins[1:]):
        members = [(s, y) for s, y in zip(scores, labels) if low <= s < high]
        if members:
            calibration += abs(sum(s for s, _ in members) / len(members) - sum(y for _, y in members) / len(members))
            used_bins += 1
    calibration /= max(used_bins, 1)

    return {
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "f1": round(f1, 4),
        "recall": round(recall, 4),
        "brier": round(brier, 4),
        "calibration": round(calibration, 4),
        "positives": positives,
    }


def _mastery_metrics(labels: list[int], probabilities: list[dict[str, float]]) -> dict[str, Any]:
    preds = [max(range(len(MASTERY_LEVELS)), key=lambda i: prob[MASTERY_LEVELS[i]]) for prob in probabilities]
    confusion = [[0] * len(MASTERY_LEVELS) for _ in MASTERY_LEVELS]
    for y, p in zip(labels, preds):
        confusion[y][p] += 1

    f1s = []
    recalls = []
    for cls in range(len(MASTERY_LEVELS)):
        tp = confusion[cls][cls]
        fp = sum(confusion[i][cls] for i in range(len(MASTERY_LEVELS)) if i != cls)
        fn = sum(confusion[cls][i] for i in range(len(MASTERY_LEVELS)) if i != cls)
        precision = tp / max(tp + fp, 1)
        recall = tp / max(tp + fn, 1)
        f1 = 2 * precision * recall / max(precision + recall, 1e-9)
        f1s.append(f1)
        recalls.append(recall)

    balanced_accuracy = sum(recalls) / len(recalls)
    mae = sum(abs(y - p) for y, p in zip(labels, preds)) / max(len(labels), 1)
    return {
        "macro_f1": round(sum(f1s) / len(f1s), 4),
        "balanced_accuracy": round(balanced_accuracy, 4),
        "mae_ordinal": round(mae, 4),
        "confusion_matrix": confusion,
    }


def _ranking_metrics(records: list[StudentRecord], predict: Callable[[StudentRecord], dict[str, Any]],
                     k: int = 5) -> dict[str, float]:
    if not records:
        return {"ndcg_at_k": 0.0, "recall_at_k": 0.0, "coverage": 0.0, "diversity": 0.0}
    ndcgs, recalls, diversities = [], [], []
    seen: set[str] = set()
    for record in records:
        if not record.recursos_relevantes:
            continue
        result = predict(record)
        ranking = [item["resource_id"] for item in result["resource_ranking"][:k]]
        seen.update(ranking)
        relevant = set(record.recursos_relevantes)
        hits = [1 if rid in relevant else 0 for rid in ranking]
        dcg = sum(hit / math.log2(i + 2) for i, hit in enumerate(hits))
        ideal_hits = sorted([1] * min(len(relevant), k) + [0] * max(k - len(relevant), 0), reverse=True)
        idcg = sum(hit / math.log2(i + 2) for i, hit in enumerate(ideal_hits)) or 1.0
        ndcgs.append(dcg / idcg)
        recalls.append(sum(hits) / max(len(relevant), 1))
        diversities.append(len({rid[-3:] for rid in ranking}) / max(len(ranking), 1))
    return {
        "ndcg_at_k": round(sum(ndcgs) / max(len(ndcgs), 1), 4),
        "recall_at_k": round(sum(recalls) / max(len(recalls), 1), 4),
        "coverage": round(len(seen) / 12, 4),
        "diversity": round(sum(diversities) / max(len(diversities), 1), 4),
    }


def evaluate(records: list[StudentRecord], predict: Callable[[StudentRecord], dict[str, Any]]) -> dict[str, Any]:
    predictions = [predict(r) for r in records]
    thresholds = predictions[0].get("decision_thresholds", {}) if predictions else {}
    completion_threshold = float(thresholds.get("completion", 0.5))
    risk_threshold = float(thresholds.get("dropout_risk", 0.5))

    completion_labels = [r.finalizado for r in records if r.finalizado is not None]
    completion_scores = [
        p["completion_probability"] for r, p in zip(records, predictions) if r.finalizado is not None
    ]
    risk_labels = [r.riesgo for r in records if r.riesgo is not None]
    risk_scores = [
        p["dropout_risk_probability"] for r, p in zip(records, predictions) if r.riesgo is not None
    ]
    mastery_labels = [r.dominio for r in records if r.dominio is not None]
    mastery_probs = [p["mastery_probabilities"] for r, p in zip(records, predictions) if r.dominio is not None]

    return {
        "rows": len(records),
        "label": "DEMO - metricas sobre dataset sintetico; no son evidencia de validez educativa",
        "completion": _binary_metrics(
            [int(x) for x in completion_labels], completion_scores, completion_threshold
        ),
        "mastery": _mastery_metrics([int(x) for x in mastery_labels], mastery_probs),
        "dropout_risk": _binary_metrics(
            [int(x) for x in risk_labels], risk_scores, risk_threshold
        ),
        "recommendation": _ranking_metrics(records, predict),
    }
