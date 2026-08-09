"""Screener endpoint — MVP Feature A (blueprint BAGIAN 8.6: /analysis/screener).

POST /internal/v1/screen
- body: { sector?, max_pe?, min_roe?, min_revenue_growth?, min_profit_margin?, limit?, analyze? }
- analyze=true → AI merangkum top picks (pakai AI Gateway multi-provider)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai.gateway import get_gateway
from app.services.stock.fetcher import IDX_STOCKS
from app.services.stock.screener import ScreenerCriteria, run_screener

router = APIRouter()


@router.get("/screen/sectors")
async def list_sectors() -> dict:
    """Daftar sektor unik (untuk dropdown UI)."""
    sectors = sorted({s["sector"] for s in IDX_STOCKS if s.get("sector")})
    return {"success": True, "data": sectors}


class ScreenRequest(BaseModel):
    sector: str | None = None
    max_pe: float | None = None
    min_roe: float | None = None
    min_revenue_growth: float | None = None
    min_profit_margin: float | None = None
    limit: int = 20
    analyze: bool = False


@router.post("/screen")
async def screen(req: ScreenRequest) -> dict:
    criteria = ScreenerCriteria.from_payload(req.model_dump())
    result = await run_screener(criteria)

    ai_summary = None
    if req.analyze and result["matches"]:
        ai_summary = await _summarize_top_picks(result["matches"])

    return {"success": True, "data": {**result, "ai_summary": ai_summary}}


async def _summarize_top_picks(matches: list[dict]) -> str | None:
    """AI merangkum 5 kandidat terbaik."""
    top = matches[:5]
    lines = []
    for s in top:
        roe = f"{s['roe']*100:.1f}%" if s.get("roe") is not None else "-"
        pe = f"{s['trailing_pe']:.1f}" if s.get("trailing_pe") is not None else "-"
        price = f"{s['price']:,.0f}" if s.get("price") is not None else "-"
        lines.append(
            f"- {s['ticker']} ({s.get('name','')}): harga {price}, P/E {pe}, ROE {roe}, "
            f"sektor {s.get('sector','')}"
        )

    prompt = (
        "Berikut 5 saham IDX hasil screening fundamental (diurutkan terbaik):\n\n"
        + "\n".join(lines)
        + "\n\nRangkum dalam 3-4 kalimat bahasa Indonesia: kekuatan umum kandidat ini, "
        "hal yang perlu diperhatikan, dan disclaimer edukatif. "
        "JANGAN berikan rekomendasi beli/jual eksplisit."
    )
    try:
        result = await get_gateway().generate(
            prompt, system="Kamu adalah analis saham Indonesia yang objektif."
        )
        return result["content"]
    except RuntimeError:
        return None
