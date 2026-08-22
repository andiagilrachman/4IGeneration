"""
TAHAP 2b — Packing token: ubah corpus teks manusia menjadi train.bin / val.bin.

Pola mengikuti referensi WicaraLLM (scripts/pack_tokens.py, Apache-2.0):
- Pemisahan validasi di tingkat DOKUMEN (cegah data leakage antar train/val)
- Tiap dokumen diakhiri token <|eos|>
- Keluaran array datar uint16 (vocab ≤ 65.535)

Data: hasil Tahap 1a (data/pretrain/*.txt) — tiap baris = satu dokumen.
Tokenizer: hasil Tahap 2a (data/tokenizer/4ig-bpe-16k.json).

Penggunaan:
    .venv/bin/python stage2_tokenizer/pack_tokens.py \
        --input-dir data/pretrain --tokenizer data/tokenizer/4ig-bpe-16k.json \
        --out-dir data/tokens --val-ratio 0.05
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import numpy as np
from tokenizers import Tokenizer

FLUSH_TOKEN = 8_000_000  # tulis ke disk tiap ~16 MB
BATCH_DOK = 2000         # dokumen per encode_batch


class PenulisBin:
    """Penulis berkas biner uint16 dengan buffer untuk hemat memori."""

    def __init__(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.path = path
        self.f = path.open("wb")
        self.buf: list[int] = []
        self.n_token = 0

    def tulis(self, ids: list[int]) -> None:
        self.buf.extend(ids)
        self.n_token += len(ids)
        if len(self.buf) >= FLUSH_TOKEN:
            self._flush()

    def _flush(self) -> None:
        if not self.buf:
            return
        np.asarray(self.buf, dtype=np.uint16).tofile(self.f)
        self.buf.clear()

    def close(self) -> None:
        self._flush()
        self.f.close()


def main() -> int:
    ap = argparse.ArgumentParser(description="Packing token → train.bin / val.bin")
    ap.add_argument("--input-dir", default="data/pretrain")
    ap.add_argument("--tokenizer", default="data/tokenizer/4ig-bpe-16k.json")
    ap.add_argument("--out-dir", default="data/tokens")
    ap.add_argument("--val-ratio", type=float, default=0.05, help="porsi dokumen untuk validasi")
    ap.add_argument("--budget", type=int, default=0, help="hentikan setelah N token train (0 = semua)")
    ap.add_argument("--verify", action="store_true", help="decode sampel dari train.bin setelah selesai")
    args = ap.parse_args()

    input_dir = Path(args.input_dir)
    tok_path = Path(args.tokenizer)
    if not input_dir.exists() or not tok_path.exists():
        print("❌ corpus/tokenizer tidak ditemukan — jalankan Tahap 1a & 2a dulu.")
        return 1

    tok = Tokenizer.from_file(str(tok_path))
    vocab = tok.get_vocab_size()
    if vocab > 65_535:
        print(f"❌ vocab {vocab:,} melebihi kapasitas uint16.")
        return 1
    eos_id = tok.token_to_id("<|eos|>")
    if eos_id is None:
        print("❌ token <|eos|> tidak ditemukan di tokenizer.")
        return 1

    out_dir = Path(args.out_dir)
    train = PenulisBin(out_dir / "train.bin")
    val = PenulisBin(out_dir / "val.bin")

    tiap_val = max(2, round(1 / args.val_ratio))
    print("=" * 70)
    print("  PACKING TOKEN — 4IG-Finance")
    print("=" * 70)
    print(f"  Tokenizer : {tok_path.name} (vocab {vocab:,}) · EOS ID {eos_id}")
    print(f"  Validasi  : 1 dari {tiap_val} dokumen ({args.val_ratio:.1%})")
    print(f"  Anggaran  : {'semua' if args.budget <= 0 else f'{args.budget/1e6:,.0f} juta token'}")

    t_mulai = time.time()
    n_dok = 0
    for shard in sorted(input_dir.glob("*.txt")):
        batch: list[str] = []
        batch_val: list[bool] = []
        for line in shard.read_text(encoding="utf-8", errors="ignore").splitlines():
            teks = line.strip()
            if len(teks) < 20:
                continue
            batch.append(teks)
            batch_val.append(n_dok % tiap_val == 0)
            n_dok += 1

            if len(batch) >= BATCH_DOK:
                for enc, ke_val in zip(tok.encode_batch(batch), batch_val):
                    ids = enc.ids + [eos_id]
                    (val if ke_val else train).tulis(ids)
                batch, batch_val = [], []
                if args.budget > 0 and train.n_token >= args.budget:
                    break
        if batch:
            for enc, ke_val in zip(tok.encode_batch(batch), batch_val):
                ids = enc.ids + [eos_id]
                (val if ke_val else train).tulis(ids)
        if args.budget > 0 and train.n_token >= args.budget:
            print(f"  ⏹  anggaran tercapai di shard {shard.name}")
            break

    train.close()
    val.close()
    detik = time.time() - t_mulai

    print("-" * 70)
    print(f"  ✅ {n_dok:,} dokumen diproses dalam {detik:.1f}s")
    print(f"  train.bin : {train.n_token:,} token "
          f"({out_dir / 'train.bin'}) {round((out_dir/'train.bin').stat().st_size/1_048_576,1)} MB")
    print(f"  val.bin   : {val.n_token:,} token "
          f"({out_dir / 'val.bin'}) {round((out_dir/'val.bin').stat().st_size/1_048_576,1)} MB")

    if args.verify:
        data = np.fromfile(out_dir / "train.bin", dtype=np.uint16)[:200]
        teks = tok.decode(data.tolist())
        print("-" * 70)
        print("  VERIFIKASI — decode 200 token pertama train.bin:")
        print(f"  {teks[:300]!r}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
