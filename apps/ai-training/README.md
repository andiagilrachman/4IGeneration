# 🧠 apps/ai-training — Bangun LLM 4IG-Finance (dari nol)

> LLM khusus saham Indonesia: **Pemahaman · Penilaian · Rekomendasi** (edukatif).
> Peta lengkap: [`docs/BUILD-LLM-TAHAPAN.md`](../../docs/BUILD-LLM-TAHAPAN.md)

## 🚫 Prinsip Data

**DILARANG memakai data yang dihasilkan LLM lain** (Gemini/GPT/Claude/dll) untuk training:
- Risiko *model collapse* (Shumailov et al., Nature 2024)
- Klausul ToS provider (output tidak boleh untuk model bersaing)

Yang dipakai **hanya**:
- Data fundamental real → template deterministik (bukan LLM)
- Teks buatan manusia (Wikipedia ID, laporan tahunan, artikel, buku)
- Q&A ditulis manual

## ⚡ Pipeline Satu Perintah

Semua tahap (corpus → tokenizer → packing → pretrain) bisa dijalankan sekali jalan:

```bash
python pipeline.py              # semua langkah, device otomatis (cuda kalau ada)
python pipeline.py --quick      # versi kecil untuk uji coba (< 5 menit)
python pipeline.py --steps corpus,build,tokenizer,pack   # siapkan data saja
```

Panduan GPU sewa (RunPod): [`docs/RUNPOD-PRETRAIN.md`](../../docs/RUNPOD-PRETRAIN.md)
Sinkron ke PC Windows (C:\4Igeneration): [`sync-pc.bat`](../../sync-pc.bat) + [`docs/SYNC-PC.md`](../../docs/SYNC-PC.md)

## Struktur

```
apps/ai-training/
├── configs/               # Konfigurasi arsitektur model (300M / 1.1B)
├── stage1_data/           # TAHAP 1 — builder dataset
│   ├── build_pretrain_corpus.py   # corpus pretraining (teks bebas)
│   ├── build_sft_dataset.py       # dataset 3 kemampuan (dari data fundamental)
│   └── validate_dataset.py        # validasi format/duplikat/disclaimer
├── stage2_tokenizer/      # TAHAP 2 — (belum dibuat)
├── stage3_sft/            # TAHAP 3 — (belum dibuat)
├── stage4_dpo/            # TAHAP 4 — (belum dibuat)
├── stage5_deploy/         # TAHAP 5 — (belum dibuat)
└── data/                  # hasil dataset (git-ignored)
```

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Tahap 1 — Build dataset

```bash
# 1) Dataset SFT 3 kemampuan dari data fundamental saham IDX (offline, pakai demo_data)
python3 stage1_data/build_sft_dataset.py --limit 28 --out data/sft/dataset.jsonl

# 2) Validasi
python3 stage1_data/validate_dataset.py --in data/sft/dataset.jsonl

# 3) Corpus pretraining dari folder teks
python3 stage1_data/build_pretrain_corpus.py --input-dir ./data/raw_corpus --out data/pretrain/

# 4) Konversi dataset CSV teks manusia (IndonLU dll) → corpus
python3 stage1_data/convert_csv_corpus.py --input-dir ./data/raw_indonlu --out data/pretrain_raw/indonlu.txt

# 5) (Di mesin sendiri — HF/OPUS) unduh corpus publik manusia
python3 stage1_data/download_corpus_hf.py --dataset wikipedia --config 20220301.id --max-docs 50000 --out data/pretrain_raw/wiki-id.txt
```

> Referensi implementasi Tahap 2–4: `references/wicara-llm/` (WicaraLLM, Apache-2.0 —
> SLM Indonesia 56M dari nol di GPU 6GB, korpus 1,3B token). Lihat `references/wicara-llm/REFERENSI.md`.
