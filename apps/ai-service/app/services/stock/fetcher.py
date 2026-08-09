"""4IGeneration — Stock Data Fetcher (yfinance) + cache + retry.

Mengambil data saham IDX nyata dari Yahoo Finance.
Ticker IDX di yfinance pakai suffix ".JK" (mis. "BBCA" → "BBCA.JK").

Ketahanan:
- Retry dengan backoff eksponensial (Yahoo sering rate-limit 429)
- Disk cache per ticker (TTL 12 jam) — cepat & hemat request

Referensi blueprint:
- BAGIAN 11: Yahoo Finance via yfinance (free) — best for historical prices
- BAGIAN 8.5: Stock data endpoints
- Week 10 roadmap: cache strategy (Redis menyusul, ini versi file-based)
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Any

from app.services.stock import cache as stock_cache

logger = logging.getLogger(__name__)

IDX_SUFFIX = ".JK"
MAX_RETRIES = 3
RETRY_DELAYS = [1.0, 2.0, 3.0]  # cepat: screener fail-fast ke demo bila rate-limit

# Daftar saham IDX likuid (contoh — untuk screener & watchlist).
# TODO (Week 9-10 lanjutan): import daftar lengkap dari IDX.
IDX_STOCKS: list[dict[str, str]] = [
    {"ticker": "BBCA", "name": "Bank Central Asia", "sector": "Financials"},
    {"ticker": "BBRI", "name": "Bank Rakyat Indonesia", "sector": "Financials"},
    {"ticker": "BBNI", "name": "Bank Negara Indonesia", "sector": "Financials"},
    {"ticker": "BMRI", "name": "Bank Mandiri", "sector": "Financials"},
    {"ticker": "TLKM", "name": "Telkom Indonesia", "sector": "Telecommunications"},
    {"ticker": "ISAT", "name": "Indosat Ooredoo", "sector": "Telecommunications"},
    {"ticker": "ASII", "name": "Astra International", "sector": "Industrials"},
    {"ticker": "GGRM", "name": "Gudang Garam", "sector": "Consumer Staples"},
    {"ticker": "UNVR", "name": "Unilever Indonesia", "sector": "Consumer Staples"},
    {"ticker": "ICBP", "name": "Indofood CBP", "sector": "Consumer Staples"},
    {"ticker": "INDF", "name": "Indofood Sukses Makmur", "sector": "Consumer Staples"},
    {"ticker": "KLBF", "name": "Kalbe Farma", "sector": "Healthcare"},
    {"ticker": "PGAS", "name": "Perusahaan Gas Negara", "sector": "Energy"},
    {"ticker": "ADRO", "name": "Adaro Energy", "sector": "Energy"},
    {"ticker": "PTBA", "name": "Bukit Asam", "sector": "Energy"},
    {"ticker": "ANTM", "name": "Aneka Tambang", "sector": "Materials"},
    {"ticker": "INCO", "name": "Vale Indonesia", "sector": "Materials"},
    {"ticker": "SMGR", "name": "Semen Indonesia", "sector": "Materials"},
    {"ticker": "JSMR", "name": "Jasa Marga", "sector": "Infrastructure"},
    {"ticker": "WIKA", "name": "Wijaya Karya", "sector": "Infrastructure"},
    {"ticker": "ACES", "name": "Ace Hardware Indonesia", "sector": "Retail"},
    {"ticker": "MAPI", "name": "Mitra Adiperkasa", "sector": "Retail"},
    {"ticker": "TOWR", "name": "Sarana Menara Nusantara", "sector": "Telecommunications"},
    {"ticker": "CPIN", "name": "Charoen Pokphand", "sector": "Consumer Staples"},
    {"ticker": "EXCL", "name": "XL Axiata", "sector": "Telecommunications"},
    {"ticker": "EMTK", "name": "Elang Mahkota Teknologi", "sector": "Media"},
    {"ticker": "MDKA", "name": "Merdeka Copper Gold", "sector": "Materials"},
    {"ticker": "TINS", "name": "Timah", "sector": "Materials"},
]


def _to_jk(ticker: str) -> str:
    t = ticker.strip().upper()
    return t if t.endswith(IDX_SUFFIX) else f"{t}{IDX_SUFFIX}"


@dataclass
class StockData:
    """Data saham ternormalisasi untuk dipakai LLM / endpoint."""

    ticker: str
    name: str | None = None
    sector: str | None = None
    industry: str | None = None
    currency: str | None = None
    price: float | None = None
    market_cap: float | None = None
    trailing_pe: float | None = None
    forward_pe: float | None = None
    roe: float | None = None
    debt_to_equity: float | None = None
    revenue_growth: float | None = None
    profit_margin: float | None = None
    week52_high: float | None = None
    week52_low: float | None = None
    history: list[dict[str, Any]] = field(default_factory=list)
    fetched_at: str | None = None

    def to_prompt_block(self) -> str:
        """Ringkasan data untuk disisipkan ke prompt LLM (jika ada)."""
        lines = [f"Ticker: {self.ticker} (IDX)"]
        if self.name:
            lines.append(f"Nama: {self.name}")
        if self.sector:
            lines.append(f"Sektor: {self.sector}")
        if self.price is not None:
            lines.append(f"Harga terakhir: {self.currency or 'IDR'} {self.price:,.0f}")
        if self.trailing_pe is not None:
            lines.append(f"P/E (trailing): {self.trailing_pe:.1f}")
        if self.roe is not None:
            lines.append(f"ROE: {self.roe * 100:.1f}%")
        if self.revenue_growth is not None:
            lines.append(f"Pertumbuhan pendapatan: {self.revenue_growth * 100:.1f}%")
        if self.profit_margin is not None:
            lines.append(f"Margin laba: {self.profit_margin * 100:.1f}%")
        if self.week52_high and self.week52_low:
            lines.append(f"Range 52 minggu: {self.week52_low:,.0f} - {self.week52_high:,.0f}")
        if self.history:
            lines.append(
                "Harga penutupan 5 hari terakhir: "
                + ", ".join(f"{h['date']}={h['close']:,.0f}" for h in self.history)
            )
        return "\n".join(lines)


def _stock_to_dict(data: StockData) -> dict[str, Any]:
    return data.__dict__


def _stock_from_dict(payload: dict[str, Any]) -> StockData:
    return StockData(**payload)


def _fetch_once(ticker: str, period: str = "5d") -> StockData | None:
    """Fetch satu kali tanpa cache/retry."""
    import yfinance as yf
    from datetime import datetime, timezone

    jk = _to_jk(ticker)
    t = yf.Ticker(jk)
    info = t.info or {}
    hist = t.history(period=period)

    data = StockData(
        ticker=ticker.strip().upper().removesuffix(IDX_SUFFIX),
        name=info.get("longName") or info.get("shortName"),
        sector=info.get("sector"),
        industry=info.get("industry"),
        currency=info.get("currency"),
        price=info.get("currentPrice") or info.get("regularMarketPrice"),
        market_cap=info.get("marketCap"),
        trailing_pe=info.get("trailingPE"),
        forward_pe=info.get("forwardPE"),
        roe=info.get("returnOnEquity"),
        debt_to_equity=info.get("debtToEquity"),
        revenue_growth=info.get("revenueGrowth"),
        profit_margin=info.get("profitMargins"),
        week52_high=info.get("fiftyTwoWeekHigh"),
        week52_low=info.get("fiftyTwoWeekLow"),
        fetched_at=datetime.now(timezone.utc).isoformat(),
    )

    if hist is not None and not hist.empty:
        for idx, row in hist.tail(5).iterrows():
            data.history.append(
                {
                    "date": idx.strftime("%Y-%m-%d"),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"]),
                }
            )

    if data.price is None and not data.history:
        return None
    return data


def get_stock_data(ticker: str, period: str = "5d") -> StockData | None:
    """Ambil profil + harga saham — dengan cache dulu, lalu retry backoff."""
    # 1) coba cache
    cached = stock_cache.get_cached(ticker)
    if cached:
        return _stock_from_dict(cached)

    # 2) fetch dengan retry
    last_error: Exception | None = None
    for attempt in range(MAX_RETRIES):
        try:
            data = _fetch_once(ticker, period)
            if data:
                stock_cache.set_cached(ticker, _stock_to_dict(data))
                return data
            return None  # ticker tidak valid
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            # Rate-limit: retry tidak membantu (masih 429) → langsung berhenti
            if _is_rate_limit(exc):
                logger.warning("Fetch %s rate-limited (429) — skip retry", ticker)
                break
            logger.warning("Fetch %s attempt %d gagal: %s", ticker, attempt + 1, exc)
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAYS[attempt])

    logger.error("Gagal fetch %s setelah %d percobaan: %s", ticker, MAX_RETRIES, last_error)
    return None


def _is_rate_limit(exc: Exception) -> bool:
    """Deteksi error rate-limit (yfinance YFRateLimitError / pesan 429)."""
    if exc.__class__.__name__ == "YFRateLimitError":
        return True
    msg = str(exc).lower()
    return "too many requests" in msg or "rate limited" in msg or "429" in msg
