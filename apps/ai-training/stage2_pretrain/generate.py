"""
TAHAP 2d — Generate teks dengan model 4IG-Finance (setelah pretrain/SFT).

Alat ngobrol/uji: memuat checkpoint, lalu menghasilkan teks dari prompt.
Bisa dipakai untuk melihat seberapa baik model belajar bahasa Indonesia.

Penggunaan:
    # pretrain base (belum SFT): prompt bebas, output masih kasar
    .venv/bin/python stage2_pretrain/generate.py \
        --checkpoint checkpoints/pc-100m/best.pt --config configs/model-100m-pc.json \
        --tokenizer data/tokenizer/4ig-bpe-16384.json --prompt "Saham adalah" --max-new 80

    # setelah SFT: pakai format chat
    .venv/bin/python stage2_pretrain/generate.py \
        --checkpoint checkpoints/sft/best.pt --config configs/model-100m-pc.json \
        --tokenizer data/tokenizer/4ig-bpe-16384.json \
        --prompt "<|user|>Jelaskan apa itu ROE?<|eos|><|assistant|>" --max-new 120
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import torch
import torch.nn.functional as F

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

from stage2_pretrain.model.config import load_config  # noqa: E402
from stage2_pretrain.model.transformer import MiniLLM as Transformer  # noqa: E402


@torch.no_grad()
def generate(model, tok, prompt: str, max_new: int, device: str, temperature: float) -> str:
    model.eval()
    ids = tok.encode(prompt).ids
    x = torch.tensor([ids], dtype=torch.long, device=device)
    for _ in range(max_new):
        logits, _ = model(x[:, -model.cfg.max_seq_len :])
        probs = F.softmax(logits[0, -1] / temperature, dim=-1)
        nxt = torch.multinomial(probs, 1).item()
        if nxt == tok.token_to_id("<|eos|>"):
            break
        x = torch.cat([x, torch.tensor([[nxt]], dtype=torch.long, device=device)], dim=1)
    model.train()
    return tok.decode(x[0].tolist())


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate teks dengan model 4IG-Finance")
    ap.add_argument("--checkpoint", required=True)
    ap.add_argument("--config", default="configs/model-100m-pc.json")
    ap.add_argument("--tokenizer", default="data/tokenizer/4ig-bpe-16384.json")
    ap.add_argument("--prompt", default="Saham adalah")
    ap.add_argument("--max-new", type=int, default=80)
    ap.add_argument("--temperature", type=float, default=0.8)
    ap.add_argument("--device", default="auto")
    args = ap.parse_args()

    if args.device == "auto":
        args.device = "cuda" if torch.cuda.is_available() else "cpu"

    cfg = load_config(args.config)
    from tokenizers import Tokenizer

    tok = Tokenizer.from_file(args.tokenizer)
    cfg.vocab_size = tok.get_vocab_size()

    model = Transformer(cfg).to(args.device)
    state = torch.load(args.checkpoint, map_location=args.device)
    model.load_state_dict(state["model"], strict=False)
    print(f"↻ Muat {args.checkpoint} (step {state.get('step', '?')})\n")

    out = generate(model, tok, args.prompt, args.max_new, args.device, args.temperature)
    if "<|assistant|>" in out:
        out = out.split("<|assistant|>", 1)[1]
    print("─" * 60)
    print(f"PROMPT : {args.prompt}")
    print(f"OUTPUT : {out}")
    print("─" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
