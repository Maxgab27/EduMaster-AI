"""EduMaster MTL Network DEMO: logica multitarea en Python puro.

Implementa la seccion 9 del documento sin dependencias pesadas:
- rama tabular normalizada + categoria one-hot,
- rama temporal tipo GRU sobre secuencias de eventos,
- fusion compartida,
- cabezas A (finalizacion), B (dominio ordinal), C (riesgo) y D (ranking),
- perdida multitarea ponderada con mascarado de etiquetas ausentes,
- calibracion de temperaturas y explicaciones prudentes.

Es una implementacion DEMO compacta para railway Free. No reemplaza un
PyTorch/MLflow real para produccion ni constituye evidencia pedagogica.
"""

from __future__ import annotations

import copy
import json
import math
import random
from pathlib import Path
from typing import Any

from demo_dataset import MASTERY_LEVELS, StudentRecord

Vector = list[float]
Matrix = list[list[float]]


EVENT_VOCAB = {
    "login": 0,
    "content_view": 1,
    "activity_start": 2,
    "activity_complete": 3,
    "assessment_submit": 4,
    "help_request": 5,
}
CATEGORY_VOCAB = {"MATEMATICA": 0, "LENGUA": 1, "TECNOLOGIA": 2, "CIENCIAS": 3}
NUMERIC_KEYS = [
    "active_days_14d",
    "sessions_14d",
    "completion_ratio",
    "assessment_mean",
    "assignment_late_rate",
    "help_requests_14d",
]
NUMERIC_MAX = [14.0, 20.0, 1.0, 1.0, 1.0, 8.0]
TAB_DIM = len(NUMERIC_KEYS) + len(CATEGORY_VOCAB)
EVENT_DIM = len(EVENT_VOCAB)
RESOURCE_COUNT = 12


def sigmoid(x: float) -> float:
    if x >= 0:
        return 1.0 / (1.0 + math.exp(-x))
    e = math.exp(x)
    return e / (1.0 + e)


def softmax(values: Vector) -> Vector:
    mx = max(values)
    exps = [math.exp(v - mx) for v in values]
    total = sum(exps)
    return [e / total for e in exps]


def dot(a: Vector, b: Vector) -> float:
    return sum(x * y for x, y in zip(a, b))


def matvec(matrix: Matrix, vector: Vector) -> Vector:
    return [dot(row, vector) for row in matrix]


def zeros(n: int) -> Vector:
    return [0.0] * n


def zeros_matrix(rows: int, cols: int) -> Matrix:
    return [[0.0] * cols for _ in range(rows)]


def random_vector(n: int, rng: random.Random, scale: float = 0.1) -> Vector:
    return [rng.uniform(-scale, scale) for _ in range(n)]


def random_matrix(rows: int, cols: int, rng: random.Random, scale: float = 0.1) -> Matrix:
    return [[rng.uniform(-scale, scale) for _ in range(cols)] for _ in range(rows)]


def accum_outer(grad: Matrix, dout: Vector, inp: Vector) -> None:
    for i, di in enumerate(dout):
        row = grad[i]
        for j, xj in enumerate(inp):
            row[j] += di * xj


def backprop_input(matrix: Matrix, dout: Vector) -> Vector:
    cols = len(matrix[0]) if matrix else 0
    result = zeros(cols)
    for i, di in enumerate(dout):
        row = matrix[i]
        for j in range(cols):
            result[j] += di * row[j]
    return result


def add_into(target: Vector, source: Vector, scale: float = 1.0) -> None:
    for i, value in enumerate(source):
        target[i] += scale * value


def compute_stats(records: list[StudentRecord]) -> dict[str, list[float]]:
    stats: dict[str, list[float]] = {}
    for key, cap in zip(NUMERIC_KEYS, NUMERIC_MAX):
        values = [float(getattr(r, key)) / cap for r in records]
        mean = sum(values) / max(len(values), 1)
        var = sum((v - mean) ** 2 for v in values) / max(len(values), 1)
        stats[key] = [mean, max(math.sqrt(var), 1e-3)]
    return stats


class MTLModel:
    """Red multitarea compacta y auditable."""

    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.seed = int(config.get("seed", 42))
        self.rng = random.Random(self.seed)
        self.hidden_dim = int(config.get("hidden_dim", 12))
        self.max_sequence_length = int(config.get("max_sequence_length", 12))
        self.learning_rate = float(config.get("learning_rate", 0.06))
        self.epochs = int(config.get("epochs", 80))
        self.patience = int(config.get("early_stopping_patience", 12))
        self.lambdas = {
            "completion": float(config["lambdas"]["completion"]),
            "mastery": float(config["lambdas"]["mastery"]),
            "dropout_risk": float(config["lambdas"]["dropout_risk"]),
            "ranking": float(config["lambdas"]["ranking"]),
        }
        H = self.hidden_dim
        self.stats: dict[str, list[float]] = {}
        self.temperature: dict[str, float] = {"completion": 1.0, "dropout_risk": 1.0}
        self.thresholds: dict[str, float] = {"completion": 0.5, "dropout_risk": 0.5}
        self.trained_epochs = 0
        self.train_loss_history: list[float] = []
        self.val_loss_history: list[float] = []
        self.params: dict[str, Any] = {
            "w_tab": random_matrix(H, TAB_DIM, self.rng, 0.18),
            "b_tab": random_vector(H, self.rng, 0.02),
            "wz": random_matrix(H, EVENT_DIM, self.rng, 0.18),
            "uz": random_matrix(H, H, self.rng, 0.08),
            "bz": random_vector(H, self.rng, 0.02),
            "wr": random_matrix(H, EVENT_DIM, self.rng, 0.18),
            "ur": random_matrix(H, H, self.rng, 0.08),
            "br": random_vector(H, self.rng, 0.02),
            "wh": random_matrix(H, EVENT_DIM, self.rng, 0.18),
            "uh": random_matrix(H, H, self.rng, 0.08),
            "bh": random_vector(H, self.rng, 0.02),
            "w_fusion": random_matrix(H, H * 2, self.rng, 0.18),
            "b_fusion": random_vector(H, self.rng, 0.02),
            "head_a": random_vector(H, self.rng, 0.15),
            "bias_a": [0.0],
            "head_b": random_matrix(len(MASTERY_LEVELS), H, self.rng, 0.15),
            "bias_b": zeros(len(MASTERY_LEVELS)),
            "head_c": random_vector(H, self.rng, 0.15),
            "bias_c": [0.0],
            "head_d": random_vector(H, self.rng, 0.15),
            "item_bias": zeros(RESOURCE_COUNT),
            "type_bias": zeros(4),
        }
        self._m = self._empty_like(self.params)
        self._v = self._empty_like(self.params)

    @staticmethod
    def _empty_like(structure: Any) -> Any:
        if isinstance(structure, dict):
            return {k: MTLModel._empty_like(v) for k, v in structure.items()}
        if isinstance(structure, list):
            if structure and isinstance(structure[0], list):
                return [MTLModel._empty_like(row) for row in structure]
            return zeros(len(structure))
        return 0.0

    @staticmethod
    def _zeros_like(structure: Any) -> Any:
        return MTLModel._empty_like(structure)

    @staticmethod
    def _recurse_update(params: Any, grads: Any, m: Any, v: Any, lr: float, step: int,
                        b1: float = 0.9, b2: float = 0.999, eps: float = 1e-8) -> None:
        if isinstance(params, dict):
            for key in params:
                MTLModel._recurse_update(params[key], grads[key], m[key], v[key], lr, step, b1, b2, eps)
            return
        if isinstance(params, list) and params and isinstance(params[0], list):
            for i in range(len(params)):
                MTLModel._recurse_update(params[i], grads[i], m[i], v[i], lr, step, b1, b2, eps)
            return
        if isinstance(params, list):
            for i in range(len(params)):
                g = grads[i]
                m[i] = b1 * m[i] + (1 - b1) * g
                v[i] = b2 * v[i] + (1 - b2) * g * g
                m_hat = m[i] / (1 - b1 ** step)
                v_hat = v[i] / (1 - b2 ** step)
                params[i] -= lr * m_hat / (math.sqrt(v_hat) + eps)
            return
        g = grads
        m_value = b1 * m + (1 - b1) * g
        v_value = b2 * v + (1 - b2) * g * g
        params_value = params - lr * (m_value / (1 - b1 ** step)) / (math.sqrt(v_value / (1 - b2 ** step)) + eps)
        return params_value

    @staticmethod
    def _clip_grads(grads: Any, limit: float = 5.0) -> None:
        if isinstance(grads, dict):
            for value in grads.values():
                MTLModel._clip_grads(value, limit)
            return
        if isinstance(grads, list) and grads and isinstance(grads[0], list):
            for row in grads:
                MTLModel._clip_grads(row, limit)
            return
        if isinstance(grads, list):
            for i, value in enumerate(grads):
                grads[i] = max(-limit, min(limit, value))
            return

    def _tabular_vector(self, record: StudentRecord) -> Vector:
        numeric: Vector = []
        for key, cap in zip(NUMERIC_KEYS, NUMERIC_MAX):
            mean, std = self.stats.get(key, [0.0, 1.0])
            value = float(getattr(record, key)) / cap
            numeric.append((value - mean) / std)
        cat = zeros(len(CATEGORY_VOCAB))
        cat[CATEGORY_VOCAB.get(record.category, 0)] = 1.0
        return numeric + cat

    def _forward(self, record: StudentRecord) -> dict[str, Any]:
        p = self.params
        x_tab = self._tabular_vector(record)
        tab_h = [math.tanh(v) for v in matvec(p["w_tab"], x_tab)]

        h_gru = zeros(self.hidden_dim)
        events_cache: list[tuple[Vector, Vector, Vector, Vector, Vector, Vector]] = []
        for event in record.event_sequence[: self.max_sequence_length]:
            x_event = zeros(EVENT_DIM)
            x_event[EVENT_VOCAB.get(event, 1)] = 1.0
            z = [sigmoid(v) for v in matvec(p["wz"], x_event)]
            uz_h = matvec(p["uz"], h_gru)
            z = [sigmoid(a + b + c) for a, b, c in zip(matvec(p["wz"], x_event), uz_h, p["bz"])]

            r_pre = matvec(p["wr"], x_event)
            ur_h = matvec(p["ur"], h_gru)
            r = [sigmoid(a + b + c) for a, b, c in zip(r_pre, ur_h, p["br"])]
            reset_h = [ri * hi for ri, hi in zip(r, h_gru)]
            h_tilde_pre = matvec(p["wh"], x_event)
            uh_reset = matvec(p["uh"], reset_h)
            h_tilde = [math.tanh(a + b + c) for a, b, c in zip(h_tilde_pre, uh_reset, p["bh"])]
            h_new = [((1 - zi) * hi + zi * hti) for zi, hi, hti in zip(z, h_gru, h_tilde)]
            events_cache.append((x_event, h_gru, z, r, h_tilde, h_new))
            h_gru = h_new

        fused_input = tab_h + h_gru
        shared = [math.tanh(v) for v in matvec(p["w_fusion"], fused_input)]
        p_a = sigmoid(dot(p["head_a"], shared) + p["bias_a"][0])
        logits_b = matvec(p["head_b"], shared)
        probs_b = softmax(logits_b)
        p_c = sigmoid(dot(p["head_c"], shared) + p["bias_c"][0])
        item_scores: Vector = []
        for idx in range(RESOURCE_COUNT):
            item_scores.append(
                dot(p["head_d"], shared) + p["item_bias"][idx] + p["type_bias"][idx % 4]
            )
        return {
            "x_tab": x_tab,
            "tab_h": tab_h,
            "events": events_cache,
            "h_gru": h_gru,
            "shared": shared,
            "p_a": p_a,
            "probs_b": probs_b,
            "p_c": p_c,
            "scores_d": item_scores,
        }

    def _loss_only(self, record: StudentRecord, out: dict[str, Any]) -> float:
        """Perdida enmascarada sin gradientes, usada para early stopping."""
        total = 0.0
        if record.finalizado is not None:
            p = min(max(out["p_a"], 1e-9), 1 - 1e-9)
            y = float(record.finalizado)
            total += -self.lambdas["completion"] * (y * math.log(p) + (1 - y) * math.log(1 - p))
        if record.dominio is not None:
            total += -self.lambdas["mastery"] * math.log(max(out["probs_b"][record.dominio], 1e-9))
        if record.riesgo is not None:
            p = min(max(out["p_c"], 1e-9), 1 - 1e-9)
            y = float(record.riesgo)
            total += -self.lambdas["dropout_risk"] * (y * math.log(p) + (1 - y) * math.log(1 - p))
        if record.recursos_relevantes:
            relevant = {int(rid[-3:]) for rid in record.recursos_relevantes if rid.startswith("REC-")}
            pairs = [
                (pos, neg)
                for pos in sorted(relevant)
                for neg in range(RESOURCE_COUNT)
                if neg not in relevant
            ][:18]
            if pairs:
                weight = self.lambdas["ranking"] / len(pairs)
                for pos, neg in pairs:
                    margin = out["scores_d"][pos] - out["scores_d"][neg]
                    total += weight * (max(-margin, 0.0) + math.log1p(math.exp(-abs(margin))))
        return total

    def _backward(self, record: StudentRecord, out: dict[str, Any], grads: dict[str, Any]) -> float:
        p = self.params
        shared = out["shared"]
        dh_shared = zeros(self.hidden_dim)
        total_loss = 0.0

        if record.finalizado is not None:
            y = float(record.finalizado)
            p_a = min(max(out["p_a"], 1e-9), 1 - 1e-9)
            total_loss += -self.lambdas["completion"] * (y * math.log(p_a) + (1 - y) * math.log(1 - p_a))
            da = self.lambdas["completion"] * (p_a - y)
            for i in range(self.hidden_dim):
                grads["head_a"][i] += da * shared[i]
            grads["bias_a"][0] += da
            add_into(dh_shared, p["head_a"], da)

        if record.dominio is not None:
            y_b = record.dominio
            probs = out["probs_b"]
            total_loss += -self.lambdas["mastery"] * math.log(max(probs[y_b], 1e-9))
            dlogits = [self.lambdas["mastery"] * prob for prob in probs]
            dlogits[y_b] -= self.lambdas["mastery"]
            for j in range(len(MASTERY_LEVELS)):
                grads["bias_b"][j] += dlogits[j]
                for i in range(self.hidden_dim):
                    grads["head_b"][j][i] += dlogits[j] * shared[i]
                    dh_shared[i] += dlogits[j] * p["head_b"][j][i]

        if record.riesgo is not None:
            y = float(record.riesgo)
            p_c = min(max(out["p_c"], 1e-9), 1 - 1e-9)
            total_loss += -self.lambdas["dropout_risk"] * (y * math.log(p_c) + (1 - y) * math.log(1 - p_c))
            dc = self.lambdas["dropout_risk"] * (p_c - y)
            for i in range(self.hidden_dim):
                grads["head_c"][i] += dc * shared[i]
            grads["bias_c"][0] += dc
            add_into(dh_shared, p["head_c"], dc)

        if record.recursos_relevantes:
            relevant_ids = {int(rid.split("-")[-1]) for rid in record.recursos_relevantes if rid.startswith("REC-")}
            pairs = [
                (pos, neg)
                for pos in sorted(relevant_ids)
                for neg in range(RESOURCE_COUNT)
                if neg not in relevant_ids
            ][:18]
            if pairs:
                pair_weight = self.lambdas["ranking"] / len(pairs)
                item_deltas = zeros(RESOURCE_COUNT)
                for pos, neg in pairs:
                    margin = out["scores_d"][pos] - out["scores_d"][neg]
                    dmargin = (sigmoid(margin) - 1.0) * pair_weight
                    softplus = max(-margin, 0.0) + math.log1p(math.exp(-abs(margin)))
                    total_loss += pair_weight * softplus
                    item_deltas[pos] += dmargin
                    item_deltas[neg] -= dmargin
                for idx, delta in enumerate(item_deltas):
                    grads["item_bias"][idx] += delta
                    grads["type_bias"][idx % 4] += delta
                    for i in range(self.hidden_dim):
                        grads["head_d"][i] += delta * shared[i]
                        dh_shared[i] += delta * p["head_d"][i]

        fusion_pre_grad = [dhi * (1 - s * s) for dhi, s in zip(dh_shared, shared)]
        accum_outer(grads["w_fusion"], fusion_pre_grad, out["tab_h"] + out["h_gru"])
        add_into(grads["b_fusion"], fusion_pre_grad)
        d_fused = backprop_input(p["w_fusion"], fusion_pre_grad)
        d_tab_h = d_fused[: self.hidden_dim]
        d_h_gru = d_fused[self.hidden_dim :]

        tab_pre_grad = [dt * (1 - h * h) for dt, h in zip(d_tab_h, out["tab_h"])]
        accum_outer(grads["w_tab"], tab_pre_grad, out["x_tab"])
        add_into(grads["b_tab"], tab_pre_grad)

        dh_next = d_h_gru
        for x_event, h_prev, z, r, h_tilde, h_new in reversed(out["events"]):
            dh_direct = [(1 - zi) * dhi for zi, dhi in zip(z, dh_next)]
            d_tilde_from_h = [dhi * zi for zi, dhi in zip(z, dh_next)]
            dz_raw = [dhi * (hti - hi) for dhi, hti, hi in zip(dh_next, h_tilde, h_prev)]
            d_tanh = [dth * (1 - hti * hti) for dth, hti in zip(d_tilde_from_h, h_tilde)]
            dr_input = backprop_input(p["uh"], d_tanh)
            reset_h = [ri * hi for ri, hi in zip(r, h_prev)]
            accum_outer(grads["uh"], d_tanh, reset_h)
            add_into(grads["bh"], d_tanh)
            d_tilde_from_x = backprop_input(p["wh"], d_tanh)
            accum_outer(grads["wh"], d_tanh, x_event)

            dr_raw = [
                d_r * hp * ri * (1 - ri)
                for d_r, hp, ri in zip(dr_input, h_prev, r)
            ]
            accum_outer(grads["ur"], dr_raw, h_prev)
            accum_outer(grads["wr"], dr_raw, x_event)
            add_into(grads["br"], dr_raw)
            d_h_from_reset = [d_r * ri for d_r, ri in zip(dr_input, r)]

            dz = [dzr * zi * (1 - zi) for dzr, zi in zip(dz_raw, z)]
            accum_outer(grads["uz"], dz, h_prev)
            accum_outer(grads["wz"], dz, x_event)
            add_into(grads["bz"], dz)

            dh_next = [a + b for a, b in zip(dh_direct, d_h_from_reset)]

        return total_loss

    def fit(self, records: list[StudentRecord], verbose: bool = False) -> "MTLModel":
        if len(records) < 5:
            raise ValueError("Se necesitan al menos 5 registros para entrenar")
        cut = max(1, int(len(records) * 0.85))
        train_rows, val_rows = records[:cut], records[cut:]
        self.stats = compute_stats(train_rows)

        indices = list(range(len(train_rows)))
        best_val = float("inf")
        best_epoch = 1
        best_params: dict[str, Any] = copy.deepcopy(self.params)
        stale = 0

        for epoch in range(1, self.epochs + 1):
            self.rng.shuffle(indices)
            epoch_loss = 0.0
            for idx in indices:
                record = train_rows[idx]
                grads = self._zeros_like(self.params)
                out = self._forward(record)
                epoch_loss += self._backward(record, out, grads)
                self._clip_grads(grads, 5.0)
                self._recurse_update(self.params, grads, self._m, self._v, self.learning_rate, epoch)

            val_loss = sum(
                self._loss_only(r, self._forward(r)) for r in val_rows
            ) / max(len(val_rows), 1)
            self.train_loss_history.append(epoch_loss / max(len(indices), 1))
            self.val_loss_history.append(val_loss)

            if val_loss < best_val - 1e-4:
                best_val, best_epoch, stale = val_loss, epoch, 0
                best_params = copy.deepcopy(self.params)
            else:
                stale += 1
                if stale >= self.patience:
                    if verbose:
                        print(f"early stopping en epoch {epoch}; mejor epoch {best_epoch}")
                    break

            if verbose and (epoch == 1 or epoch % 10 == 0):
                print(
                    f"epoch {epoch:03d} train_loss={self.train_loss_history[-1]:.4f} "
                    f"val_loss={val_loss:.4f}"
                )

        self.params = best_params
        self.trained_epochs = best_epoch
        self._calibrate(records)
        return self

    def _calibrate(self, records: list[StudentRecord]) -> None:
        for task, key, label_key in [
            ("completion", "p_a", "finalizado"),
            ("dropout_risk", "p_c", "riesgo"),
        ]:
            labeled = [r for r in records if getattr(r, label_key) is not None]
            if not labeled:
                continue
            best_temp, best_brier = 1.0, float("inf")
            for temp in [0.6, 0.8, 1.0, 1.2, 1.5, 2.0]:
                brier = 0.0
                for r in labeled:
                    out = self._forward(r)
                    raw = out[key]
                    logit = math.log(max(raw, 1e-9) / max(1 - raw, 1e-9))
                    calibrated = sigmoid(logit / temp)
                    brier += (calibrated - float(getattr(r, label_key))) ** 2
                brier /= len(labeled)
                if brier < best_brier:
                    best_brier, best_temp = brier, temp
            self.temperature[task] = best_temp

            best_f1, best_threshold = -1.0, 0.5
            calibrated_scores = []
            for r in labeled:
                out = self._forward(r)
                raw = out[key]
                logit = math.log(max(raw, 1e-9) / max(1 - raw, 1e-9))
                calibrated_scores.append((sigmoid(logit / best_temp), int(getattr(r, label_key))))
            for step in range(1, 20):
                threshold = step / 20
                tp = sum(1 for score, y in calibrated_scores if score >= threshold and y == 1)
                fp = sum(1 for score, y in calibrated_scores if score >= threshold and y == 0)
                fn = sum(1 for score, y in calibrated_scores if score < threshold and y == 1)
                precision = tp / max(tp + fp, 1)
                recall = tp / max(tp + fn, 1)
                f1 = 2 * precision * recall / max(precision + recall, 1e-9)
                if f1 > best_f1:
                    best_f1, best_threshold = f1, threshold
            self.thresholds[task] = best_threshold

    def _calibrated(self, raw: float, task: str) -> float:
        raw = min(max(raw, 1e-9), 1 - 1e-9)
        logit = math.log(raw / (1 - raw))
        return sigmoid(logit / self.temperature.get(task, 1.0))

    def predict(self, record: StudentRecord) -> dict[str, Any]:
        out = self._forward(record)
        completion = self._calibrated(out["p_a"], "completion")
        risk = self._calibrated(out["p_c"], "dropout_risk")
        ranking = sorted(
            [
                {"resource_id": f"REC-{idx:03d}", "score": round(score, 4)}
                for idx, score in enumerate(out["scores_d"])
            ],
            key=lambda item: item["score"],
            reverse=True,
        )
        return {
            "completion_probability": round(completion, 4),
            "mastery_probabilities": {
                level: round(prob, 4) for level, prob in zip(MASTERY_LEVELS, out["probs_b"])
            },
            "mastery_level": MASTERY_LEVELS[max(range(len(out["probs_b"])), key=lambda i: out["probs_b"][i])],
            "dropout_risk_probability": round(risk, 4),
            "resource_ranking": ranking,
            "decision_thresholds": dict(self.thresholds),
        }

    def explain(self, record: StudentRecord) -> dict[str, Any]:
        x_tab = self._tabular_vector(record)
        p = self.params
        contributions = []
        for i, key in enumerate(NUMERIC_KEYS):
            weight = sum(abs(p["w_tab"][h][i]) for h in range(self.hidden_dim))
            value = float(getattr(record, key))
            contributions.append(
                {
                    "feature": key,
                    "value": value,
                    "relevance": round(weight * abs(x_tab[i]), 4),
                }
            )
        event_counts: dict[str, int] = {}
        for event in record.event_sequence:
            event_counts[event] = event_counts.get(event, 0) + 1
        top_events = sorted(event_counts.items(), key=lambda item: item[1], reverse=True)[:2]
        return {
            "label": "Explicacion DEMO: asociaciones observadas en datos sinteticos; no implica causalidad.",
            "top_factors": sorted(contributions, key=lambda item: item["relevance"], reverse=True)[:3],
            "temporal_signal": [
                {"event": event, "count": count} for event, count in top_events
            ],
            "guardrail": "La estimacion no es nota oficial, diagnostico ni sancion; requiere revision humana.",
        }

    def to_dict(self) -> dict[str, Any]:
        return {
            "config": self.config,
            "stats": self.stats,
            "temperature": self.temperature,
            "thresholds": self.thresholds,
            "trained_epochs": self.trained_epochs,
            "train_loss_history": self.train_loss_history[-10:],
            "val_loss_history": self.val_loss_history[-10:],
            "params": self.params,
        }

    def save(self, path: str | Path) -> None:
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(self.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8")

    @classmethod
    def load(cls, path: str | Path) -> "MTLModel":
        p = Path(path)
        payload = json.loads(p.read_text(encoding="utf-8"))
        model = cls(payload["config"])
        model.params = payload["params"]
        model.stats = payload["stats"]
        model.temperature = payload.get("temperature", model.temperature)
        model.thresholds = payload.get("thresholds", model.thresholds)
        model.trained_epochs = payload.get("trained_epochs", 0)
        model.train_loss_history = payload.get("train_loss_history", [])
        model.val_loss_history = payload.get("val_loss_history", [])
        model._m = cls._empty_like(model.params)
        model._v = cls._empty_like(model.params)
        return model
