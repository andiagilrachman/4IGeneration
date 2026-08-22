"""
TAHAP 1a — Konverter dataset CSV teks manusia → corpus pretraining (.txt).

Membaca semua file .csv dalam folder (mis. dataset IndonLU), mengambil KOLOM
TEKS PERTAMA (sentence/question/review/tweet), menulisnya sebagai kalimat
per baris. File *_masked_label* (berisi label tertanam) dilewati.

Sumber yang dipakai semuanya teks DITULIS MANUSIA (review, tweet, berita, QA).
DILARANG memakai output LLM lain.

Penggunaan:
    python3 stage1_data/convert_csv_corpus.py --input-dir data/raw_indonlu --out data/pretrain_raw/indonlu.txt
"""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

SKIP_SUBSTR = ("masked_label", "vocab")
MIN_LEN = 20


def convert_dir(input_dir: Path) -> list[str]:
    lines: list[str] = []
    files = sorted(input_dir.rglob("*.csv"))
    if not files:
        sys.exit(f"❌ tidak ada file .csv di {input_dir}")
    for p in files:
        name = p.name.lower()
        if any(s in name for s in SKIP_SUBSTR):
            continue
        n_before = len(lines)
        try:
            with p.open(encoding="utf-8", errors="ignore") as f:
                for row in csv.reader(f):
                    if not row:
                        continue
                    text = row[0].strip()
                    if len(text) >= MIN_LEN:
                        lines.append(text)
        except Exception as exc:  # noqa: BLE001
            print(f"  ⚠ skip {p.name}: {exc}")
            continue
        print(f"  ✅ {p.name}: +{len(lines) - n_before} kalimat")
    return lines


def main() -> None:
    ap = argparse.ArgumentParser(description="Konverter CSV teks manusia → corpus .txt")
    ap.add_argument("--input-dir", required=True)
    ap.add_argument("--out", default="data/pretrain_raw/indonlu.txt")
    args = ap.parse_args()

    lines = convert_dir(Path(args.input_dir))
    if not lines:
        sys.exit("❌ tidak ada kalimat yang terekstrak")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"✅ {len(lines)} kalimat → {out} ({round(out.stat().st_size / 1_048_576, 1)} MB)")


if __name__ == "__main__":
    main()
