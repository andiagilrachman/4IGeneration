# 🏗️ MEMBANGUN LLM SENDIRI (DARI NOL) — PETA TAHAPAN 4IG-FINANCE

> **Tujuan**: LLM khusus saham Indonesia dengan 3 kemampuan — **Pemahaman** (edukasi),
> **Penilaian** (valuasi), **Rekomendasi** (edukatif + disclaimer).
> **Cara**: pretraining dari nol (300M → 1.1B parameter), bukan fine-tune.
> **Lokasi kerja**: `apps/ai-training/` — tiap tahap punya *definition of done* (DoD) yang bisa dicek.

---

## 🗺️ Ringkasan 6 Tahap

| Tahap | Nama | Deliverable | DoD (harus bisa dibuktikan) |
|---|---|---|---|
| **0** | Persiapan | Scaffold `apps/ai-training/` + peta tahapan ini | Folder struktur jelas, tiap tahap ada script & cara cek |
| **1** | Data | Corpus pretraining + 3 dataset SFT (pemahaman/penilaian/rekomendasi) | `validate_dataset.py` PASS: format benar, ≥90% ada disclaimer, 0 duplikat |
| **2** | Tokenizer & Pretrain | Tokenizer BBPE 32–48K + model 300M (proof-of-concept) | Loss pretrain turun konsisten; model bisa "bicara" bahasa Indonesia (uji sample) |
| **3** | SFT | Fine-tune instruksi 3 kemampuan (QLoRA) | Jawaban bank soal 200 pertanyaan ≥ 70% masuk akal |
| **4** | DPO & Evaluasi | Alignment + bank soal + cek halusinasi angka | Model menolak "jaminan untung", selalu disclaimer, angka grounded |
| **5** | Deploy | GGUF Q4 → gateway 4IG (Ollama) | `curl /providers/status` menampilkan `4IG-Finance` aktif |

---

## 🔬 Detail per Tahap

### TAHAP 0 — PERSIAPAN ✅ (dibuat sekarang)
- [x] Scaffold `apps/ai-training/` (struktur per tahap)
- [x] Peta tahapan ini (`docs/BUILD-LLM-TAHAPAN.md`)
- [ ] Install env: `python3 -m venv .venv && pip install -r requirements.txt`
- [ ] Tes: jalankan builder dataset Tahap 1

**Cara cek**:
```bash
cd apps/ai-training
python3 stage1_data/build_sft_dataset.py --limit 28 --out data/sft/dataset.jsonl
python3 stage1_data/validate_dataset.py --in data/sft/dataset.jsonl
```

### TAHAP 1 — DATA (80% pekerjaan) 🚧
- [ ] **1a. Corpus pretraining** (belajar bahasa + istilah saham):
  - `build_pretrain_corpus.py` — input: file .txt/.md/.csv apa pun (laporan tahunan, artikel edukasi, berita pasar)
  - Opsional: download corpus publik ID (OSCAR-id, Wikipedia ID, IndoNews) via HuggingFace `datasets`
  - Target: 0.5–2 GB teks bersih
- [ ] **1b. Dataset Pemahaman** (±50–100K Q&A): definisi PE/PBV/ROE/DER, cara baca laporan keuangan, penjelasan sektor IDX
- [ ] **1c. Dataset Penilaian** (±20–50K): valuasi per saham dari data fundamental (angka real, label murah/wajar/premium vs sektor)
- [ ] **1d. Dataset Rekomendasi** (±10–30K): format jawaban data → analisis → risiko → kesimpulan edukatif → disclaimer
- [ ] **1e. Validasi**: `validate_dataset.py` PASS + sampling manual 10%

**Cara cek**:
```bash
python3 stage1_data/validate_dataset.py --in data/sft/dataset.jsonl
```

### TAHAP 2 — TOKENIZER & PRETRAIN
- [ ] Latih tokenizer SentencePiece/BBPE (vocab 32K) di atas corpus Tahap 1a
- [ ] Pretrain **300M** (12 layer, 12 head, hidden 768) — 2–5 miliar token, RTX 4090 sewa ±3–6 hari
- [ ] Uji: generate teks acak — cek bahasa Indonesia masuk akal
- [ ] (Opsional, setelah 300M lulus) Pretrain **1.1B** — ±2–3 minggu

**Cara cek**: grafik loss turun + sampel output per checkpoint.

### TAHAP 3 — SFT (ajari cara menjawab)
- [ ] Format dataset SFT → Alpaca/ShareGPT
- [ ] QLoRA di atas pretrain 300M/1.1B (peft, r=64)
- [ ] Evaluasi bank soal 200 pertanyaan (jawaban pasti vs model)

**Cara cek**: skor akurasi bank soal ≥ 70% jawaban masuk akal.

### TAHAP 4 — DPO & EVALUASI
- [ ] Dataset preferensi: jawaban baik (dengan disclaimer, tanpa jaminan) vs buruk
- [ ] DPO training (1–2 epoch)
- [ ] Uji halusinasi angka: model harus bilang "tidak tahu" saat data tidak diberikan

**Cara cek**: 20 pertanyaan jebakan → 0 jawaban "jaminan untung".

### TAHAP 5 — DEPLOY
- [ ] Konversi ke GGUF Q4 (llama.cpp / `ollama create`)
- [ ] Upload ke mini PC/VPS + `OLLAMA_BASE_URL` di gateway 4IG
- [ ] Tampil sebagai provider "4IG-Finance" di Admin Panel

**Cara cek**:
```bash
curl http://localhost:8000/internal/v1/providers/status  # → 4IG-Finance aktif
```

---

## 💰 Biaya & Timeline (2026)

| Item | Biaya | Timeline |
|---|---|---|
| GPU RTX 4090 sewa (RunPod ~$0.34/jam) | $25–200 | Tahap 2 (3–21 hari) |
| SFT + DPO | $10–30 | Tahap 3–4 (2–4 hari) |
| Dataset sintetis (opsional API Gemini) | $20–50 | Tahap 1 |
| Deploy | $10–30/bulan | Tahap 5 |
| **Total sekali jalan** | **± Rp 1–5 juta** | **± 6–8 minggu kerja bertahap** |

---

## ⚖️ Aturan Emas (tidak bisa ditawar)

1. **Setiap jawaban = edukatif, bukan ajakan beli/jual** — disclaimer wajib di ≥90% data SFT.
2. **Angka harus grounded** — produksi memakai RAG (data real dari API), model tidak menjawab angka dari ingatan.
3. **Tiap tahap lulus DoD dulu, baru lanjut** — jangan menumpuk utang teknis.

---

*Dokumen ini adalah papan kendali. Centang checklist di atas seiring progres, dan update `RESUME.md` tiap tahap selesai.*
