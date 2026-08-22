"""
TAHAP 2c — Pretrain 4IG-Finance (decoder-only transformer, dari nol).

- Model: adaptasi WicaraLLM src/model (Apache-2.0) — RMSNorm, RoPE, GQA, SwiGLU
- Data: hasil Tahap 2b (train.bin / val.bin, uint16, EOS antar dokumen)
- Optimizer: AdamW + cosine LR dengan warmup
- Checkpoint: resume otomatis dari out-dir bila ada
- Sampling: decode teks via tokenizer Tahap 2a

Penggunaan:
    # smoke test (CPU, config kecil) — buktikan loop jalan
    .venv/bin/python stage2_pretrain/train.py --config configs/model-smoke.json \
        --train-bin data/tokens/train.bin --val-bin data/tokens/val.bin \
        --steps 20 --out-dir checkpoints/smoke --device cpu

    # pretrain 300M (GPU 24GB sewa)
    .venv/bin/python stage2_pretrain/train.py --config configs/model-300m.json \
        --train-bin data/tokens/train.bin --val-bin data/tokens/val.bin \
        --out-dir checkpoints/run1 --device cuda
"""

from __future__ import annotations

import argparse
import math
import sys
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

from stage2_pretrain.model.config import load_config  # noqa: E402
from stage2_pretrain.model.transformer import MiniLLM as Transformer  # noqa: E402


# ---------------------------------------------------------------------------
# Data (uint16 memmap)
# ---------------------------------------------------------------------------
class TokenDataset:
    def __init__(self, path: Path, seq_len: int):
        self.tokens = np.memmap(str(path), dtype=np.uint16, mode="r")
        self.seq_len = seq_len
        self.n_batch = max(1, len(self.tokens) // seq_len)

    def get_batch(self, batch_size: int, device: str) -> tuple[torch.Tensor, torch.Tensor]:
        ix = torch.randint(0, self.n_batch - 1, (batch_size,))
        x = torch.stack(
            [torch.from_numpy(self.tokens[i * self.seq_len : (i + 1) * self.seq_len].astype(np.int64)) for i in ix]
        )
        y = torch.stack(
            [torch.from_numpy(self.tokens[i * self.seq_len + 1 : (i + 1) * self.seq_len + 1].astype(np.int64)) for i in ix]
        )
        return x.to(device), y.to(device)


# ---------------------------------------------------------------------------
# Optimizer & jadwal LR (cosine + warmup)
# ---------------------------------------------------------------------------
def build_optimizer(model: torch.nn.Module, lr: float, weight_decay: float):
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


def lr_at(step: int, total_steps: int, warmup: int, base_lr: float) -> float:
    if step < warmup:
        return base_lr * (step + 1) / max(warmup, 1)
    progress = (step - warmup) / max(total_steps - warmup, 1)
    return base_lr * 0.5 * (1 + math.cos(math.pi * min(progress, 1.0)))


# ---------------------------------------------------------------------------
# Sampling
# ---------------------------------------------------------------------------
@torch.no_grad()
def sample(model, tok, prompt: str, max_new: int = 60, device: str = "cpu", temperature: float = 0.8) -> str:
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


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="configs/model-300m.json")
    ap.add_argument("--train-bin", default="data/tokens/train.bin")
    ap.add_argument("--val-bin", default="data/tokens/val.bin")
    ap.add_argument("--tokenizer", default="data/tokenizer/4ig-bpe-16k.json")
    ap.add_argument("--out-dir", default="checkpoints/run1")
    ap.add_argument("--steps", type=int, default=None, help="batasi langkah (smoke run)")
    ap.add_argument("--batch-size", type=int, default=8)
    ap.add_argument("--grad-accum", type=int, default=8)
    ap.add_argument("--eval-interval", type=int, default=250)
    ap.add_argument("--sample-interval", type=int, default=500)
    ap.add_argument("--lr", type=float, default=None)
    ap.add_argument("--seed", type=int, default=1337)
    ap.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")
    args = ap.parse_args()

    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    cfg = load_config(args.config)
    print("=" * 70)
    print(f"  PRETRAIN 4IG — {cfg.name}")
    print("=" * 70)
    print(f"  Parameter : {cfg.param_count()/1e6:.1f}M (estimasi VRAM {cfg.vram_estimate_gb():.1f} GB)")
    print(f"  d_model={cfg.d_model} · layers={cfg.n_layer} · heads={cfg.n_head} "
          f"(kv {cfg.n_kv_head}) · ffn={cfg.ffn_hidden} · seq={cfg.max_seq_len}")
    print(f"  Data      : {args.train_bin} + {args.val_bin}")
    print(f"  Device    : {args.device}")

    train_ds = TokenDataset(Path(args.train_bin), cfg.max_seq_len)
    val_ds = TokenDataset(Path(args.val_bin), cfg.max_seq_len)
    print(f"  train tokens: {len(train_ds.tokens):,} · val: {len(val_ds.tokens):,}")

    model = Transformer(cfg).to(args.device)
    print(f"  Loss awal (ekspektasi ln(vocab)): {cfg.expected_init_loss:.2f}")

    optimizer = build_optimizer(model, args.lr or cfg.learning_rate, cfg.weight_decay)
    lr_base = args.lr or cfg.learning_rate

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    step0 = 0
    ckpt = out_dir / "last.pt"
    if ckpt.exists():
        state = torch.load(ckpt, map_location=args.device)
        model.load_state_dict(state["model"])
        optimizer.load_state_dict(state["optim"])
        step0 = state["step"]
        print(f"  ↻ Resume dari checkpoint (step {step0})")

    total_tokens_est = len(train_ds.tokens)
    steps_per_epoch = max(1, total_tokens_est // (args.batch_size * args.grad_accum * cfg.max_seq_len))
    total_steps = args.steps if args.steps else max(steps_per_epoch * 5, 1000)
    warmup = max(1, int(total_steps * cfg.warmup_ratio))
    print(f"  Total steps: {total_steps} · warmup {warmup}")

    use_amp = args.device == "cuda"
    scaler = torch.cuda.amp.GradScaler(enabled=use_amp)

    # tokenizer untuk sampling
    try:
        from tokenizers import Tokenizer

        tok = Tokenizer.from_file(args.tokenizer)
    except Exception:  # noqa: BLE001
        tok = None

    t0 = time.time()
    loss_accum = 0.0
    best_val = float("inf")

    for step in range(step0, total_steps):
        model.train()
        for _ in range(args.grad_accum):
            x, y = train_ds.get_batch(args.batch_size, args.device)
            with torch.autocast(device_type=args.device, dtype=torch.bfloat16, enabled=use_amp):
                _, loss = model(x, targets=y)
            scaler.scale(loss / args.grad_accum).backward()

        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        scaler.step(optimizer)
        scaler.update()
        optimizer.zero_grad(set_to_none=True)

        for g in optimizer.param_groups:
            g["lr"] = lr_at(step + 1, total_steps, warmup, lr_base)

        loss_accum += loss.item() * args.grad_accum

        if (step + 1) % args.eval_interval == 0 or step == total_steps - 1:
            model.eval()
            vloss = 0.0
            with torch.no_grad():
                for _ in range(8):
                    xv, yv = val_ds.get_batch(args.batch_size, args.device)
                    with torch.autocast(device_type=args.device, dtype=torch.bfloat16, enabled=use_amp):
                        _, vl = model(xv, targets=yv)
                        vloss += vl.item()
            vloss /= 8
            avg = loss_accum / max(args.eval_interval, 1)
            lr_now = optimizer.param_groups[0]["lr"]
            print(f"  step {step+1:>6}/{total_steps} | loss {avg:.3f} | val {vloss:.3f} | lr {lr_now:.2e} | {time.time()-t0:.0f}s")
            loss_accum = 0.0

            if vloss < best_val:
                best_val = vloss
                torch.save({"model": model.state_dict(), "step": step + 1}, out_dir / "best.pt")

        if tok is not None and ((step + 1) % args.sample_interval == 0 or step == total_steps - 1):
            teks = sample(model, tok, "saham", max_new=40, device=args.device)
            print(f"  [sampel] {teks[:160]!r}")

        if (step + 1) % 500 == 0:
            torch.save({"model": model.state_dict(), "optim": optimizer.state_dict(), "step": step + 1}, ckpt)

    torch.save({"model": model.state_dict(), "optim": optimizer.state_dict(), "step": total_steps}, ckpt)
    print(f"✅ Selesai — checkpoint: {out_dir} (best val {best_val:.3f})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
