# 🏗️ MEMBANGUN LLM SENDIRI (DARI NOL) — PETA TAHAPAN 4IG-FINANCE

> **Tujuan**: LLM khusus saham Indonesia dengan 3 kemampuan — **Pemahaman** (edukasi),
> **Penilaian** (valuasi), **Rekomendasi** (edukatif + disclaimer).
> **Cara**: pretraining dari nol (300M → 1.1B parameter), bukan fine-tune.
> **Lokasi kerja**: `apps/ai-training/` — tiap tahap punya *definition of done* (DoD) yang bisa dicek.

---

## 🚫 PRINSIP DATA (TIDAK BOLEH DILANGGAR)

**Dilarang keras: data yang dihasilkan LLM lain (Gemini/GPT/Claude/dll).**

Alasan:
1. **Ilmiah** — *model collapse* (Shumailov et al., Nature 2024): model yang dilatih dengan
   output model lain makin repetitif, kehilangan keragaman, melupakan distribusi data asli.
2. **Kontrak (ToS)** — OpenAI/Google/Anthropic melarang output-nya dipakai untuk membangun
   model yang bersaing. 4IG-Finance berpotensi bersaing → berisiko.
3. **Filosofi** — "model sendiri" harus lahir dari data nyata, bukan salinan model lain.

Yang **boleh**:
- ✅ Data fundamental real (yfinance/IDX) → dirangkai template deterministik (bukan LLM)
- ✅ Teks buatan manusia: Wikipedia, laporan tahunan, artikel, buku, korpus riset
- ✅ Q&A **ditulis manual** (kamu/komunitas/penasihat) — kualitas > kuantitas
- ✅ Evaluasi: bank soal buatan manusia

*Template dari data real itu sah — yang dilarang hanya teks yang *dihasilkan* model AI lain.*

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
- [ ] **1a. Corpus pretraining** (belajar bahasa + istilah saham) — **HANYA teks manusia**:
  - `build_pretrain_corpus.py` — input: file .txt/.md/.csv apa pun (laporan tahunan IDX, artikel edukasi, berita pasar)
  - `download_corpus_hf.py` — corpus publik ID via HuggingFace (Wikipedia ID, OSCAR-id — teks manusia)
  - `convert_csv_corpus.py` — konversi dataset CSV teks manusia (mis. IndonLU) → kalimat
  - ✅ **Starter corpus terbukti jalan**: 74.913 kalimat unik, ±2,2 juta token (8,5 MB) dari
    `id-news.txt` (berita Otosia) + dataset IndonLU (review/tweet/QA) — lihat `data/pretrain/manifest.json`
  - ⏳ **Scaling ke 1,3 miliar token**: jalankan di mesin sendiri (sandbox ini memblokir
    HuggingFace/OPUS) — resep lengkap di `apps/ai-training/references/wicara-llm/REFERENSI.md`
    (OpenSubtitles 40% · FineWeb-2 20% · Wikipedia 15% · Aya 12% · Cendol 12% · TED 1%)
- [ ] **1b. Dataset Pemahaman** (±50–100K Q&A): definisi PE/PBV/ROE/DER, cara baca laporan keuangan, penjelasan sektor IDX — template dari referensi + **ditulis manual**
- [ ] **1c. Dataset Penilaian** (±20–50K): valuasi per saham dari data fundamental (angka real, label murah/wajar/premium vs sektor) — **template deterministik dari angka real** (✅ sudah jalan)
- [ ] **1d. Dataset Rekomendasi** (±10–30K): format jawaban data → analisis → risiko → kesimpulan edukatif → disclaimer — template dari data real + pedoman format manual
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
| Deploy | $10–30/bulan | Tahap 5 |
| **Total sekali jalan** | **± Rp 1–5 juta** | **± 6–8 minggu kerja bertahap** |

> Catatan: tanpa generator sintetis LLM, biaya Tahap 1 tinggal waktu & tenaga
> (pengumpulan corpus + penulisan Q&A manual) — tidak ada biaya API.

---

## ⚖️ Aturan Emas (tidak bisa ditawar)

1. **Setiap jawaban = edukatif, bukan ajakan beli/jual** — disclaimer wajib di ≥90% data SFT.
2. **Angka harus grounded** — produksi memakai RAG (data real dari API), model tidak menjawab angka dari ingatan.
3. **Tiap tahap lulus DoD dulu, baru lanjut** — jangan menumpuk utang teknis.

---

*Dokumen ini adalah papan kendali. Centang checklist di atas seiring progres, dan update `RESUME.md` tiap tahap selesai.*
