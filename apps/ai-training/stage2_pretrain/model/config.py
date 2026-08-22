"""Konfigurasi model 4IG-Finance (dari JSON) + kalkulator parameter.

Adaptasi dari WicaraLLM src/model/config.py (Apache-2.0) — disederhanakan:
membaca file JSON (configs/*.json), tanpa import torch.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from math import log
from pathlib import Path


@dataclass
class ModelConfig:
    name: str = "4ig-300m"
    d_model: int = 768
    n_layer: int = 12
    n_head: int = 12
    n_kv_head: int = 4
    ffn_hidden: int = 2048
    max_seq_len: int = 2048
    vocab_size: int = 16384
    rope_theta: float = 10000.0
    dropout: float = 0.0
    norm_eps: float = 1e-5
    tie_embeddings: bool = True
    init_std: float = 0.02
    learning_rate: float = 3e-4
    weight_decay: float = 0.1
    warmup_ratio: float = 0.01
    batch_tokens: int = 524288

    @classmethod
    def from_json(cls, path: str | Path) -> "ModelConfig":
        raw = json.loads(Path(path).read_text(encoding="utf-8"))
        # petakan nama JSON (n_layers, n_heads, dll) ke dataclass
        mapping = {
            "n_layers": "n_layer",
            "n_heads": "n_head",
            "n_kv_heads": "n_kv_head",
            "ffn_hidden": "ffn_hidden",
            "max_seq_len": "max_seq_len",
            "vocab_size": "vocab_size",
            "d_model": "d_model",
            "learning_rate": "learning_rate",
            "weight_decay": "weight_decay",
            "warmup_ratio": "warmup_ratio",
            "batch_tokens": "batch_tokens",
        }
        kwargs: dict = {}
        for k, v in raw.items():
            if k in mapping:
                kwargs[mapping[k]] = v
            elif k == "name":
                kwargs["name"] = str(v)
        return cls(**kwargs)

    def validate(self) -> None:
        if self.d_model % self.n_head != 0:
            raise ValueError(f"d_model ({self.d_model}) harus habis dibagi n_head ({self.n_head})")
        if self.n_head % self.n_kv_head != 0:
            raise ValueError("n_head harus habis dibagi n_kv_head (GQA)")
        if self.vocab_size > 65535:
            raise ValueError("vocab_size > 65535 — uint16 tidak cukup")

    @property
    def head_dim(self) -> int:
        return self.d_model // self.n_head

    @property
    def d_ffn(self) -> int:
        """Alias kompatibilitas: ffn_hidden (nama dari file JSON)."""
        return self.ffn_hidden

    @property
    def n_rep(self) -> int:
        """Berapa kali tiap KV head diulang untuk melayani query head-nya."""
        return self.n_head // self.n_kv_head

    @property
    def expected_init_loss(self) -> float:
        return log(self.vocab_size)

    def param_count(self) -> int:
        d, kv = self.d_model, self.n_kv_head * self.head_dim
        n = self.vocab_size * d  # embedding (tied)
        for _ in range(self.n_layer):
            n += d * d + 2 * (d * kv) + d * d  # attn Wq, Wk, Wv, Wo
            n += 3 * d * self.ffn_hidden  # SwiGLU gate/up/down
            n += 2 * d  # 2 norm
        n += d  # final norm
        return n

    def vram_estimate_gb(self, adamw_bytes: int = 16) -> float:
        """Estimasi VRAM: bobot (bf16) + optimizer AdamW + overhead aktivasi kasar."""
        params = self.param_count()
        weights = params * 2
        optimizer = params * adamw_bytes
        activations = self.n_layer * 55 * self.max_seq_len * (self.d_model / 512)
        total = weights + optimizer + activations
        return total / 1024**3


def load_config(path: str | Path) -> ModelConfig:
    cfg = ModelConfig.from_json(path)
    cfg.validate()
    return cfg
