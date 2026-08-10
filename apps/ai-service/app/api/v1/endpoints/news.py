"""News & Market Recap endpoints (W19-20).

- GET  /news?topic=saham         → berita terbaru (Google News RSS)
- POST /news/sentiment           → analisis sentiment berita via AI Gateway
- POST /market-recap             → ringkasan pasar harian (berita + data + AI)
"""

from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai.gateway import get_gateway
from app.services.news.fetcher import fetch_news, fetch_news_multiple
from app.services.stock.screener import ScreenerCriteria, run_screener

router = APIRouter()


@router.get("/news")
async def news(topic: str = "saham", limit: int = 10) -> dict:
    """Berita pasar modal Indonesia terbaru."""
    items = fetch_news(topic, min(limit, 20))
    return {"success": True, "data": {"topic": topic, "total": len(items), "items": items}}


class SentimentRequest(BaseModel):
    topic: str = "saham"
    limit: int = 8


@router.post("/news/sentiment")
async def sentiment(req: SentimentRequest) -> dict:
    """Analisis sentiment berita terbaru (AI Gateway)."""
    items = fetch_news(req.topic, min(req.limit, 15))
    if not items:
        raise HTTPException(status_code=502, detail="Tidak ada berita untuk dianalisis")

    headlines = "\n".join(f"- {i['title']}" for i in items)
    prompt = (
        "Berikut judul berita pasar modal Indonesia terbaru:\n\n"
        f"{headlines}\n\n"
        "Analisis sentimen pasar secara keseluruhan (positif/netral/negatif) dengan skor 1-100 "
        "(50 = netral). Jawab format JSON: {\"sentiment\": \"positif|netral|negatif\", "
        "\"score\": <0-100>, \"summary\": \"<1-2 kalimat bahasa Indonesia>\"}. "
        "Bersikap objektif, jangan overclaim."
    )
    try:
        result = await get_gateway().generate(
            prompt, system="Kamu adalah analis pasar modal Indonesia yang objektif."
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "success": True,
        "data": {
            "topic": req.topic,
            "news_count": len(items),
            "ai_result": result,
            "items": items[:5],
        },
    }


@router.post("/market-recap")
async def market_recap() -> dict:
    """Ringkasan pasar harian: berita + kondisi saham + AI summary."""
    # 1) berita terbaru
    news_items = fetch_news_multiple()

    # 2) kondisi saham utama (ambil data live/demo lewat screener kosong)
    screener = await run_screener(ScreenerCriteria(limit=8))
    top = screener.get("matches", [])

    # 3) AI menyusun recap
    news_lines = "\n".join(f"- {i['title']}" for i in news_items[:12])
    stock_lines = "\n".join(
        f"- {s['ticker']}: harga {s.get('price') or '-'}, ROE {s.get('roe')}, PE {s.get('trailing_pe')}"
        for s in top
    )
    prompt = (
        "Buat RINGKASAN PASAR HARIAN Indonesia dalam bahasa Indonesia (maks 250 kata) dengan struktur:\n"
        "1) Ringkasan singkat kondisi pasar\n"
        "2) Berita utama (3-4 poin)\n"
        "3) Saham yang menonjol (dari data)\n"
        "4) Disclaimer edukatif\n\n"
        f"=== BERITA TERBARU ===\n{news_lines}\n\n=== DATA SAHAM UTAMA ===\n{stock_lines}"
    )
    try:
        result = await get_gateway().generate(
            prompt, system="Kamu adalah analis pasar modal Indonesia yang objektif dan ringkas."
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "success": True,
        "data": {
            "source": screener.get("source", "live"),
            "date": date.today().isoformat(),
            "recap": result["content"],
            "provider": result["provider"],
            "model_alias": result["model_alias"],
            "news_count": len(news_items),
            "news": news_items[:8],
            "top_stocks": top,
        },
    }
