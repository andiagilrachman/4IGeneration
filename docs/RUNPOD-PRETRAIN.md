# 🚀 Pretrain 4IG-Finance di RunPod (GPU sewa) — Panduan Langkah

> Biaya: RTX 4090 24GB ± **$0.34–0.69/jam** (RunPod Community/Secure, 2026).
> Estimasi pretrain 300M di corpus 1,3B token: **±2–4 minggu** kalau 24/7 —
> realistisnya jalankan **bertahap + resume** (checkpoint otomatis tiap 500 step).

## Opsi A — Data disiapkan di rumah, GPU hanya untuk training (paling hemat)

### Di mesin rumahmu (Windows/macOS/Linux)
```bash
# 1) Siapkan data (unduh corpus ~1,3B token, butuh beberapa jam & internet stabil)
cd apps/ai-training
python pipeline.py --steps corpus,build,tokenizer,pack

# 2) Zip data yang sudah jadi (kecil: hanya tokenizer + train.bin/val.bin)
#    Windows:  tar -a -c -f data-tokens.zip data/tokens data/tokenizer configs
#    Linux:    zip -r data-tokens.zip data/tokens data/tokenizer configs
```

### Di RunPod (pod RTX 4090 24GB, template "PyTorch 2.x")
```bash
# 1) Upload data & kode
#    RunPod Console → Pod → Connect → Upload Files (atau scp):
scp data-tokens.zip user@<pod-ip>:/workspace/
scp -r apps/ai-training user@<pod-ip>:/workspace/4ig-training

# 2) Di terminal pod
cd /workspace/4ig-training
unzip ../data-tokens.zip -d .
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt          # torch CUDA otomatis di template PyTorch

# 3) Jalankan pretrain (300M, 24GB VRAM; batch/grad-accum disesuaikan)
python stage2_pretrain/train.py \
    --config configs/model-300m.json \
    --train-bin data/tokens/train.bin \
    --val-bin data/tokens/val.bin \
    --tokenizer data/tokenizer/4ig-bpe-16k.json \
    --out-dir checkpoints/run1 \
    --device cuda --batch-size 8 --grad-accum 16

# 4) Pantau: loss turun, sampel teks muncul tiap 500 step
#    Kalau pod mati: jalankan ulang perintah yang sama → resume otomatis dari last.pt
```

### Simpan hasil & matikan pod (biaya berhenti)
```bash
# Download checkpoint ke rumah / NAS Synology
scp -r user@<pod-ip>:/workspace/4ig-training/checkpoints/run1 ./
# Atau push ke HuggingFace: huggingface-cli upload ... (model sendiri, privat dulu)
```
> 💡 Matikan pod saat tidak training — biaya per jam berhenti.

## Opsi B — Semua di pod (paling simpel, lebih mahal)

```bash
cd /workspace && git clone https://github.com/andiagilrachman/4IGeneration.git
cd 4IGeneration/apps/ai-training
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python pipeline.py --steps corpus,build,tokenizer,pack --corpus-budget 200000
python stage2_pretrain/train.py --config configs/model-300m.json --device cuda \
    --train-bin data/tokens/train.bin --val-bin data/tokens/val.bin \
    --tokenizer data/tokenizer/4ig-bpe-16k.json --out-dir checkpoints/run1
```
> Catatan: corpus penuh 1,3B token butuh ±5GB download di pod — biaya network kecil.

## Parameter yang bisa disesuaikan

| Parameter | Default | Keterangan |
|---|---|---|
| `--batch-size` / `--grad-accum` | 8 / 8 | Naikkan grad-accum sampai VRAM terisi (24GB) |
| `--lr` | 3e-4 | Turunkan jadi 1.5e-4 kalau loss divergen (naik) |
| `--steps` | semua corpus | Batasi untuk uji: `--steps 1000` |
| `--config` | model-300m | `model-smoke.json` untuk uji cepat, `model-1b.json` untuk skala besar |

## Definisi selesai (DoD) Tahap 2c

- [ ] val loss turun **di bawah ln(vocab)=9,70** secara konsisten (target < 6 untuk model 300M)
- [ ] Sampel teks mulai **mirip bahasa Indonesia** yang koheren (bukan token acak)
- [ ] `checkpoints/run1/best.pt` tersimpan + bisa resume
- [ ] Total biaya tercatat (≤ $150 untuk tahap ini, bisa kurang)

## Troubleshooting

| Masalah | Solusi |
|---|---|
| CUDA out of memory | Turunkan `--batch-size` ke 4/2, atau naikkan `--grad-accum` |
| Loss naik terus | Turunkan `--lr` (mis. 1e-4), cek data tidak kosong |
| Download corpus lambat | Jalankan bertahap: `--steps corpus --only wikipedia,fineweb2` dulu |
| Pod mati di tengah | Idem — resume otomatis dari `last.pt` |
| Tokenizer tidak ketemu | Pastikan `--tokenizer data/tokenizer/4ig-bpe-16k.json` (hasil Tahap 2a) |
