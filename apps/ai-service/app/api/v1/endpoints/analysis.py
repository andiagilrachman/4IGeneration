"""Analisis endpoint — masuk ke AI Gateway.

TODO (Bulan 3 roadmap): integrasi data saham (yfinance/Alpha Vantage),
prompt template dari DB (PromptTemplate), deduksi kredit, dsb.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ai.gateway import get_gateway

router = APIRouter()


class AnalyzeStockRequest(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=10, description="Kode saham IDX, mis. BBCA")
    prompt: str | None = None


@router.post("/analyze/stock")
async def analyze_stock(req: AnalyzeStockRequest) -> dict:
    prompt = req.prompt or (
        f"Analisis saham {req.ticker.upper()} secara fundamental dan teknikal: "
        "ringkas, data-driven, bahasa Indonesia, dengan disclaimer edukatif. "
        "JANGAN berikan rekomendasi beli/jual eksplisit."
    )
    try:
        result = await get_gateway().generate(prompt, system="Kamu adalah analis saham Indonesia yang objektif.")
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {"success": True, "data": result}
