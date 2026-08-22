"""
TAHAP 1e — Validator dataset SFT.

Memeriksa:
  1. Format JSONL valid + field wajib (instruction, output, capability)
  2. Tidak ada duplikat (hash instruction+input)
  3. Output tidak kosong
  4. Cakupan disclaimer ≥ 90% pada capability penilaian & rekomendasi
  5. Tidak ada frasa "jaminan untung"/"pasti naik"/"dijamin"

Exit code 0 = PASS, 1 = FAIL.

Penggunaan:
    python3 stage1_data/validate_dataset.py --in data/sft/dataset.jsonl
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

REQUIRED = {"instruction", "output", "capability"}
VALID_CAPS = {"pemahaman", "penilaian", "rekomendasi"}
DISCLAIMER_FRAG = "bukan rekomendasi"
BANNED = ["jaminan untung", "pasti naik", "dijamin untung", "pasti cuan"]


def main() -> None:
    ap = argparse.ArgumentParser(description="Validator dataset SFT")
    ap.add_argument("--in", dest="inp", default="data/sft/dataset.jsonl")
    args = ap.parse_args()

    path = Path(args.inp)
    if not path.exists():
        sys.exit(f"❌ FAIL: file tidak ada — {path}")

    errors: list[str] = []
    seen: set[str] = set()
    counts: dict[str, int] = {}
    cap_total: dict[str, int] = {}
    cap_disclaimer: dict[str, int] = {}
    total = 0

    with path.open(encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            total += 1
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                errors.append(f"baris {line_no}: bukan JSON valid")
                continue

            missing = REQUIRED - set(row.keys())
            if missing:
                errors.append(f"baris {line_no}: field wajib hilang {sorted(missing)}")
                continue

            cap = row.get("capability")
            if cap not in VALID_CAPS:
                errors.append(f"baris {line_no}: capability '{cap}' tidak dikenal")
                continue

            if not str(row.get("output", "")).strip():
                errors.append(f"baris {line_no}: output kosong")

            text = (str(row.get("instruction", "")) + str(row.get("input", "")) + str(row["output"])).lower()
            for banned in BANNED:
                if banned in text:
                    errors.append(f"baris {line_no}: mengandung frasa terlarang '{banned}'")

            h = hashlib.sha1((row["instruction"] + row.get("input", "")).encode()).hexdigest()
            if h in seen:
                errors.append(f"baris {line_no}: duplikat dengan contoh sebelumnya")
            seen.add(h)

            counts[cap] = counts.get(cap, 0) + 1
            cap_total[cap] = cap_total.get(cap, 0) + 1
            if DISCLAIMER_FRAG in row["output"].lower():
                cap_disclaimer[cap] = cap_disclaimer.get(cap, 0) + 1

    # Cakupan disclaimer ≥ 90% untuk penilaian & rekomendasi
    for cap in ("penilaian", "rekomendasi"):
        n = cap_total.get(cap, 0)
        if n:
            ratio = cap_disclaimer.get(cap, 0) / n
            if ratio < 0.9:
                errors.append(f"capability '{cap}': disclaimer hanya {round(ratio*100,1)}% (min 90%)")

    print(f"📊 Total contoh: {total}")
    for cap in VALID_CAPS:
        n = cap_total.get(cap, 0)
        d = cap_disclaimer.get(cap, 0)
        print(f"   {cap}: {n} contoh (disclaimer {round(d/n*100,1)}% )" if n else f"   {cap}: 0")

    if errors:
        print(f"\n❌ FAIL — {len(errors)} masalah (10 pertama):")
        for e in errors[:10]:
            print(f"   • {e}")
        sys.exit(1)

    print(f"\n✅ PASS — {total} contoh valid, format benar, tanpa duplikat, disclaimer memadai.")


if __name__ == "__main__":
    main()
