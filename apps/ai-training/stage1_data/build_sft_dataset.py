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
    {"konsep": "Free Cash Flow (FCF)", "arti": "arus kas operasi dikurangi belanja modal", "contoh": "FCF positif berkelanjutan berarti perusahaan mampu bayar dividen & ekspansi", "penting": "Laba akuntansi bisa menipu; FCF lebih sulit dimanipulasi"},
    {"konsep": "Net Interest Margin (NIM)", "arti": "selisih bunga yang diterima dan dibayar bank, dibagi aset produktif", "contoh": "NIM 5% artinya bank mendapat margin bunga 5% dari dana yang disalurkan", "penting": "Metrik kunci kesehatan bank — NIM stabil = bisnis inti sehat"},
    {"konsep": "Dividend Payout Ratio", "arti": "porsi laba yang dibagikan sebagai dividen", "contoh": "payout 60% artinya 60% laba dibagikan, sisanya ditahan", "penting": "Payout >100% tidak berkelanjutan — biasanya dibiayai utang"},
    {"konsep": "Dollar Cost Averaging (DCA)", "arti": "investasi rutin dengan nominal tetap secara berkala", "contoh": "beli Rp1 juta setiap bulan terlepas dari harga pasar", "penting": "Mengurangi risiko timing dan efek emosi pada keputusan"},
    {"konsep": "Saham vs Obligasi", "arti": "saham = kepemilikan perusahaan; obligasi = pinjaman berbunga", "contoh": "saham menawarkan potensi naik lebih besar dengan risiko lebih tinggi", "penting": "Proporsi keduanya tergantung profil risiko & horizon investasi"},
    {"konsep": "Likuiditas pasar", "arti": "kemudahan membeli/menjual saham tanpa mengubah harga signifikan", "contoh": "volume transaksi harian tinggi = likuid", "penting": "Saham illikuid sulit dijual cepat saat butuh dana"},
    {"konsep": "Rights Issue", "arti": "penawaran saham baru kepada pemegang saham lama", "contoh": "HMETD (rights) dijual dengan harga diskon", "penting": "Bisa mendilusi kepemilikan — cek tujuan dana & harga tebus"},
    {"konsep": "Stock Split", "arti": "pemecahan nominal saham tanpa mengubah nilai perusahaan", "contoh": "split 1:2 membuat harga saham setengahnya, jumlah lembar dua kali lipat", "penting": "Split bukan katalis fundamental — hanya psikologis & likuiditas"},
    {"konsep": "Buyback", "arti": "perusahaan membeli kembali sahamnya sendiri", "contoh": "buyback mengurangi saham beredar sehingga EPS naik", "penting": "Buyback bagus bila dana menganggur & harga di bawah nilai wajar"},
    {"konsep": "Inflasi & saham", "arti": "kenaikan harga umum mengurangi daya beli uang", "contoh": "inflasi tinggi menekan margin & mendorong suku bunga naik", "penting": "Saham dengan pricing power lebih tahan terhadap inflasi"},
    {"konsep": "Suku bunga & saham", "arti": "suku bunga acuan bank sentral memengaruhi biaya modal", "contoh": "suku bunga naik → valuasi saham cenderung turun (discount rate naik)", "penting": "Sektor utang-berat & properti paling sensitif terhadap bunga"},
    {"konsep": "Earnings per Share (EPS)", "arti": "laba bersih dibagi jumlah saham beredar", "contoh": "EPS naik 15% berarti laba per lembar tumbuh", "penting": "Pertumbuhan EPS adalah pendorong utama harga jangka panjang"},
    {"konsep": "Kuartal & musiman", "arti": "kinerja bisa fluktuatif antar kuartal (musiman)", "contoh": "ritel kuat di Q4, konstruksi kuat di musim kemarau", "penting": "Bandingkan kinerja dengan kuartal yang sama tahun lalu"},
    {"konsep": "Analisis sebanding (peer comparison)", "arti": "membandingkan metrik perusahaan dengan kompetitor sektor", "contoh": "bandingkan PER BBCA dengan BBNI, bukan dengan TLKM", "penting": "Perbandingan antar sektor yang beda bisa menyesatkan"},
    {"konsep": "Safety margin (margin of safety)", "arti": "jarak antara harga pasar dan estimasi nilai wajar", "contoh": "beli saat harga 30% di bawah estimasi nilai wajar memberi bantalan", "penting": "Estimasi bisa salah — margin of safety melindungi dari kesalahan itu"},
    {"konsep": "Katalis (catalyst)", "arti": "peristiwa yang bisa menggerakkan harga saham", "contoh": "rilis laporan keuangan, dividen, kontrak baru, regulasi", "penting": "Saham murah tanpa katalis bisa murah bertahun-tahun (value trap)"},
    {"konsep": "Value trap", "arti": "saham tampak murah tapi fundamentalnya memburuk terus", "contoh": "PER rendah karena laba sedang turun drastis", "penting": "Cek kenapa murah — murah karena masalah bukan berarti peluang"},
    {"konsep": "Compound interest", "arti": "bunga berbunga — laba yang diinvestasikan kembali", "contoh": "return 15%/tahun menggandakan nilai dalam ±5 tahun", "penting": "Waktu adalah sahabat investor yang sabar & konsisten"},
    {"konsep": "Aksi korporasi", "arti": "kegiatan perusahaan yang memengaruhi saham", "contoh": "dividen, rights issue, stock split, buyback, merger", "penting": "Selalu cek jadwal & mekanisme aksi korporasi di IDX"},
    {"konsep": "Emisi obligasi perusahaan", "arti": "perusahaan meminjam dari publik via obligasi", "contoh": "obligasi korporasi berbunga tetap 8% per tahun", "penting": "Cek rating obligasi & kemampuan bayar perusahaan"},
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
    sektor_margin: dict[str, list[float]] = {}
    for s in stocks:
        if s.get("trailing_pe") is not None:
            sektor_pe.setdefault(s["sector"], []).append(s["trailing_pe"])
        if s.get("profit_margin") is not None:
            sektor_margin.setdefault(s["sector"], []).append(s["profit_margin"])
    median_pe = {k: sorted(v)[len(v) // 2] for k, v in sektor_pe.items() if v}
    median_margin = {k: sorted(v)[len(v) // 2] for k, v in sektor_margin.items() if v}

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
        # Variasi 2 — pertanyaan singkat nilai wajar
        out.append(
            {
                "instruction": f"Apakah saham {t} ({s.get('name','')}) tergolong murah, wajar, atau mahal? Jelaskan.",
                "input": (
                    f"trailing_pe={_num(pe, 'x')}; median_pe_sektor={_num(med, 'x')}; "
                    f"roe={_pct(roe)}; revenue_growth={_pct(growth)}"
                ),
                "output": (
                    f"{t} memiliki PER {_num(pe, 'x')} sementara median sektor {sektor} "
                    f"{_num(med, 'x')}, sehingga {label}. Kualitasnya {kualitas} "
                    f"(ROE {_pct(roe)}, pertumbuhan {_pct(growth)}). "
                    f"Penilaian ini edukatif, bukan ajakan bertransaksi. {DISCLAIMER}"
                ),
                "capability": "penilaian",
            }
        )
        # Variasi 3 — bandingkan dengan median sektor
        out.append(
            {
                "instruction": f"Bandingkan valuasi {t} dengan rata-rata sektor {sektor} dan beri pandangan singkat.",
                "input": (
                    f"ticker={t}; trailing_pe={_num(pe, 'x')}; median_pe_sektor={_num(med, 'x')}; "
                    f"profit_margin={_pct(margin)}"
                ),
                "output": (
                    f"PER {t} {_num(pe, 'x')} vs median {sektor} {_num(med, 'x')} → {label}. "
                    f"Dengan margin {_pct(margin)}, {t} {'lebih efisien' if (margin or 0) >= (median_margin.get(sektor) or 0) else 'di bawah rata-rata efisiensi sektor'}. "
                    f"Gunakan ini sebagai bahan riset, bukan rekomendasi. {DISCLAIMER}"
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
        # Variasi 2 — ringkasan investasi singkat
        out.append(
            {
                "instruction": f"Ringkas profil investasi {t} ({s.get('name','')}) dalam 3 poin.",
                "input": (
                    f"trailing_pe={_num(pe, 'x')}; roe={_pct(roe)}; "
                    f"revenue_growth={_pct(growth)}; profit_margin={_pct(margin)}"
                ),
                "output": (
                    f"1) Kualitas: ROE {_pct(roe)} dengan margin {_pct(margin)} → "
                    f"{'fundamental kuat' if (roe or 0) > 0.15 and (margin or 0) > 0.15 else 'fundamental moderat'}.\n"
                    f"2) Pertumbuhan: pendapatan {_pct(growth)}.\n"
                    f"3) Valuasi: PER {_num(pe, 'x')} — "
                    f"{'perhatikan kecocokan dengan ekspektasi pertumbuhan' if (pe or 99) > 18 else 'masih dalam kisaran wajar untuk riset lebih lanjut'}.\n"
                    f"Ringkasan ini edukatif, bukan ajakan bertransaksi. {DISCLAIMER}"
                ),
                "capability": "rekomendasi",
            }
        )
    return out


# ---------------------------------------------------------------------------
# 3b) PERBANDINGAN — pilih yang paling murah/berkualitas di sektor (dari data real)
# ---------------------------------------------------------------------------
def qa_perbandingan(stocks: list[dict]) -> list[dict]:
    """Tanya-jawab deterministik: saham termurah/terbaik per sektor dari data real."""
    by_sector: dict[str, list[dict]] = {}
    for s in stocks:
        by_sector.setdefault(s["sector"], []).append(s)

    out = []
    for sektor, group in by_sector.items():
        if len(group) < 2:
            continue
        dengan_pe = [s for s in group if s.get("trailing_pe") is not None]
        if len(dengan_pe) < 2:
            continue
        termurah = min(dengan_pe, key=lambda s: s["trailing_pe"])
        tertinggi_roe = max(group, key=lambda s: s.get("roe") or 0)
        daftar = ", ".join(
            f"{s['ticker']} (PER {_num(s.get('trailing_pe'), 'x')})"
            for s in sorted(dengan_pe, key=lambda s: s["trailing_pe"])
        )

        out.append(
            {
                "instruction": f"Di sektor {sektor}, saham mana yang paling murah berdasarkan PER? Jelaskan.",
                "input": f"daftar={daftar}",
                "output": (
                    f"Di sektor {sektor}, urutan PER termurah: {daftar}. "
                    f"{termurah['ticker']} memiliki PER terendah ({_num(termurah.get('trailing_pe'), 'x')}). "
                    f"Namun PER rendah harus dicek kualitasnya: ROE {_pct(termurah.get('roe'))} dan "
                    f"pertumbuhan {_pct(termurah.get('revenue_growth'))}. "
                    f"Murah tanpa kualitas bisa jadi value trap. {DISCLAIMER}"
                ),
                "capability": "penilaian",
            }
        )
        roe_daftar = ", ".join(
            f"{s['ticker']} (ROE {_pct(s.get('roe'))})"
            for s in sorted(group, key=lambda s: s.get("roe") or 0, reverse=True)
        )
        out.append(
            {
                "instruction": f"Di sektor {sektor}, saham mana yang fundamentalnya terbaik berdasarkan ROE?",
                "input": f"daftar={roe_daftar}",
                "output": (
                    f"Di sektor {sektor}, {tertinggi_roe['ticker']} punya ROE tertinggi "
                    f"({_pct(tertinggi_roe.get('roe'))}). ROE tinggi menunjukkan efisiensi modal, "
                    f"tapi tetap bandingkan dengan valuasinya (PER {_num(tertinggi_roe.get('trailing_pe'), 'x')}) "
                    f"dan pertumbuhan ({_pct(tertinggi_roe.get('revenue_growth'))}). {DISCLAIMER}"
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

    rows = qa_pemahaman() + qa_penilaian(stocks) + qa_rekomendasi(stocks) + qa_perbandingan(stocks)

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
