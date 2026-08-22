"""
TAHAP 1b–1d — Builder dataset SFT 3 kemampuan 4IG-Finance.

Menghasilkan dataset format Alpaca JSONL dari data fundamental saham IDX:
  1. PEMAHAMAN  : Q&A konsep saham & laporan keuangan (edukasi)
  2. PENILAIAN  : valuasi per saham (angka real → label murah/wajar/premium)
  3. REKOMENDASI: analisis lengkap (data → risiko → kesimpulan edukatif → disclaimer)

Sumber data default: `apps/ai-service/app/services/stock/demo_data.py` (28 saham IDX,
offline). Untuk produksi, ganti dengan data fundamental historis (yfinance) — struktur
dict sama: ticker, name, sector, price, trailing_pe, roe, revenue_growth, profit_margin.

Penggunaan:
    python3 stage1_data/build_sft_dataset.py --limit 28 --out data/sft/dataset.jsonl
    python3 stage1_data/build_sft_dataset.py --stocks-json data/stocks.json --out data/sft/dataset.jsonl

Output per baris:
    {"instruction": "...", "input": "...", "output": "...", "capability": "pemahaman|penilaian|rekomendasi"}
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # apps/ai-training
sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "apps" / "ai-service"))

DISCLAIMER = (
    "Disclaimer: ini alat edukatif, bukan rekomendasi beli/jual. "
    "Keputusan investasi tetap tanggung jawab Anda. Konsultasikan dengan penasihat keuangan."
)

# ---------------------------------------------------------------------------
# 1) PEMAHAMAN — konsep dasar (statis, bisa diperluas 50-100K via corpus)
# ---------------------------------------------------------------------------
CONCEPTS: list[dict] = [
    {"konsep": "Price to Earnings (PER)", "arti": "rasio harga saham dibagi laba per saham (EPS)", "contoh": "PER 15x artinya investor membayar 15x laba tahunan perusahaan", "penting": "PER rendah bisa berarti murah, tapi juga bisa berarti pasar meragukan pertumbuhan"},
    {"konsep": "Price to Book Value (PBV)", "arti": "rasio harga saham dibagi nilai buku per saham", "contoh": "PBV 1x artinya harga saham sama dengan nilai aset bersihnya", "penting": "Cocok untuk bank & perusahaan aset-berat"},
    {"konsep": "Return on Equity (ROE)", "arti": "laba bersih dibagi ekuitas — ukuran efisiensi modal", "contoh": "ROE 20% artinya setiap Rp100 modal menghasilkan Rp20 laba", "penting": "ROE konsisten di atas 15% umumnya dianggap baik"},
    {"konsep": "Debt to Equity Ratio (DER)", "arti": "total utang dibagi ekuitas", "contoh": "DER 1x artinya utang setara ekuitas", "penting": "DER tinggi meningkatkan risiko, terutama saat suku bunga naik"},
    {"konsep": "Profit Margin", "arti": "persentase laba dari pendapatan", "contoh": "margin 20% artinya Rp20 laba dari setiap Rp100 penjualan", "penting": "Margin tinggi & stabil = daya saing kuat (moat)"},
    {"konsep": "Revenue Growth", "arti": "pertumbuhan pendapatan tahunan", "contoh": "growth 10% artinya pendapatan naik 10% dibanding periode sebelumnya", "penting": "Growth tanpa profitabilitas bisa jadi sinyal buruk"},
    {"konsep": "Market Cap", "arti": "total nilai pasar = harga saham × jumlah saham beredar", "contoh": "kapitalisasi Rp100 triliun termasuk emiten large cap", "penting": "Large cap umumnya lebih likuid & stabil"},
    {"konsep": "Dividend Yield", "arti": "dividen per saham dibagi harga saham", "contoh": "yield 5% artinya investor menerima 5% dari harga dalam setahun", "penting": "Yield tinggi bisa menarik, tapi cek keberlanjutan dividen"},
    {"konsep": "Screener fundamental", "arti": "penyaringan saham berdasarkan metrik keuangan", "contoh": "filter ROE > 15%, PER < 15x, growth > 5%", "penting": "Awali dengan kualitas (ROE/margin), baru valuasi (PER/PBV)"},
    {"konsep": "Diversifikasi", "arti": "menyebar investasi ke beberapa aset/sektor", "contoh": "jangan menaruh semua dana di satu saham", "penting": "Mengurangi risiko spesifik emiten"},
    {"konsep": "Laporan keuangan", "arti": "laporan laba rugi, neraca, dan arus kas", "contoh": "cek laba bersih, ekuitas, utang, dan arus kas operasi", "penting": "Arus kas operasi positif penting untuk keberlanjutan dividen"},
    {"konsep": "Siklus sektor", "arti": "kinerja sektor mengikuti siklus ekonomi", "contoh": "bank untung saat suku bunga naik, properti peka terhadap daya beli", "penting": "Pahami posisi siklus sebelum memilih sektor"},
]


def qa_pemahaman() -> list[dict]:
    out = []
    for c in CONCEPTS:
        out.append(
            {
                "instruction": f"Jelaskan konsep {c['konsep']} dengan bahasa sederhana untuk investor pemula.",
                "input": "",
                "output": (
                    f"**{c['konsep']}** adalah {c['arti']}. Contoh: {c['contoh']}. "
                    f"Yang perlu diperhatikan: {c['penting']}. {DISCLAIMER}"
                ),
                "capability": "pemahaman",
            }
        )
    out.append(
            {
                "instruction": "Sebutkan 3 metrik yang paling penting untuk menilai saham, dan jelaskan singkat.",
                "input": "",
                "output": (
                    "Tiga metrik penting: 1) ROE — efisiensi modal (semakin konsisten di atas 15%, "
                    "semakin baik). 2) PER — valuasi relatif terhadap laba (bandingkan dengan rata-rata "
                    "sektor, bukan angka absolut). 3) Pertumbuhan pendapatan — momentum bisnis; "
                    "periksa juga profit margin agar growth berkualitas. "
                    f"{DISCLAIMER}"
                ),
                "capability": "pemahaman",
            }
        )
    return out


# ---------------------------------------------------------------------------
# Helper metrik
# ---------------------------------------------------------------------------
def _pct(v) -> str:
    return f"{round(v * 100, 1)}%" if v is not None else "tidak tersedia"


def _num(v, suffix: str = "") -> str:
    return f"{round(v, 2)}{suffix}" if v is not None else "tidak tersedia"


def _label_valuasi(pe: float | None, sektor_median_pe: float | None) -> str:
    if pe is None or sektor_median_pe is None:
        return "tidak dapat ditentukan (data valuasi sektor tidak tersedia)"
    r = pe / sektor_median_pe
    if r < 0.8:
        return "cenderung murah dibandingkan rata-rata sektor"
    if r <= 1.2:
        return "cenderung wajar dibandingkan rata-rata sektor"
    return "cenderung premium dibandingkan rata-rata sektor"


# ---------------------------------------------------------------------------
# 2) PENILAIAN — valuasi per saham (angka real)
# ---------------------------------------------------------------------------
def qa_penilaian(stocks: list[dict]) -> list[dict]:
    sektor_pe: dict[str, list[float]] = {}
    for s in stocks:
        if s.get("trailing_pe") is not None:
            sektor_pe.setdefault(s["sector"], []).append(s["trailing_pe"])
    median_pe = {k: sorted(v)[len(v) // 2] for k, v in sektor_pe.items() if v}

    out = []
    for s in stocks:
        t = s["ticker"]
        pe = s.get("trailing_pe")
        sektor = s.get("sector", "?")
        med = median_pe.get(sektor)
        label = _label_valuasi(pe, med)
        roe = s.get("roe")
        growth = s.get("revenue_growth")
        margin = s.get("profit_margin")
        kualitas = "kuat" if (roe or 0) > 0.15 and (margin or 0) > 0.15 else "moderat"

        out.append(
            {
                "instruction": (
                    f"Lakukan penilaian valuasi saham {t} ({s.get('name','')}) sektor {sektor}. "
                    "Data: harga, PER, ROE, pertumbuhan pendapatan, margin laba. "
                    "Sebutkan label valuasi relatif terhadap sektor, lalu jelaskan alasannya."
                ),
                "input": (
                    f"ticker={t}; name={s.get('name','')}; sector={sektor}; "
                    f"price={_num(s.get('price'))}; trailing_pe={_num(pe, 'x')}; "
                    f"roe={_pct(roe)}; revenue_growth={_pct(growth)}; profit_margin={_pct(margin)}; "
                    f"median_pe_sektor={_num(med, 'x')}"
                ),
                "output": (
                    f"**Penilaian {t} ({s.get('name','')})**\n\n"
                    f"- PER {_num(pe, 'x')} vs median sektor {_num(med, 'x')} → {label}.\n"
                    f"- ROE {_pct(roe)} dan margin {_pct(margin)} menunjukkan kualitas fundamental {kualitas}.\n"
                    f"- Pertumbuhan pendapatan {_pct(growth)}.\n\n"
                    f"**Kesimpulan edukatif**: {t} saat ini {label}. "
                    f"Ini bahan pertimbangan, bukan sinyal beli/jual. {DISCLAIMER}"
                ),
                "capability": "penilaian",
            }
        )
    return out


# ---------------------------------------------------------------------------
# 3) REKOMENDASI — analisis lengkap (edukatif)
# ---------------------------------------------------------------------------
def qa_rekomendasi(stocks: list[dict]) -> list[dict]:
    out = []
    for s in stocks:
        t = s["ticker"]
        pe = s.get("trailing_pe")
        roe = s.get("roe")
        growth = s.get("revenue_growth")
        margin = s.get("profit_margin")
        risiko = []
        if (pe or 99) > 20:
            risiko.append("valuasi premium berisiko koreksi bila ekspektasi tidak terpenuhi")
        if (roe or 0) < 0.10:
            risiko.append("ROE rendah menandakan efisiensi modal lemah")
        if (growth or 0) < 0:
            risiko.append("pendapatan terkontraksi — periksa penyebabnya")
        if (margin or 0) < 0.05:
            risiko.append("margin tipis — sensitif terhadap kenaikan biaya")
        if not risiko:
            risiko.append("risiko utama adalah perubahan kondisi makro & sektor")
        out.append(
            {
                "instruction": (
                    f"Berikan analisis fundamental lengkap untuk {t} ({s.get('name','')}) sektor {s.get('sector','?')} "
                    "dengan format: data ringkas → kekuatan → risiko → kesimpulan edukatif."
                ),
                "input": (
                    f"ticker={t}; price={_num(s.get('price'))}; trailing_pe={_num(pe, 'x')}; "
                    f"roe={_pct(roe)}; revenue_growth={_pct(growth)}; profit_margin={_pct(margin)}"
                ),
                "output": (
                    f"**Analisis {t} ({s.get('name','')}) — sektor {s.get('sector','?')}**\n\n"
                    f"**Data ringkas**: PER {_num(pe, 'x')} · ROE {_pct(roe)} · "
                    f"pertumbuhan {_pct(growth)} · margin {_pct(margin)}.\n\n"
                    f"**Kekuatan**: fundamental {'kuat' if (roe or 0) > 0.15 else 'moderat'} "
                    f"(ROE {_pct(roe)}), margin {_pct(margin)}.\n\n"
                    f"**Risiko**: {'; '.join(risiko)}.\n\n"
                    f"**Kesimpulan edukatif**: {t} layak dipelajari lebih lanjut dengan fokus pada "
                    f"{'valuasi' if (pe or 99) > 18 else 'pertumbuhan & kualitas laba'}. "
                    f"{DISCLAIMER}"
                ),
                "capability": "rekomendasi",
            }
        )
    return out


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def load_stocks(args) -> list[dict]:
    if args.stocks_json:
        return json.loads(Path(args.stocks_json).read_text(encoding="utf-8"))
    from app.services.stock.demo_data import DEMO_STOCKS  # noqa: PLC0415

    return DEMO_STOCKS


def main() -> None:
    ap = argparse.ArgumentParser(description="Builder dataset SFT 3 kemampuan 4IG-Finance")
    ap.add_argument("--limit", type=int, default=28, help="batas jumlah saham yang dipakai")
    ap.add_argument("--out", default="data/sft/dataset.jsonl", help="path output JSONL")
    ap.add_argument("--stocks-json", default=None, help="path JSON daftar saham (opsional, default demo_data)")
    args = ap.parse_args()

    stocks = load_stocks(args)[: args.limit]
    if not stocks:
        sys.exit("Tidak ada data saham. Cek --stocks-json atau demo_data.")

    rows = qa_pemahaman() + qa_penilaian(stocks) + qa_rekomendasi(stocks)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    stat = {}
    for r in rows:
        stat[r["capability"]] = stat.get(r["capability"], 0) + 1
    print(f"✅ Dataset tersimpan: {out_path} ({len(rows)} contoh)")
    for k, v in stat.items():
        print(f"   - {k}: {v}")


if __name__ == "__main__":
    main()
