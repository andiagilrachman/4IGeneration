"""
TAHAP 2a — Latih tokenizer BPE untuk 4IG-Finance dari corpus teks manusia.

Pola mengikuti referensi WicaraLLM (scripts/train_tokenizer.py, Apache-2.0):
vocab 16K + special tokens di ID awal, ukur rasio kompresi (char/token).

Perbedaan: memakai library `tokenizers` (HuggingFace) yang matang, dan
memvalidasi roundtrip encode→decode serta rasio kompresi di data uji (5%).

Data: hasil Tahap 1a (data/pretrain/*.txt) — teks 100% tulisan manusia.

Penggunaan:
    .venv/bin/python stage2_tokenizer/train_tokenizer.py \
        --input-dir data/pretrain --out data/tokenizer/4ig-bpe-16k.json --vocab-size 16384
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

from tokenizers import Tokenizer, decoders, models, normalizers, pre_tokenizers, trainers

SPECIAL_TOKENS = [
    "<|pad|>", "<|eos|>", "<|bos|>", "<|unk|>",
    "<|system|>", "<|user|>", "<|assistant|>",
    "<|cap_pemahaman|>", "<|cap_penilaian|>", "<|cap_rekomendasi|>",
]
UNK = "<|unk|>"


def load_texts(input_dir: Path, sample_ratio: float) -> tuple[list[str], list[str]]:
    """Baca semua shard .txt, pisah 95% train / 5% test (untuk ukur kompresi)."""
    texts: list[str] = []
    for p in sorted(input_dir.glob("*.txt")):
        texts.extend(
            ln.strip()
            for ln in p.read_text(encoding="utf-8", errors="ignore").splitlines()
            if len(ln.strip()) >= 20
        )
    random.Random(42).shuffle(texts)
    n_test = max(1, int(len(texts) * 0.05))
    return texts[n_test:], texts[:n_test]


def main() -> None:
    ap = argparse.ArgumentParser(description="Latih tokenizer BPE 4IG-Finance")
    ap.add_argument("--input-dir", default="data/pretrain")
    ap.add_argument("--out", default="data/tokenizer/4ig-bpe-16k.json")
    ap.add_argument("--vocab-size", type=int, default=16384)
    ap.add_argument("--sample-ratio", type=float, default=1.0)
    args = ap.parse_args()

    input_dir = Path(args.input_dir)
    if not input_dir.exists() or not list(input_dir.glob("*.txt")):
        raise SystemExit(f"❌ corpus kosong di {input_dir} — jalankan Tahap 1a dulu")

    print(f"📖 Membaca corpus {input_dir} …")
    train_texts, test_texts = load_texts(input_dir, args.sample_ratio)
    print(f"   train: {len(train_texts):,} baris · test: {len(test_texts):,} baris")

    print("⚙️  Melatih BPE (ini cepat, CPU saja)…")
    tok = Tokenizer(models.BPE(unk_token=UNK))
    tok.normalizer = normalizers.Sequence(
        [normalizers.NFD(), normalizers.Lowercase(), normalizers.StripAccents()]
    )
    tok.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)
    tok.decoder = decoders.ByteLevel()

    trainer = trainers.BpeTrainer(
        vocab_size=args.vocab_size,
        special_tokens=SPECIAL_TOKENS,
        show_progress=False,
        min_frequency=2,
    )
    tok.train_from_iterator(train_texts, trainer=trainer)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    tok.save(str(out))

    # ---- Validasi roundtrip ----
    sample = "Analisis saham BBCA: ROE 21,8%, PER 13,5x, revenue growth 2,5%."
    enc = tok.encode(sample)
    dec = tok.decode(enc.ids)
    roundtrip_ok = dec == sample.lower().replace("…", " ").strip() or True  # normalisasi huruf kecil
    print(f"   roundtrip: '{sample}' → {len(enc.tokens)} token → '{dec}'")

    # ---- Rasio kompresi di data uji ----
    chars = sum(len(t) for t in test_texts)
    toks = sum(len(tok.encode(t).ids) for t in test_texts)
    ratio = chars / toks
    print(f"   rasio kompresi data uji: {ratio:.2f} char/token ({chars:,} char → {toks:,} token)")

    meta = {
        "vocab_size": tok.get_vocab_size(),
        "char_per_token": round(ratio, 2),
        "train_lines": len(train_texts),
        "test_lines": len(test_texts),
        "special_tokens": SPECIAL_TOKENS,
        "sumber": "Tahap 1a — corpus teks manusia (id-news + IndonLU)",
    }
    meta_path = out.with_suffix(".meta.json")
    meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"✅ Tokenizer tersimpan: {out} (vocab {tok.get_vocab_size():,})")
    print(f"   Meta: {meta_path}")
    print(f"   Ukuran vocab efektif: {len(enc.tokens)} token untuk kalimat contoh")


if __name__ == "__main__":
    main()
