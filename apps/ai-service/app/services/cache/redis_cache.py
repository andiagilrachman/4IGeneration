"""4IGeneration — Redis cache (Week 10).

Menggantikan disk cache untuk data saham. Redis adalah pilihan blueprint
(BAGIAN 3: Cache Redis 7 · BAGIAN 14: Redis local :6379).

Strategi:
- Utama: Redis (TTL per key)
- Fallback: disk cache (.stock_cache) bila Redis tidak tersedia —
  supaya AI service tetap jalan meski Redis mati (resilient).

Env: REDIS_URL (default redis://localhost:6379)
"""

from __future__ import annotations

import json
import logging
import os
import time
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
DISK_FALLBACK = Path(os.environ.get("STOCK_CACHE_DIR", ".stock_cache"))
TTL_SECONDS = int(os.environ.get("STOCK_CACHE_TTL_SECONDS", "43200"))  # 12 jam

_redis_client = None
_redis_checked = False


def _get_redis():
    """Lazy-init client Redis. None jika Redis tidak bisa dihubungi."""
    global _redis_client, _redis_checked
    if _redis_checked:
        return _redis_client
    _redis_checked = True
    try:
        import redis

        client = redis.Redis.from_url(REDIS_URL, socket_connect_timeout=2, decode_responses=True)
        client.ping()
        _redis_client = client
        logger.info("Redis terhubung: %s", REDIS_URL)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Redis tidak tersedia (%s) — pakai disk cache fallback", exc)
        _redis_client = None
    return _redis_client


def _key(ticker: str) -> str:
    return f"4ig:stock:{ticker.strip().upper()}"


# ------------------------------------------------------------------
# Disk fallback (sama seperti sebelumnya)
# ------------------------------------------------------------------
def _disk_path(ticker: str) -> Path:
    safe = "".join(c if c.isalnum() else "_" for c in ticker.upper())
    return DISK_FALLBACK / f"{safe}.json"


def _disk_get(ticker: str) -> dict[str, Any] | None:
    p = _disk_path(ticker)
    if not p.exists():
        return None
    try:
        data = json.loads(p.read_text())
        if (time.time() - data.get("_ts", 0)) > TTL_SECONDS:
            return None
        return data.get("payload")
    except (json.JSONDecodeError, OSError):
        return None


def _disk_set(ticker: str, payload: dict[str, Any]) -> None:
    try:
        DISK_FALLBACK.mkdir(parents=True, exist_ok=True)
        _disk_path(ticker).write_text(
            json.dumps({"_ts": time.time(), "payload": payload}, default=str)
        )
    except OSError:
        pass


# ------------------------------------------------------------------
# API publik
# ------------------------------------------------------------------
def get_cached(ticker: str) -> dict[str, Any] | None:
    client = _get_redis()
    if client is not None:
        try:
            raw = client.get(_key(ticker))
            if raw:
                return json.loads(raw)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Redis get gagal: %s", exc)
    return _disk_get(ticker)


def set_cached(ticker: str, payload: dict[str, Any]) -> None:
    client = _get_redis()
    if client is not None:
        try:
            client.set(_key(ticker), json.dumps(payload, default=str), ex=TTL_SECONDS)
            return
        except Exception as exc:  # noqa: BLE001
            logger.warning("Redis set gagal: %s", exc)
    _disk_set(ticker, payload)


def clear_all() -> dict[str, int]:
    """Bersihkan cache Redis + disk. Mengembalikan jumlah yang dihapus."""
    cleared = {"redis": 0, "disk": 0}
    client = _get_redis()
    if client is not None:
        try:
            keys = list(client.scan_iter(match="4ig:stock:*"))
            if keys:
                cleared["redis"] = client.delete(*keys)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Redis flush gagal: %s", exc)
    if DISK_FALLBACK.exists():
        n = 0
        for f in DISK_FALLBACK.glob("*.json"):
            try:
                f.unlink()
                n += 1
            except OSError:
                pass
        cleared["disk"] = n
    return cleared


def stats() -> dict[str, Any]:
    """Info cache untuk endpoint health/debug."""
    client = _get_redis()
    return {
        "backend": "redis" if client is not None else "disk",
        "url": REDIS_URL,
        "ttl_seconds": TTL_SECONDS,
    }
