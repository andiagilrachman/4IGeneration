"""
TAHAP 1a — Unduh SEMUA sumber corpus teks manusia (resep WicaraLLM, Apache-2.0).

6 sumber, 100% teks DITULIS MANUSIA (bukan output LLM):
  HF streaming   : Wikipedia id, FineWeb-2 (ind_Latn), Aya Collection (id), Cendol v2
  Unduhan langsung: OpenSubtitles v2024 (id), TED2020 (id) — dari OPUS (object.pouta.csc.fi)

Tiap sumber gagal → dilewati dengan pesan (jaringan/region bisa memblokir sebagian).

Penggunaan:
    python3 stage1_data/download_full_corpus.py --out-dir data/pretrain_raw
    python3 stage1_data/download_full_corpus.py --budget 50000 --only wikipedia,ted
"""

from __future__ import annotations

import argparse
import gzip
import sys
import time
import urllib.request
from pathlib import Path

MIN_LEN = 20
UA = {"User-Agent": "4IG-pipeline/0.1 (research; contact: dev)"}

HF_SOURCES = [
    {"name": "wikipedia", "dataset": "wikimedia/wikipedia", "config": "20231101.id",
     "field": "text", "note": "Wikipedia Bahasa Indonesia (CC-BY-SA)"},
    {"name": "fineweb2", "dataset": "HuggingFaceFW/fineweb-2", "config": "ind_Latn",
     "field": "text", "note": "Web crawl bahasa Indonesia (ODC-BY)"},
    {"name": "aya", "dataset": "CohereLabs/aya_collection_language_split", "config": "indonesian",
     "field": "inputs", "second": "targets", "note": "Instruksi anotasi manusia (Apache-2.0)"},
    {"name": "cendol", "dataset": "indonlp/cendol_collection_v2", "config": None,
     "field": "text", "note": "Instruksi ID & bahasa daerah (Apache-2.0)"},
]

OPUS_SOURCES = [
    {"name": "opensubtitles",
     "url": "https://object.pouta.csc.fi/OPUS-OpenSubtitles/v2024/mono/id.txt.gz",
     "note": "Dialog subtitle (opensubtitles.org)"},
    {"name": "ted",
     "url": "https://object.pouta.csc.fi/OPUS-TED2020/v1/mono/id.txt.gz",
     "note": "Transkrip TED (CC-BY-NC-ND)"},
]


def tulis_baris(f, teks: str, counter: dict) -> None:
    teks = teks.strip()
    if len(teks) >= MIN_LEN:
        f.write(teks + "\n")
        counter["n"] += 1
        counter["char"] += len(teks)


def unduh_hf(src: dict, out: Path, budget: int) -> int:
    try:
        from datasets import load_dataset
    except ImportError:
        print(f"  ⚠ {src['name']}: package `datasets` belum ada — lewati")
        return 0

    print(f"  ⏳ {src['name']}: streaming {src['dataset']} ({src.get('config') or 'default'})…")
    try:
        ds = load_dataset(src["dataset"], src["config"], split="train", streaming=True)
    except Exception as exc:  # noqa: BLE001
        print(f"  ⚠ {src['name']}: gagal streaming — {exc}")
        return 0

    c = {"n": 0, "char": 0}
    t0 = time.time()
    with out.open("w", encoding="utf-8") as f:
        for i, ex in enumerate(ds):
            if i >= budget:
                break
            teks = str(ex.get(src["field"], "") or "")
            if not teks and src.get("second"):
                teks = str(ex.get(src["second"], "") or "")
            tulis_baris(f, teks, c)
            if i % 10_000 == 0 and i:
                print(f"     …{i:,} dibaca, {c['n']:,} ditulis ({time.time()-t0:.0f}s)")
    print(f"  ✅ {src['name']}: {c['n']:,} baris, {c['char']/1e6:.1f}M char")
    return c["n"]


def unduh_opus(src: dict, out: Path, budget_mb: float) -> int:
    url = src["url"]
    print(f"  ⏳ {src['name']}: unduh {url} …")
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=120) as r, gzip.GzipFile(fileobj=r) as g, \
                out.open("wb") as f:
            total = 0
            while True:
                chunk = g.read(1 << 20)
                if not chunk:
                    break
                f.write(chunk)
                total += len(chunk)
                if budget_mb and total > budget_mb * 1_048_576:
                    break
    except Exception as exc:  # noqa: BLE001
        print(f"  ⚠ {src['name']}: gagal unduh — {exc}")
        return 0
    n = sum(1 for _ in out.open("r", encoding="utf-8", errors="ignore"))
    print(f"  ✅ {src['name']}: {total/1_048_576:.0f} MB terkompresi, ±{n:,} baris")
    return n


def main() -> None:
    ap = argparse.ArgumentParser(description="Unduh corpus teks manusia (resep WicaraLLM)")
    ap.add_argument("--out-dir", default="data/pretrain_raw")
    ap.add_argument("--budget", type=int, default=200_000, help="maks dokumen per sumber HF")
    ap.add_argument("--opus-mb", type=float, default=0, help="maks MB per sumber OPUS (0 = semua)")
    ap.add_argument("--only", default=None, help="nama sumber dipisah koma (mis. wikipedia,ted)")
    args = ap.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    only = set(args.only.split(",")) if args.only else None

    print("=" * 66)
    print("  UNDUH CORPUS TEKS MANUSIA — 6 sumber (resep WicaraLLM)")
    print("=" * 66)

    total = 0
    for src in HF_SOURCES:
        if only and src["name"] not in only:
            continue
        total += unduh_hf(src, out_dir / f"{src['name']}.txt", args.budget)

    for src in OPUS_SOURCES:
        if only and src["name"] not in only:
            continue
        total += unduh_opus(src, out_dir / f"{src['name']}.txt", args.opus_mb)

    print("-" * 66)
    print(f"✅ Selesai — {total:,} baris total di {out_dir}")
    print("   Lanjut: python pipeline.py --steps build,tokenizer,pack,train")


if __name__ == "__main__":
    main()
