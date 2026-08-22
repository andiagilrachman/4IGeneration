"""
TAHAP 1a — Unduh corpus teks BAHASA MANUSIA dari HuggingFace (streaming).

Hanya dataset berisi teks yang DITULIS MANUSIA (Wikipedia, OSCAR web crawl,
korpus berita riset). DILARANG memakai dataset yang dihasilkan LLM.

Penggunaan:
    # Wikipedia Indonesia (~3-6 detik/dokumen pertama, stream cepat)
    python3 stage1_data/download_corpus_hf.py --dataset wikipedia --config 20220301.id \
        --max-docs 20000 --out data/pretrain_raw/wiki-id.txt

    # OSCAR-id (web crawl bahasa Indonesia — volume besar)
    python3 stage1_data/download_corpus_hf.py --dataset oscar-corpus/OSCAR-2301 --config id \
        --max-docs 50000 --out data/pretrain_raw/oscar-id.txt
"""

from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    ap = argparse.ArgumentParser(description="Downloader corpus teks manusia dari HuggingFace")
    ap.add_argument("--dataset", default="wikipedia")
    ap.add_argument("--config", default="20220301.id")
    ap.add_argument("--max-docs", type=int, default=20000, help="batas jumlah dokumen")
    ap.add_argument("--out", default="data/pretrain_raw/wiki-id.txt")
    ap.add_argument("--text-field", default="text")
    args = ap.parse_args()

    try:
        from datasets import load_dataset
    except ImportError as exc:
        raise SystemExit("❌ package `datasets` belum terinstall — jalankan: pip install datasets") from exc

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"⏳ streaming {args.dataset} ({args.config})… maks {args.max_docs} dokumen")

    ds = load_dataset(args.dataset, args.config, split="train", streaming=True)
    written = 0
    with out.open("w", encoding="utf-8") as f:
        for i, ex in enumerate(ds):
            if i >= args.max_docs:
                break
            text = str(ex.get(args.text_field, "") or "").strip()
            if len(text) >= 20:  # buang fragmen pendek
                f.write(text + "\n\n")
                written += 1
            if i % 5000 == 0:
                print(f"   …diproses {i} dokumen, {written} ditulis")

    size_mb = round(out.stat().st_size / 1_048_576, 1)
    print(f"✅ {written} dokumen → {out} ({size_mb} MB)")
    print("   Lanjutkan: python3 stage1_data/build_pretrain_corpus.py --input-dir data/pretrain_raw --out data/pretrain")


if __name__ == "__main__":
    main()
