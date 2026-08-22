"""
TAHAP 1a — Builder corpus pretraining.

Menggabungkan file teks (.txt/.md/.csv/.jsonl) dari folder input menjadi shard
teks bersih untuk pretraining: normalisasi baris, buang baris kosong/berulang,
dedupe global, lalu tulis shard per N baris + manifest.

Opsional: unduh corpus publik Indonesia (OSCAR-id, Wikipedia ID) bila package
`datasets` terpasang dan `--hf` diberikan.

Penggunaan:
    python3 stage1_data/build_pretrain_corpus.py --input-dir data/raw_corpus --out data/pretrain/
    python3 stage1_data/build_pretrain_corpus.py --input-dir data/raw_corpus --out data/pretrain/ --hf oscar,id
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

EXTS = {".txt", ".md", ".csv", ".jsonl"}


def read_files(input_dir: Path) -> list[str]:
    lines: list[str] = []
    for p in sorted(input_dir.rglob("*")):
        if p.suffix.lower() not in EXTS:
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except Exception as exc:  # noqa: BLE001
            print(f"  ⚠ skip {p}: {exc}")
            continue
        for raw in text.splitlines():
            line = raw.strip()
            if len(line) >= 20:  # buang fragmen pendek/gambar dll
                lines.append(line)
    return lines


def add_hf(which: str, lines: list[str]) -> None:
    try:
        from datasets import load_dataset  # noqa: PLC0415
    except ImportError:
        print("  ⚠ package `datasets` belum terinstall — lewati unduhan HF")
        return
    name, lang = which.split(",")
    print(f"  ⏳ unduh corpus HF: {name} ({lang})…")
    ds = load_dataset(name, lang, split="train", streaming=True)
    n = 0
    for ex in ds:
        text = str(ex.get("text", ""))
        if len(text) >= 20:
            lines.append(text.strip())
            n += 1
            if n >= 200_000:  # cukup 200K dokumen per corpus
                break
    print(f"  ✅ corpus HF: {n} dokumen")


def main() -> None:
    ap = argparse.ArgumentParser(description="Builder corpus pretraining")
    ap.add_argument("--input-dir", required=True, help="folder berisi file teks mentah")
    ap.add_argument("--out", default="data/pretrain", help="folder output shard")
    ap.add_argument("--shard-lines", type=int, default=50_000, help="baris per shard")
    ap.add_argument("--hf", default=None, help="corpus HF tambahan, format: nama,lang (mis. oscar,id)")
    args = ap.parse_args()

    input_dir = Path(args.input_dir)
    if not input_dir.exists():
        sys.exit(f"❌ folder input tidak ada: {input_dir}")

    print(f"📂 Membaca corpus dari {input_dir} …")
    lines = read_files(input_dir)
    if args.hf:
        add_hf(args.hf, lines)
    if not lines:
        sys.exit("❌ corpus kosong — tidak ada teks yang memenuhi syarat")

    # dedupe global
    seen: set[str] = set()
    uniq: list[str] = []
    for ln in lines:
        h = hashlib.sha1(ln.encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            uniq.append(ln)
    print(f"✅ {len(lines)} baris → {len(uniq)} unik setelah dedupe")

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    total_chars = 0
    shards = 0
    for i in range(0, len(uniq), args.shard_lines):
        chunk = uniq[i : i + args.shard_lines]
        shard = out_dir / f"shard-{i // args.shard_lines:04d}.txt"
        shard.write_text("\n".join(chunk) + "\n", encoding="utf-8")
        total_chars += sum(len(c) for c in chunk)
        shards += 1

    manifest = {
        "baris_unik": len(uniq),
        "shards": shards,
        "perkiraan_token": round(total_chars / 4),  # ±4 karakter/token bahasa Indonesia
        "perkiraan_mb": round(total_chars / 1_048_576, 1),
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"✅ Corpus siap: {out_dir} — {shards} shard, ±{manifest['perkiraan_token']:,} token "
          f"({manifest['perkiraan_mb']} MB)")


if __name__ == "__main__":
    main()
