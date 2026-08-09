"""4IGeneration — Disk cache untuk data saham (sementara, pre-Redis).

Kenapa: Yahoo Finance rate-limit agresif (429). Cache per-ticker per-hari
mengurangi jumlah request dan membuat screener cepat saat data sudah ada.

Blueprint Week 10: cache strategy (Redis). Versi ini file-based sederhana;
migrasi ke Redis menyusul (apps/api + cache module).
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

CACHE_DIR = Path(os.environ.get("STOCK_CACHE_DIR", ".stock_cache"))
CACHE_TTL_HOURS = float(os.environ.get("STOCK_CACHE_TTL_HOURS", "12"))


def _ensure_dir() -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _path(ticker: str) -> Path:
    safe = "".join(c if c.isalnum() else "_" for c in ticker.upper())
    return CACHE_DIR / f"{safe}.json"


def get_cached(ticker: str) -> dict[str, Any] | None:
    """Ambil cache jika masih fresh (dalam TTL). None jika tidak ada/kadaluarsa."""
    p = _path(ticker)
    if not p.exists():
        return None
    try:
        data = json.loads(p.read_text())
        age_h = (time.time() - data.get("_ts", 0)) / 3600
        if age_h > CACHE_TTL_HOURS:
            return None
        return data.get("payload")
    except (json.JSONDecodeError, OSError):
        return None


def set_cached(ticker: str, payload: dict[str, Any]) -> None:
    """Simpan payload ke cache dengan timestamp."""
    try:
        _ensure_dir()
        _path(ticker).write_text(
            json.dumps({"_ts": time.time(), "payload": payload}, default=str)
        )
    except OSError:
        pass  # cache gagal → jangan sampai memblokir fitur


def clear_all() -> int:
    """Bersihkan semua cache (untuk admin/debug)."""
    if not CACHE_DIR.exists():
        return 0
    n = 0
    for f in CACHE_DIR.glob("*.json"):
        try:
            f.unlink()
            n += 1
        except OSError:
            pass
    return n
