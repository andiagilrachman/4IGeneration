"""Analisis endpoint — ambil data saham nyata, lalu kirim ke AI Gateway.

Alur (sesuai blueprint BAGIAN 10):
1. Fetch data saham real (yfinance) untuk ticker
2. Susun prompt berisi data tersebut
3. Kirim ke AI Gateway (fallback multi-provider)
4. Kembalikan hasil + data yang dipakai

TODO (Bulan 3 lanjutan):
- Prompt template dari DB (PromptTemplate table)
- Deduksi kredit & pencatatan usage
- Screening & fitur lain
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ai.gateway import get_gateway
from app.services.stock.fetcher import get_stock_data, IDX_STOCKS

router = APIRouter()


class AnalyzeStockRequest(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=10, description="Kode saham IDX, mis. BBCA")
    prompt: str | None = None


@router.post("/analyze/stock")
async def analyze_stock(req: AnalyzeStockRequest) -> dict:
    ticker = req.ticker.strip().upper()

    # 1) coba ambil data nyata
    stock = get_stock_data(ticker)
    data_block = stock.to_prompt_block() if stock else None

    if data_block:
        prompt = req.prompt or (
            f"Analisis saham {ticker} (IDX) secara fundamental dan teknikal "
            "berdasarkan DATA NYATA berikut:\n\n"
            f"{data_block}\n\n"
            "Berikan analisis ringkas, data-driven, dalam bahasa Indonesia, "
            "dengan disclaimer edukatif. JANGAN berikan rekomendasi beli/jual eksplisit."
        )
    else:
        prompt = req.prompt or (
            f"Analisis saham {ticker} secara fundamental dan teknikal: "
            "ringkas, data-driven, bahasa Indonesia, dengan disclaimer edukatif. "
            "JANGAN berikan rekomendasi beli/jual eksplisit."
        )

    try:
        result = await get_gateway().generate(
            prompt, system="Kamu adalah analis saham Indonesia yang objektif dan berbasis data."
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "success": True,
        "data": {
            **result,
            "stock_data": stock.to_prompt_block() if stock else None,
        },
    }


class CompareRequest(BaseModel):
    tickers: list[str] = Field(..., min_length=2, max_length=5, description="2-5 kode saham IDX")


@router.post("/analyze/compare")
async def compare_stocks(req: CompareRequest) -> dict:
    """Bandingkan 2-5 saham: data nyata tiap saham + AI summary (W33-34)."""
    stocks = []
    for t in req.tickers:
        s = get_stock_data(t.strip().upper())
        if s:
            stocks.append(
                {
                    "ticker": s.ticker,
                    "name": s.name,
                    "price": s.price,
                    "trailing_pe": s.trailing_pe,
                    "roe": s.roe,
                    "revenue_growth": s.revenue_growth,
                    "profit_margin": s.profit_margin,
                    "week52_high": s.week52_high,
                    "week52_low": s.week52_low,
                }
            )

    if len(stocks) < 2:
        raise HTTPException(status_code=400, detail="Minimal 2 saham valid untuk dibandingkan")

    lines = []
    for s in stocks:
        lines.append(
            f"- {s['ticker']} ({s.get('name','')}): harga {s.get('price')}, "
            f"P/E {s.get('trailing_pe')}, ROE {round(s['roe']*100,1) if s.get('roe') else '-'}%, "
            f"margin {round(s['profit_margin']*100,1) if s.get('profit_margin') else '-'}%"
        )
    prompt = (
        "Bandingkan saham-saham IDX berikut berdasarkan DATA NYATA:\n\n"
        + "\n".join(lines)
        + "\n\nBuat perbandingan ringkas (maks 250 kata, bahasa Indonesia): "
        "1) Tabel singkat perbandingan metrik utama, 2) Kekuatan & kelemahan tiap saham, "
        "3) Kesimpulan objektif. JANGAN berikan rekomendasi beli/jual eksplisit."
    )
    try:
        result = await get_gateway().generate(
            prompt, system="Kamu adalah analis saham Indonesia yang objektif dan berbasis data."
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "success": True,
        "data": {
            "stocks": stocks,
            "summary": result["content"],
            "provider": result["provider"],
            "model_alias": result["model_alias"],
        },
    }


@router.get("/stocks/{ticker}")
async def get_stock(ticker: str) -> dict:
    """Data saham mentah (profil + harga) untuk satu ticker."""
    stock = get_stock_data(ticker)
    if stock is None:
        raise HTTPException(status_code=404, detail=f"Data saham {ticker} tidak ditemukan")
    return {"success": True, "data": stock.__dict__}


@router.get("/stocks")
async def list_stocks() -> dict:
    """Daftar saham IDX likuid (untuk screener & autocomplete)."""
    return {"success": True, "data": IDX_STOCKS}
