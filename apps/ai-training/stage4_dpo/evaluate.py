"""
TAHAP 4a (starter) — Evaluasi bank soal 4IG-Finance.

Bank soal ditulis MANUSIA (stage4_dpo/bank_soal.jsonl). Setiap pertanyaan punya
keywords; skor dihitung dari: (1) keyword yang muncul di jawaban, (2) jawaban
mengandung disclaimer, (3) panjang jawaban masuk akal.

Ini evaluasi KASAR untuk iterasi cepat — evaluasi penuh (halusinasi angka,
jawaban grounded) menyusul di Tahap 4.

Penggunaan:
    .venv/bin/python stage4_dpo/evaluate.py \
        --checkpoint checkpoints/sft/best.pt --config configs/model-smoke.json \
        --tokenizer data/tokenizer/4ig-bpe-16k.json --device cpu
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import torch
import torch.nn.functional as F

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

from stage2_pretrain.model.config import load_config  # noqa: E402
from stage2_pretrain.model.transformer import MiniLLM as Transformer  # noqa: E402


@torch.no_grad()
def generate(model, tok, prompt: str, max_new: int = 120, device: str = "cpu", temperature: float = 0.5) -> str:
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
    ap = argparse.ArgumentParser()
    ap.add_argument("--checkpoint", default="checkpoints/sft/best.pt")
    ap.add_argument("--config", default="configs/model-smoke.json")
    ap.add_argument("--tokenizer", default="data/tokenizer/4ig-bpe-16k.json")
    ap.add_argument("--bank", default="stage4_dpo/bank_soal.jsonl")
    ap.add_argument("--device", default="auto")
    ap.add_argument("--max-new", type=int, default=80)
    args = ap.parse_args()

    if args.device == "auto":
        args.device = "cuda" if torch.cuda.is_available() else "cpu"

    cfg = load_config(args.config)
    from tokenizers import Tokenizer

    tok = Tokenizer.from_file(args.tokenizer)
    cfg.vocab_size = tok.get_vocab_size()

    model = Transformer(cfg).to(args.device)
    if Path(args.checkpoint).exists():
        model.load_state_dict(torch.load(args.checkpoint, map_location=args.device)["model"], strict=False)
        print(f"↻ Muat {args.checkpoint}")

    soal = [json.loads(l) for l in Path(args.bank).read_text(encoding="utf-8").splitlines() if l.strip()]
    print(f"📝 Bank soal: {len(soal)} pertanyaan\n")

    skor_kw = skor_disc = 0
    for i, q in enumerate(soal, 1):
        prompt = f"<|user|>{q['question']}<|eos|><|assistant|>"
        jawab = generate(model, tok, prompt, max_new=args.max_new, device=args.device)
        # potong bagian prompt
        if "<|assistant|>" in jawab:
            jawab = jawab.split("<|assistant|>", 1)[1]
        low = jawab.lower()
        hit = [k for k in q["keywords"] if k.lower() in low]
        ok_disc = "bukan rekomendasi" in low or "edukatif" in low
        skor_kw += len(hit) / len(q["keywords"])
        skor_disc += 1 if ok_disc else 0
        print(f"  {i:>2}. {q['question'][:60]}")
        print(f"     → keyword {len(hit)}/{len(q['keywords'])} · disclaimer {'✅' if ok_disc else '❌'}")
        print(f"     {jawab[:120]!r}\n")

    n = len(soal)
    print("=" * 50)
    print(f"  Skor keyword rata-rata : {skor_kw/n*100:.0f}%")
    print(f"  Cakupan disclaimer     : {skor_disc/n*100:.0f}%")
    print("=" * 50)
    return 0


if __name__ == "__main__":
    sys.exit(main())
