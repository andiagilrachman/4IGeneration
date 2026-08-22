"""
TAHAP 1b — Konversi Q&A MANUAL (ditulis manusia) menjadi dataset JSONL.

Format input: CSV (UTF-8) kolom: capability,instruction,output
  - output WAJIB ditulis manual dari buku/referensi/idx.co.id — DILARANG dari LLM lain.
  - Baris dengan output kosong dilewati & dilaporkan (belum siap).

Penggunaan:
    python3 stage1_data/build_manual_qa.py --in data/manual/qa.csv --out data/sft/manual.jsonl
    python3 stage1_data/validate_dataset.py --in data/sft/manual.jsonl
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path


def main() -> None:
    ap = argparse.ArgumentParser(description="Konverter Q&A manual CSV → JSONL")
    ap.add_argument("--in", dest="inp", default="data/manual/qa.csv")
    ap.add_argument("--out", default="data/sft/manual.jsonl")
    args = ap.parse_args()

    path = Path(args.inp)
    if not path.exists():
        sys.exit(f"❌ file tidak ada: {path}")

    rows: list[dict] = []
    pending = 0
    with path.open(encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            cap = (r.get("capability") or "").strip()
            ins = (r.get("instruction") or "").strip()
            out = (r.get("output") or "").strip()
            if not cap or not ins:
                continue
            if not out:
                pending += 1
                continue
            rows.append({"instruction": ins, "input": "", "output": out, "capability": cap})

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"✅ {len(rows)} Q&A siap → {out_path}")
    print(f"⏳ {pending} baris masih kosong (belum diisi manual)")


if __name__ == "__main__":
    main()
