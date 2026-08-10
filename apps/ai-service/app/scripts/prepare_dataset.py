"""
4IGeneration — Persiapan dataset fine-tuning (Phase 4, W41-42).

Mengumpulkan data analisis saham (hasil AI + data fundamental) menjadi
dataset format chat untuk fine-tune model 4IG-Finance (QLoRA).

Alur:
1. Ambil data saham IDX nyata (yfinance) untuk daftar ticker
2. Susun pasangan prompt → jawaban (format chat Alpaca)
3. Simpan ke JSONL

Penggunaan:
    .venv/bin/python -m app.scripts.prepare_dataset --limit 10 --output data/finetune.jsonl
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))


SYSTEM_PROMPT = (
    "Kamu adalah 4IG-Finance, analis saham Indonesia yang objektif dan berbasis data. "
    "Jawab dalam bahasa Indonesia, sertakan angka & metrik, dan selalu akhiri dengan "
    "disclaimer bahwa ini alat edukatif, bukan rekomendasi investasi."
)


def build_prompt(stock: dict) -> str:
    price = stock.get("price") or "-"
    pe = stock.get("trailing_pe") or "-"
    roe = stock.get("roe")
    roe_s = f"{round(roe*100,1)}%" if roe is not None else "-"
    growth = stock.get("revenue_growth")
    growth_s = f"{round(growth*100,1)}%" if growth is not None else "-"
    margin = stock.get("profit_margin")
    margin_s = f"{round(margin*100,1)}%" if margin is not None else "-"
    return (
        f"Analisis saham {stock['ticker']} (IDX) — {stock.get('name','')}. "
        f"Data: harga {price}, P/E {pe}, ROE {roe_s}, pertumbuhan pendapatan {growth_s}, "
        f"margin laba {margin_s}. Berikan analisis fundamental ringkas."
    )


def build_answer(stock: dict) -> str:
    ticker = stock["ticker"]
    name = stock.get("name", "")
    roe = stock.get("roe")
    roe_s = f"{round(roe*100,1)}%" if roe is not None else "tidak tersedia"
    pe = stock.get("trailing_pe")
    pe_s = f"{pe:.1f}x" if pe is not None else "tidak tersedia"
    return (
        f"**Analisis {ticker} ({name})**\n\n"
        f"- ROE {roe_s} menunjukkan efisiensi modal yang {'kuat' if (roe or 0) > 0.15 else 'moderat'}.\n"
        f"- Valuasi P/E {pe_s} {'relatif terjangkau' if (pe or 99) < 15 else 'cenderung premium'} "
        f"dibandingkan peer.\n\n"
        f"Disclaimer: analisis ini bersifat edukatif dan bukan rekomendasi investasi. "
        f"Keputusan investasi sepenuhnya tanggung jawab pengguna."
    )


def prepare(limit: int = 10, output: str = "data/finetune.jsonl") -> int:
    from app.services.stock.fetcher import IDX_STOCKS, get_stock_data

    out_path = Path(output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    count = 0
    with out_path.open("w", encoding="utf-8") as f:
        for item in IDX_STOCKS[:limit]:
            stock = get_stock_data(item["ticker"])
            if not stock:
                continue
            record = {
                "instruction": build_prompt(stock.__dict__),
                "output": build_answer(stock.__dict__),
                "system": SYSTEM_PROMPT,
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
            count += 1
            print(f"  ✓ {stock.ticker}: {len(record['instruction'])} chars")

    print(f"\n✅ {count} sampel → {out_path}")
    return count


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=10, help="Jumlah saham (max 28)")
    parser.add_argument("--output", default="data/finetune.jsonl")
    args = parser.parse_args()
    prepare(args.limit, args.output)
