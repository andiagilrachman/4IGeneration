"""
TAHAP 3b — SFT (supervised fine-tuning) 4IG-Finance.

Fine-tune model pretrain (Tahap 2c) dengan dataset instruksi 3 kemampuan
(pemahaman/penilaian/rekomendasi). Loss dihitung HANYA pada jawaban asisten
(lihat prepare_sft.py — masking -100), sehingga model belajar format
tanya-jawab edukatif dengan disclaimer.

Model & arsitektur: sama dengan pretrain (adaptasi WicaraLLM, Apache-2.0).

Penggunaan:
    # smoke test (CPU, config kecil + checkpoint smoke)
    .venv/bin/python stage3_sft/train_sft.py \
        --checkpoint checkpoints/smoke/best.pt --config configs/model-smoke.json \
        --data data/sft_tokens --steps 15 --device cpu --out-dir checkpoints/sft

    # sungguhan (setelah pretrain 300M selesai)
    .venv/bin/python stage3_sft/train_sft.py \
        --checkpoint checkpoints/run1/best.pt --config configs/model-300m.json \
        --data data/sft_tokens --epochs 3 --device cuda --out-dir checkpoints/sft
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
from pathlib import Path

import torch
import torch.nn.functional as F

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

from stage2_pretrain.model.config import load_config  # noqa: E402
from stage2_pretrain.model.transformer import MiniLLM as Transformer  # noqa: E402


class SftDataset:
    def __init__(self, path: Path):
        self.samples: list[dict] = []
        with path.open(encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    self.samples.append(json.loads(line))
        self.pad_id = 0  # <|pad|>

    def truncate(self, max_len: int) -> None:
        for s in self.samples:
            if len(s["ids"]) > max_len:
                s["ids"] = s["ids"][:max_len]
                s["labels"] = s["labels"][:max_len]

    def get_batch(self, batch_size: int, device: str) -> tuple[torch.Tensor, torch.Tensor]:
        import random

        chosen = random.Random().choices(self.samples, k=batch_size)
        max_len = max(len(s["ids"]) for s in chosen)
        x = torch.full((batch_size, max_len), self.pad_id, dtype=torch.long)
        y = torch.full((batch_size, max_len), -100, dtype=torch.long)
        for i, s in enumerate(chosen):
            x[i, : len(s["ids"])] = torch.tensor(s["ids"], dtype=torch.long)
            y[i, : len(s["labels"])] = torch.tensor(s["labels"], dtype=torch.long)
        return x.to(device), y.to(device)


def build_optimizer(model, lr: float, weight_decay: float):
    decay, no_decay = [], []
    for name, p in model.named_parameters():
        if not p.requires_grad:
            continue
        (no_decay if p.ndim <= 1 or "embed" in name else decay).append(p)
    return torch.optim.AdamW(
        [
            {"params": decay, "weight_decay": weight_decay},
            {"params": no_decay, "weight_decay": 0.0},
        ],
        lr=lr,
        betas=(0.9, 0.95),
    )


@torch.no_grad()
def masked_loss(model, ds: SftDataset, device: str, n_batch: int = 8) -> float:
    model.eval()
    total, n = 0.0, 0
    for _ in range(n_batch):
        x, y = ds.get_batch(4, device)
        _, loss = model(x, targets=y)
        total += loss.item()
        n += 1
    model.train()
    return total / max(n, 1)


@torch.no_grad()
def generate(model, tok, prompt: str, max_new: int = 80, device: str = "cpu", temperature: float = 0.7) -> str:
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
    ap.add_argument("--checkpoint", default="checkpoints/run1/best.pt")
    ap.add_argument("--config", default="configs/model-300m.json")
    ap.add_argument("--data", default="data/sft_tokens")
    ap.add_argument("--tokenizer", default="data/tokenizer/4ig-bpe-16k.json")
    ap.add_argument("--out-dir", default="checkpoints/sft")
    ap.add_argument("--epochs", type=int, default=3)
    ap.add_argument("--steps", type=int, default=None, help="batasi total langkah (smoke)")
    ap.add_argument("--batch-size", type=int, default=4)
    ap.add_argument("--lr", type=float, default=1e-4)
    ap.add_argument("--weight-decay", type=float, default=0.05)
    ap.add_argument("--seed", type=int, default=1337)
    ap.add_argument("--device", default="auto")
    args = ap.parse_args()

    if args.device == "auto":
        args.device = "cuda" if torch.cuda.is_available() else "cpu"
    torch.manual_seed(args.seed)

    cfg = load_config(args.config)
    ckpt_path = Path(args.checkpoint)
    if not ckpt_path.exists():
        print(f"❌ checkpoint tidak ditemukan: {ckpt_path}")
        return 1

    from tokenizers import Tokenizer

    tok = Tokenizer.from_file(args.tokenizer)
    cfg.vocab_size = tok.get_vocab_size()

    model = Transformer(cfg).to(args.device)
    state = torch.load(ckpt_path, map_location=args.device)
    model.load_state_dict(state["model"], strict=False)
    print(f"↻ Muat pretrain dari {ckpt_path} (step {state.get('step', '?')})")

    train_ds = SftDataset(Path(args.data) / "train.jsonl")
    val_ds = SftDataset(Path(args.data) / "val.jsonl")
    train_ds.truncate(cfg.max_seq_len)
    val_ds.truncate(cfg.max_seq_len)
    print(f"📚 SFT data: train {len(train_ds.samples)} · val {len(val_ds.samples)}")

    total_steps = args.steps or max(len(train_ds.samples) // args.batch_size * args.epochs, 10)
    warmup = max(1, int(total_steps * 0.05))
    print(f"⚙️  Total steps: {total_steps} · warmup {warmup} · lr {args.lr}")

    optimizer = build_optimizer(model, args.lr, args.weight_decay)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    use_amp = args.device == "cuda"
    scaler = torch.cuda.amp.GradScaler(enabled=use_amp)
    t0 = time.time()
    best_val = float("inf")

    for step in range(total_steps):
        x, y = train_ds.get_batch(args.batch_size, args.device)
        with torch.autocast(device_type=args.device, dtype=torch.bfloat16, enabled=use_amp):
            _, loss = model(x, targets=y)
        scaler.scale(loss).backward()
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        scaler.step(optimizer)
        scaler.update()
        optimizer.zero_grad(set_to_none=True)

        progress = step / max(total_steps - 1, 1)
        lr = args.lr * (0.5 * (1 + math.cos(math.pi * min(progress, 1.0)))) if step >= warmup else args.lr * (step + 1) / warmup
        for g in optimizer.param_groups:
            g["lr"] = lr

        if (step + 1) % 5 == 0 or step == total_steps - 1:
            vloss = masked_loss(model, val_ds, args.device)
            print(f"  step {step+1:>4}/{total_steps} | loss {loss.item():.3f} | val {vloss:.3f} | lr {lr:.1e} | {time.time()-t0:.0f}s")
            if vloss < best_val:
                best_val = vloss
                torch.save({"model": model.state_dict(), "step": step + 1}, out_dir / "best.pt")

        if (step + 1) % 10 == 0 or step == total_steps - 1:
            teks = generate(model, tok,
                            "<|user|>Jelaskan apa itu Return on Equity (ROE)?<|eos|><|assistant|>",
                            max_new=50, device=args.device)
            print(f"  [sampel] {teks[-200:]!r}")

    torch.save({"model": model.state_dict(), "step": total_steps}, out_dir / "last.pt")
    print(f"✅ SFT selesai — checkpoint: {out_dir} (best val {best_val:.3f})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
