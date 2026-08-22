# 📓 RESUME PROGRES — 4IGeneration v2.0

> 📌 Resume resmi proyek: **apa yang sudah dikerjakan**, **sejauh mana**, dan **apa langkah berikutnya**.
> ⚡ Auto-update: setiap `git commit` otomatis menambah entri di **Log Pekerjaan** (via post-commit hook), atau manual via `./scripts/resume.sh "deskripsi"`.
> 🕒 Terakhir diperbarui: **2026-08-22**

---

## 🧭 Ringkasan Eksekutif

| Item | Status |
|---|---|
| 🎯 Produk | **AI Intelligence Platform for Smart Investing** — analisis & screening saham IDX berbasis AI (B2C web tools + B2B public API) |
| 📊 Progres roadmap 12 bulan | **~75%** — Phase 1-3 (Foundation, Monetization, Public API) SELESAI + Phase 4 (Own Model) sedang dikerjakan |
| 🏁 Fokus aktif | **Dua jalur**: (A) Stabilisasi web di lokal/PC Windows · (B) **Membangun LLM sendiri 4IG-Finance dari nol** |
| 🗂 Repositori git | Branch utama `main` + branch kerja **`arena/01a02969-4igeneration`** (semua pekerjaan LLM & fix ada di sini) |
| ☁️ Remote (GitHub) | ✅ Terhubung & ter-push → [github.com/andiagilrachman/4IGeneration](https://github.com/andiagilrachman/4IGeneration) |
| 🖥️ PC Windows | ✅ Ter-clone di `C:\4Igeneration` (via `sync-pc.bat`), web stack JALAN: Web :3000 · API :3001 · Admin :3002 · MySQL XAMPP |
| 📚 Blueprint | ✅ Diarsipkan di `docs/blueprint/` (20 bagian) |
| 📓 Sistem resume otomatis | ✅ `scripts/resume.sh` + post-commit hook |

---

## 🗺️ Peta Proyek — 2 Jalur

### JALUR A — Web Platform 4IGeneration (Phase 1-3: ✅ selesai)

Monorepo Turborepo + pnpm: `apps/web` (Next.js 14) · `apps/api` (NestJS 10, 16 modul, 32 tabel Prisma/MySQL) · `apps/ai-service` (FastAPI, AI Gateway multi-provider) · `apps/admin` (Refine/Vite/AntD) + `packages/` (shared-types, constants, utils, sdk-js, sdk-python).

| Fitur | Status |
|---|---|
| Auth (register/login/JWT/refresh/verify-email/reset-password) | ✅ |
| Screener fundamental IDX + skor kualitas + AI summary | ✅ MVP |
| Market (28 saham likuid, data yfinance) · Watchlist · Compare · Export CSV | ✅ |
| Analisis emiten + riwayat per-user | ✅ |
| Subscription & credits (free/starter/pro) · Midtrans payment + webhook | ✅ |
| Market Recap (Google News RSS + sentiment AI) · RAG Q&A (PDF → ChromaDB) | ✅ |
| Public API `/public/*` (API key `4IG_*`, rate limit Redis, usage tracking) | ✅ |
| SDK resmi JS & Python · Halaman developer docs | ✅ |
| Admin panel (CRUD providers/keys/models/plans/settings) | ✅ |
| Blog + SEO (sitemap, robots, JSON-LD) · Landing cosmic | ✅ |
| Docker Compose (MySQL/Redis/Nginx) + Dockerfile 4 app · CI/CD scaffold (disabled) | ✅ |

### JALUR B — Bangun LLM Sendiri 4IG-Finance (dari nol) — SEDANG BERJALAN

Tujuan: LLM khusus saham Indonesia (300M → 1.1B param, pretrain dari nol) dengan 3 kemampuan — **Pemahaman** (edukasi), **Penilaian** (valuasi), **Rekomendasi** (edukatif + disclaimer). Lokasi: `apps/ai-training/` + papan tahapan `docs/BUILD-LLM-TAHAPAN.md`.

**🚫 Prinsip Data (tidak bisa ditawar):** DILARANG memakai output LLM lain (Gemini/GPT/Claude) untuk training — risiko *model collapse* (Nature 2024) + klausul ToS. Hanya: data fundamental real (template deterministik), teks manusia (Wikipedia, berita, laporan tahunan), Q&A ditulis manual.

---

## 📊 Progres Tahapan LLM 4IG-Finance

| Tahap | Deliverable | Status |
|---|---|---|
| **0 — Persiapan** | Scaffold `apps/ai-training/` + peta tahapan | ✅ **Selesai** |
| **1 — Data** | | 🚧 **Pipeline jalan, tinggal scaling** |
| 1a. Corpus pretraining | 74.913 kalimat unik, ±2,2 juta token (8,5MB) dari berita + IndonLU | ✅ (scaling 1,3B token di PC sendiri) |
| 1b. Dataset Pemahaman | 33 contoh (25 konsep edukasi) | ✅ (perlu manual Q&A) |
| 1c. Dataset Penilaian | 91 contoh (valuasi per saham + perbandingan sektor) | ✅ |
| 1d. Dataset Rekomendasi | 63 contoh (analisis + ringkasan 3 poin) | ✅ |
| 1e. Validasi | 187 contoh, 0 duplikat, disclaimer 100% | ✅ PASS |
| **2 — Tokenizer & Pretrain** | | 🚧 |
| 2a. Tokenizer BPE | vocab 16.384, rasio kompresi 5,02 char/token | ✅ |
| 2b. Packing token | train.bin (1,75M token) + val.bin (92K), EOS, split dokumen | ✅ |
| 2c. Skrip pretrain | Arsitektur WicaraLLM (RMSNorm/RoPE/GQA/SwiGLU) + smoke test LULUS (val 8,50) | ✅ siap GPU |
| 2c'. Pipeline 1-perintah | `pipeline.py` + `download_full_corpus.py` (6 sumber) + panduan RunPod | ✅ |
| 2d. Pretrain 300M sungguhan | — | ⏳ **butuh GPU sewa** |
| **3 — SFT** | Fine-tune instruksi 3 kemampuan (QLoRA) | ⏳ Belum |
| **4 — DPO & Evaluasi** | Alignment + bank soal 200 pertanyaan | ⏳ Belum |
| **5 — Deploy** | GGUF Q4 → Ollama → gateway 4IG (provider "4IG-Finance") | ⏳ Belum |

**DoD berikutnya:** pretrain 300M di RunPod RTX 4090 (corpus 1,3B token, estimasi $5–15/jalan) → val loss < 6 → sampel bahasa Indonesia koheren.

---

## ✅ Yang Sudah Selesai — Log Lengkap (terbaru di atas)

| Tanggal | Pekerjaan | Status |
|---|---|---|
| 2026-08-22 | **Stack web JALAN di PC Windows** (`C:\4Igeneration`): Web :3000 · API :3001 · Admin :3002 · MySQL XAMPP aktif. Fix: `start-all.bat` pakai `npm run dev` (API tidak punya `start:dev`), alias `start:dev` di package.json, ai-service pakai `.venv` bila ada | ✅ Selesai |
| 2026-08-22 | `sync-pc.bat` + `docs/SYNC-PC.md` — sinkron 1-klik ke PC (clone/pull + venv + pipeline), auto-pindah branch `arena` | ✅ Selesai |
| 2026-08-22 | Pipeline 1-perintah `pipeline.py` (corpus→tokenizer→pack→train, `--quick`) + downloader 6 sumber corpus manusia + `docs/RUNPOD-PRETRAIN.md` + fix vocab ikut tokenizer; uji end-to-end lulus | ✅ Selesai |
| 2026-08-22 | Tahap 2c — skrip pretrain (arsitektur WicaraLLM adaptasi, Apache-2.0) + smoke test LULUS di CPU (val loss 9,21→8,50) | ✅ Selesai |
| 2026-08-22 | Tahap 2b — packing token train.bin (1.746.518) + val.bin (92.209), split level dokumen 5%, EOS, decode-verify | ✅ Selesai |
| 2026-08-22 | Tahap 2a — tokenizer BPE 16K (rasio kompresi 5,02 char/token, roundtrip valid) | ✅ Selesai |
| 2026-08-22 | Tahap 1a — korpus pretraining teks manusia: converter CSV IndonLU + berita id-news → 74.913 kalimat (±2,2 juta token) + referensi WicaraLLM disalin (Apache-2.0, resep korpus 1,3B token) | ✅ Selesai |
| 2026-08-22 | Tahap 0-1 — scaffold `apps/ai-training/` (configs 300M/1.1B, builder corpus, dataset SFT 3 kemampuan, validator) + peta `docs/BUILD-LLM-TAHAPAN.md`; pipeline data teruji 69 contoh PASS | ✅ Selesai |
| 2026-08-16 | Audit keuangan final: normalisasi YTD→kuartal, annualisasi, rekonsiliasi arus kas, metrik bank (NIM/LDR/CASA); test regression `test_financial_audit.py`; fix @types/node admin | ✅ Selesai |
| 2026-08-16 | Backup v11 (chart OHLCV + Invezgo) — manifest | ✅ Selesai |
| 2026-08-10 | Phase 3: Growth features (watchlist CRUD, compare, export CSV), SDK JS/Python, developer docs, Public API + API keys | ✅ Selesai |
| 2026-08-10 | Phase 2: RAG Q&A (ChromaDB), Market Recap, Midtrans, Subscription & Credits, Analisis Emiten | ✅ Selesai |
| 2026-08-10 | Phase 4 prep: provider Ollama di gateway, script dataset fine-tune, `PHASE4-OWN-MODEL.md` | ✅ Selesai |
| 2026-08-09-10 | Phase 1: auth, design system cosmic, stock fetcher, screener MVP, admin panel, Redis cache | ✅ Selesai |
| 2026-08-09 | Init monorepo v2 + skeleton 4 apps + Docker + Prisma + AI gateway + resume otomatis | ✅ Selesai |

---

## 🚧 Belum Dikerjakan (Loose Ends)

| Item | Prioritas | Catatan |
|---|---|---|
| **Pretrain 300M sungguhan** (Tahap 2d) | 🔴 Tinggi (jalur LLM) | Butuh GPU sewa RunPod + corpus besar dulu di PC |
| **Scaling corpus ke 1,3B token** | 🔴 Tinggi | Unduh 6 sumber (HF/OPUS) di PC sendiri — sandbox memblokir |
| **Q&A manual** (`data/manual/qa-template.csv`, 24 pertanyaan) | 🟡 Sedang | Tulis jawaban dari buku/referensi — kualitas tertinggi |
| **Tahap 3 — SFT** | 🟡 Sedang | Skrip fine-tune instruksi (peft/QLoRA) |
| **Tahap 4 — DPO & bank soal** | 🟡 Sedang | Alignment + evaluasi 200 pertanyaan |
| **Tahap 5 — Deploy ke gateway** | 🟡 Sedang | GGUF → Ollama → provider "4IG-Finance" |
| AI Service di PC (port 8000) | 🟡 Sedang | Butuh Python 3.11/3.12 (3.14 belum didukung dependensi) — tanpa ini fitur AI web pakai data demo |
| API key AI (Gemini/Groq) di `apps/ai-service/.env` | 🟡 Sedang | Supaya AI gateway terhubung provider nyata |
| CI/CD aktif | 🟢 Rendah | `.github/workflows-disabled/` — butuh token workflow scope |
| Verifikasi endpoint `/stocks/:code/chart` (v11) | 🟢 Rendah | Ada di backup zip, belum di source tree |
| Merge branch `arena` → `main` | 🟢 Rendah | Setelah pekerjaan LLM stabil |
| Deploy VPS / domain | 🟢 Rendah | Ditunda (keputusan user) — fokus stabil lokal dulu |

---

## ⏭️ Langkah Selanjutnya (Next Actions) — Urutan Rekomendasi

1. **Di PC-mu**: `cd C:\4Igeneration\apps\ai-training` → `python pipeline.py --quick` (uji pipeline, <5 menit)
2. **Di PC-mu**: `python pipeline.py --steps corpus,build,tokenizer,pack` (unduh corpus 1,3B token — beberapa jam; mulai `--only wikipedia,fineweb2` untuk cepat)
3. **Isi Q&A manual** di `data/manual/qa-template.csv` (24 pertanyaan edukasi saham)
4. **Sewa GPU RunPod** → pretrain 300M → download checkpoint (panduan `docs/RUNPOD-PRETRAIN.md`)
5. **Tahap 3 SFT** → fine-tune instruksi 3 kemampuan
6. **Tahap 4 DPO + bank soal** → evaluasi & alignment
7. **Tahap 5 Deploy** → GGUF → Ollama → provider "4IG-Finance" di gateway 4IG
8. (Paralel) Aktifkan AI Service di PC + isi API key AI
9. (Setelah stabil) Merge branch kerja ke `main` + CI/CD + deploy VPS

---

## 📓 Log Pekerjaan Otomatis (terbaru di atas)

<!-- LOG-START -->
| 2026-08-22 | feat: Tahap 3 SFT — prepare_sft.py (chat template + masking -100, 187 contoh → 169/18) + train_sft.py (smoke LULUS CPU val 8,34) + bank soal 15 pertanyaan & evaluate.py (starter Tahap 4) + start-ai-service.bat & tes-llm.bat untuk PC | ✅ Selesai | Tahap 3a-3b + 4a |
| 2026-08-22 | fix: start-all.bat pakai npm run dev (API tidak punya start:dev) + ai-service pakai .venv kalau ada; tambah alias start:dev di package.json | ✅ Selesai | auto |
| 2026-08-22 | feat: sync-pc.bat + docs/SYNC-PC.md — sinkron satu-klik ke C:\4Igeneration (clone/pull + venv + pipeline) + auto-pindah branch arena | ✅ Selesai | auto |
| 2026-08-22 | feat: pipeline satu-perintah pipeline.py + downloader corpus 6 sumber + panduan RunPod (siap pretrain GPU) | ✅ Selesai | auto |
| 2026-08-22 | feat: Tahap 2c — skrip pretrain (arsitektur WicaraLLM adaptasi) + smoke test LULUS di CPU (val loss 9,21→8,60) | ✅ Selesai | auto |
| 2026-08-22 | feat: Tahap 2b — packing token train.bin/val.bin (1,75M token, pisah level dokumen, EOS, verify) | ✅ Selesai | auto |
| 2026-08-22 | feat: Tahap 2a tokenizer BPE 16K (rasio 5,02) + dataset SFT diperluas ke 187 contoh dengan perbandingan sektor | ✅ Selesai | auto |
| 2026-08-22 | feat: Tahap 1a — korpus pretraining teks manusia (74.913 kalimat, ±2,2M token) + referensi WicaraLLM untuk Tahap 2-4 | ✅ Selesai | auto |
| 2026-08-22 | docs: tambah Prinsip Data — larang data sintetis LLM lain (model collapse + ToS), strategi 100% data manusia/nyata | ✅ Selesai | auto |
| 2026-08-22 | feat: mulai build LLM 4IG-Finance dari nol — Tahap 0-1 (scaffold ai-training + pipeline dataset 3 kemampuan) | ✅ Selesai | auto |
| 2026-08-16 | audit: final non-bank financial regression + TypeScript environment | ✅ Selesai | auto |
| 2026-08-10 | feat: verifikasi email + reset password (auth), restyle Signature Look, admin dark theme + Plans | ✅ Selesai | auto |
| 2026-08-10 | feat: Email (Resend) + Settings di Admin Panel — market recap otomatis via email | ✅ Selesai | auto |
| 2026-08-10 | feat: Phase 4 prep — provider Ollama/local model di AI Gateway + script dataset fine-tune | ✅ Selesai | auto |
| 2026-08-10 | feat: Growth Features (W33-34) — watchlist CRUD, compare 2-5 saham + AI summary, export CSV. 🏆 Phase 3 SELESAI | ✅ Selesai | auto |
| 2026-08-10 | feat: SDK JS & Python (W31-32) + Developer Docs — SDK teruji live | ✅ Selesai | auto |
| 2026-08-10 | feat: Public API & API Keys (W25-28) — API key 4IG_*, rate limit Redis, usage tracking | ✅ Selesai | auto |
| 2026-08-10 | feat: RAG Q&A (W21-24) — upload PDF, ChromaDB + Gemini embedding. 🎉 Phase 2 SELESAI | ✅ Selesai | auto |
| 2026-08-10 | feat: Market Recap (W19-20) — news fetcher, sentiment AI, recap harian | ✅ Selesai | auto |
| 2026-08-10 | feat: Midtrans Payment (W17-18) — Snap checkout, webhook SHA512, invoice | ✅ Selesai | auto |
| 2026-08-10 | feat: Subscription & Credits (W15-16) — plans, kredit bulanan, pricing & billing | ✅ Selesai | auto |
| 2026-08-10 | feat: Analisis Emiten (W13-14) — analisis 1 saham + riwayat per-user | ✅ Selesai | auto |
| 2026-08-09-10 | feat: Redis cache · admin panel CRUD · Screener MVP LIVE 🏁 · stock data yfinance · AI Gateway terhubung · design system cosmic · frontend auth · auth module | ✅ Selesai | auto |
| 2026-08-09 | feat: init 4IGeneration v2 monorepo skeleton (web, api, ai-service, admin + prisma + docker + resume) | ✅ Selesai | auto |

---

## 🧰 Referensi Cepat

| Dokumen | Lokasi |
|---|---|
| **Papan tahapan LLM (6 tahap + DoD)** | `docs/BUILD-LLM-TAHAPAN.md` |
| **Panduan pretrain GPU (RunPod)** | `docs/RUNPOD-PRETRAIN.md` |
| **Sinkron ke PC Windows** | `sync-pc.bat` + `docs/SYNC-PC.md` |
| Panduan penggunaan lengkap | `docs/USAGE.md` |
| Blueprint master (20 bagian) | `docs/blueprint/` |
| Roadmap 12 bulan | `docs/roadmap.md` |
| Arsitektur ringkas | `docs/architecture.md` |
| Skema database (32 tabel) | `apps/api/prisma/schema.prisma` |
| Referensi implementasi LLM (WicaraLLM) | `apps/ai-training/references/wicara-llm/` |

---

*Dokumen ini dijaga tetap sinkron dengan pekerjaan aktual. Update lewat `./scripts/resume.sh` atau otomatis per commit.*
