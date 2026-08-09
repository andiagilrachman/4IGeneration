"""4IGeneration — Stock Screener (data-driven + AI).

Menyaring saham IDX berdasarkan kriteria fundamental dari data NYATA
(yfinance), lalu opsional: AI merangkum kandidat terbaik.

Alur (blueprint BAGIAN 15, Week 11-12 — MVP Feature A):
1. Ambil data semua saham IDX (concurrent via ThreadPool)
2. Filter fundamental (PE, ROE, margin, pertumbuhan, sektor)
3. Urutkan berdasarkan skor kualitas
4. (Opsional) AI rangkum top picks via AI Gateway
"""

from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from typing import Any

from app.services.stock.fetcher import IDX_STOCKS, get_stock_data

# concurrency rendah: aman dari rate-limit Yahoo sambil tetap lebih cepat dari sequential
_executor = ThreadPoolExecutor(max_workers=3)


@dataclass
class ScreenerCriteria:
    sector: str | None = None
    max_pe: float | None = None
    min_roe: float | None = None          # desimal: 0.15 = 15%
    min_revenue_growth: float | None = None  # desimal
    min_profit_margin: float | None = None   # desimal
    limit: int = 20

    @classmethod
    def from_payload(cls, payload: dict[str, Any]) -> "ScreenerCriteria":
        return cls(
            sector=payload.get("sector") or None,
            max_pe=payload.get("max_pe"),
            min_roe=_pct(payload.get("min_roe")),
            min_revenue_growth=_pct(payload.get("min_revenue_growth")),
            min_profit_margin=_pct(payload.get("min_profit_margin")),
            limit=min(int(payload.get("limit") or 20), 50),
        )


def _pct(value: Any) -> float | None:
    """Terima persen (15) atau desimal (0.15) → selalu desimal."""
    if value is None:
        return None
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    return v / 100 if v > 1 else v


def _matches(criteria: ScreenerCriteria, stock: dict[str, Any]) -> bool:
    """Cek apakah satu saham lolos semua kriteria."""
    def ok(value: float | None, op, target: float | None) -> bool:
        if target is None or value is None:
            return True  # kriteria tidak diset / data tidak ada → lolos
        return op(value, target)

    return (
        (not criteria.sector or stock.get("sector") == criteria.sector)
        and ok(stock.get("trailing_pe"), lambda v, t: v <= t, criteria.max_pe)
        and ok(stock.get("roe"), lambda v, t: v >= t, criteria.min_roe)
        and ok(stock.get("revenue_growth"), lambda v, t: v >= t, criteria.min_revenue_growth)
        and ok(stock.get("profit_margin"), lambda v, t: v >= t, criteria.min_profit_margin)
    )


def _quality_score(stock: dict[str, Any]) -> float:
    """Skor kualitas sederhana: kombinasi ROE, margin, pertumbuhan (0-100)."""
    roe = (stock.get("roe") or 0) * 100
    margin = (stock.get("profit_margin") or 0) * 100
    growth = (stock.get("revenue_growth") or 0) * 100
    return min(100, roe * 2 + margin * 0.5 + growth * 2)


def _fetch_all() -> tuple[list[dict[str, Any]], str]:
    """Ambil data semua saham IDX (blokir — dijalankan di thread pool).

    Mengembalikan (data, source) — source "live" atau "demo".
    Bila Yahoo rate-limited (semua gagal), fallback ke data demo berlabel jelas.
    """
    results: list[dict[str, Any]] = []
    for item in IDX_STOCKS:
        data = get_stock_data(item["ticker"], period="5d")
        if data is None:
            continue
        results.append(
            {
                "ticker": data.ticker,
                "name": data.name or item["name"],
                "sector": data.sector or item["sector"],
                "price": data.price,
                "trailing_pe": data.trailing_pe,
                "roe": data.roe,
                "revenue_growth": data.revenue_growth,
                "profit_margin": data.profit_margin,
                "week52_high": data.week52_high,
                "week52_low": data.week52_low,
                "history": data.history,
            }
        )

    if results:
        return results, "live"

    # fallback: semua gagal (rate limit) → data demo
    from app.services.stock.demo_data import get_demo_stocks, DEMO_NOTICE
    logger.warning(DEMO_NOTICE)
    return get_demo_stocks(), "demo"


async def run_screener(criteria: ScreenerCriteria) -> dict[str, Any]:
    """Jalankan screening penuh (fetch + filter + sort)."""
    raw, source = await asyncio.to_thread(_fetch_all)

    matches = [s for s in raw if _matches(criteria, s)]
    matches.sort(key=_quality_score, reverse=True)
    matches = matches[: criteria.limit]

    return {
        "source": source,
        "criteria": {
            "sector": criteria.sector,
            "max_pe": criteria.max_pe,
            "min_roe": criteria.min_roe,
            "min_revenue_growth": criteria.min_revenue_growth,
            "min_profit_margin": criteria.min_profit_margin,
            "limit": criteria.limit,
        },
        "scanned": len(raw),
        "total_matches": len(matches),
        "matches": matches,
    }
