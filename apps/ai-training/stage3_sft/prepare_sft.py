"""
TAHAP 3a — Siapkan data SFT (chat template + tokenisasi + masking).

Membaca dataset JSONL (hasil Tahap 1b-d: data/sft/*.jsonl) dan mengubahnya
menjadi pasangan (input_ids, labels) untuk fine-tune instruksi:

    <|system|>  Sistem prompt 4IG-Finance   <|eos|>
    <|user|>    Pertanyaan pengguna          <|eos|>
    <|assistant|> Jawaban (edukatif)         <|eos|>

Labels: -100 pada semua token KECUALI bagian jawaban asisten (loss hanya
dihitung di situ). Tokenizer: hasil Tahap 2a.

Penggunaan:
    .venv/bin/python stage3_sft/prepare_sft.py \
        --in data/sft --out data/sft_tokens \
        --tokenizer data/tokenizer/4ig-bpe-16k.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from tokenizers import Tokenizer

SYSTEM_PROMPT = (
    "Kamu adalah 4IG-Finance, analis saham Indonesia yang objektif, edukatif, "
    "dan berbasis data. Jawab dalam bahasa Indonesia dengan angka dan metrik. "
    "Selalu akhiri dengan disclaimer bahwa ini alat edukatif, bukan rekomendasi investasi."
)


def load_rows(in_dir: Path) -> list[dict]:
    rows: list[dict] = []
    for p in sorted(in_dir.glob("*.jsonl")):
        with p.open(encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                rows.append(json.loads(line))
    return rows


def build_sample(tok: Tokenizer, row: dict, max_len: int) -> dict:
    user = row["instruction"]
    if row.get("input"):
        user += "\nData: " + row["input"]
    out = row["output"]

    parts = [
        ("<|system|>", SYSTEM_PROMPT, False),
        ("<|user|>", user, False),
        ("<|assistant|>", out, True),
    ]
    ids: list[int] = []
    labels: list[int] = []
    for tag, text, is_answer in parts:
        tag_ids = tok.encode(tag).ids
        ids.extend(tag_ids)
        labels.extend([-100] * len(tag_ids))  # tag tidak dihitung loss
        if not is_answer:
            text_ids = tok.encode(text).ids
            ids.extend(text_ids)
            labels.extend([-100] * len(text_ids))
        else:
            # jawaban dihitung loss-nya
            text_ids = tok.encode(text).ids
            ids.extend(text_ids)
            labels.extend(text_ids)
    eos = tok.encode("<|eos|>").ids
    ids.extend(eos)
    labels.extend(eos)

    if len(ids) > max_len:
        # potong dari belakang tapi jaga agar jawaban masih utuh mungkin
        ids = ids[:max_len]
        labels = labels[:max_len]
    return {"ids": ids, "labels": labels}


def main() -> None:
    ap = argparse.ArgumentParser(description="Siapkan data SFT (chat template + masking)")
    ap.add_argument("--in", dest="in_dir", default="data/sft")
    ap.add_argument("--out", default="data/sft_tokens")
    ap.add_argument("--tokenizer", default="data/tokenizer/4ig-bpe-16k.json")
    ap.add_argument("--max-len", type=int, default=1024)
    ap.add_argument("--val-ratio", type=float, default=0.1)
    args = ap.parse_args()

    tok_path = Path(args.tokenizer)
    if not tok_path.exists():
        sys.exit(f"❌ tokenizer tidak ditemukan: {tok_path} (jalankan Tahap 2a dulu)")
    tok = Tokenizer.from_file(str(tok_path))

    rows = load_rows(Path(args.in_dir))
    if not rows:
        sys.exit(f"❌ tidak ada dataset di {args.in_dir}")
    print(f"📖 {len(rows)} contoh dari {args.in_dir}")

    samples = [build_sample(tok, r, args.max_len) for r in rows]
    n_val = max(1, int(len(samples) * args.val_ratio))
    train, val = samples[n_val:], samples[:n_val]

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, data in (("train.jsonl", train), ("val.jsonl", val)):
        with (out_dir / name).open("w", encoding="utf-8") as f:
            for s in data:
                f.write(json.dumps(s) + "\n")

    n_answer_tokens = sum(1 for s in train for l in s["labels"] if l != -100)
    print(f"✅ train: {len(train)} · val: {len(val)} → {out_dir}")
    print(f"   token jawaban (train): {n_answer_tokens:,}")
    print(f"   panjang rata-rata: {sum(len(s['ids']) for s in train) // max(len(train),1)} token")


if __name__ == "__main__":
    main()
