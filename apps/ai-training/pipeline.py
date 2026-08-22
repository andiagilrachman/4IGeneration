#!/usr/bin/env python3
"""
4IG-Finance — PIPELINE SATU PERINTAH: corpus → tokenizer → packing → pretrain.

Menjalankan seluruh rantai Tahap 1–2 dari nol di mesinmu (Windows/macOS/Linux):

    python pipeline.py                    # semua langkah, device otomatis
    python pipeline.py --steps corpus     # hanya unduh corpus
    python pipeline.py --steps tokenizer,pack
    python pipeline.py --quick            # versi kecil untuk uji coba (< 5 menit)
    python pipeline.py --train-steps 100  # pretrain dibatasi 100 langkah
    python pipeline.py --no-install       # lewati instalasi dependensi

Alur per langkah:
    corpus    → stage1_data/download_full_corpus.py (Wikipedia ID, FineWeb-2, Aya,
                 Cendol, OpenSubtitles, TED — semua teks manusia, resep WicaraLLM)
    build     → stage1_data/build_pretrain_corpus.py (gabung + dedupe + shard)
    tokenizer → stage2_tokenizer/train_tokenizer.py (BPE, vocab sesuai --vocab-size)
    pack      → stage2_tokenizer/pack_tokens.py (train.bin / val.bin uint16)
    train     → stage2_pretrain/train.py (pretrain; CPU utk uji, CUDA utk sungguhan)
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PY = ROOT / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")


def run(cmd: list[str], fatal: bool = True, **kw) -> subprocess.CompletedProcess:
    print(f"\n── $ {' '.join(str(c) for c in cmd)}")
    t0 = time.time()
    r = subprocess.run([str(c) for c in cmd], **kw)
    print(f"   (selesai {time.time() - t0:.1f}s, exit {r.returncode})")
    if fatal and r.returncode != 0:
        print(f"❌ Langkah gagal (exit {r.returncode}) — hentikan pipeline.")
        sys.exit(r.returncode)
    return r


def ensure_env(no_install: bool) -> None:
    if not PY.exists():
        print("📦 Membuat environment virtual .venv …")
        run([sys.executable, "-m", "venv", str(ROOT / ".venv")])
    if not no_install:
        print("📦 Memasang dependensi (numpy, tokenizers, datasets, torch) …")
        run([PY, "-m", "pip", "install", "-q", "--upgrade", "pip"])
        run([PY, "-m", "pip", "install", "-q", "-r", str(ROOT / "requirements.txt")])


def main() -> int:
    ap = argparse.ArgumentParser(description="Pipeline 4IG-Finance satu perintah")
    ap.add_argument("--steps", default="corpus,build,tokenizer,pack,train",
                    help="langkah yang dijalankan (koma): corpus,build,tokenizer,pack,train")
    ap.add_argument("--device", default="auto", choices=["auto", "cuda", "cpu"])
    ap.add_argument("--config", default="configs/model-300m.json")
    ap.add_argument("--train-steps", type=int, default=None,
                    help="batasi langkah pretrain (None = sampai selesai corpus)")
    ap.add_argument("--vocab-size", type=int, default=16384)
    ap.add_argument("--corpus-budget", type=int, default=0,
                    help="maks dokumen per sumber HF (0 = default besar)")
    ap.add_argument("--quick", action="store_true", help="versi kecil untuk uji coba")
    ap.add_argument("--no-install", action="store_true")
    args = ap.parse_args()

    steps = [s.strip() for s in args.steps.split(",") if s.strip()]
    quick = args.quick
    device = args.device

    if quick:
        args.config = "configs/model-smoke.json"
        if args.train_steps is None:
            args.train_steps = 20
        if args.corpus_budget == 0:
            args.corpus_budget = 500

    ensure_env(args.no_install)
    os.chdir(ROOT)

    if "corpus" in steps:
        run([PY, "stage1_data/download_full_corpus.py",
             "--out-dir", "data/pretrain_raw",
             "--budget", str(args.corpus_budget or 200_000)])

    if "build" in steps:
        run([PY, "stage1_data/build_pretrain_corpus.py",
             "--input-dir", "data/pretrain_raw",
             "--out", "data/pretrain"])

    if "tokenizer" in steps:
        run([PY, "stage2_tokenizer/train_tokenizer.py",
             "--input-dir", "data/pretrain",
             "--out", f"data/tokenizer/4ig-bpe-{args.vocab_size}.json",
             "--vocab-size", str(args.vocab_size)])

    if "pack" in steps:
        run([PY, "stage2_tokenizer/pack_tokens.py",
             "--input-dir", "data/pretrain",
             "--tokenizer", f"data/tokenizer/4ig-bpe-{args.vocab_size}.json",
             "--out-dir", "data/tokens"])

    if "train" in steps:
        cmd = [PY, "stage2_pretrain/train.py",
               "--config", args.config,
               "--train-bin", "data/tokens/train.bin",
               "--val-bin", "data/tokens/val.bin",
               "--tokenizer", f"data/tokenizer/4ig-bpe-{args.vocab_size}.json",
               "--out-dir", "checkpoints/run1",
               "--device", device]
        if args.train_steps:
            cmd += ["--steps", str(args.train_steps)]
        run(cmd)

    print("\n✅ Pipeline selesai.")
    if "train" in steps:
        print("   Checkpoint: apps/ai-training/checkpoints/run1/ (best.pt / last.pt)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
