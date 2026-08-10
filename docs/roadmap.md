# 🗺 Roadmap 12 Bulan — 4IGeneration v2.0

> Checklist eksekusi dari BAGIAN 15 blueprint. Centang saat selesai, dan update `RESUME.md` setiap kali bekerja.

## 🔴 PHASE 1: FOUNDATION (Bulan 1-3) — target: Screener LIVE

### Bulan 1 — Setup & Core Infrastructure
- [ ] **W1** Setup tools & environment (Node 20, pnpm, Docker, VS Code)
- [ ] **W1** Monorepo Turborepo ✅ *(scaffold sudah dibuat)*
- [ ] **W1** GitHub repository + remote origin
- [ ] **W1** Docker Compose berjalan (MySQL + Redis)
- [ ] **W2** Prisma & MySQL schema ✅ *(schema awal sudah dibuat + migrasi init sukses: 32 tabel)*
- [ ] **W2** NestJS project ✅ *(scaffold sudah dibuat)*
- [x] **W2** Auth module (register/login) + JWT ✅ *(register, login, refresh, logout, me — teruji end-to-end)*
- [x] **W2** Users module ✅ *(GET/PUT profile — teruji)*
- [ ] **W3** Next.js + TypeScript ✅ *(scaffold sudah dibuat)*
- [ ] **W3** Tailwind + shadcn/ui ✅ *(Tailwind + design tokens cosmic sudah)*
- [x] **W3** Auth pages (login/register/forgot) ✅ *(login + register terhubung API + proteksi route middleware)*
- [x] **W3** Dashboard skeleton ✅ *(menampilkan user asli + logout)*
- [ ] **W4** Cosmic color system ✅ *(tokens sudah di globals.css/tailwind)*
- [x] **W4** Cosmic components (NeonCard, StatusOrb, ParticleField, AIResponseCard, Button/Input/Card) ✅ *(komponen siap & dipakai)*
- [x] **W4** Landing page basic ✅ *(hero + fitur + demo AI response, full cosmic)*
- [ ] **W4** Testing & refinement

### Bulan 2 — AI Gateway & Admin Panel
- [ ] **W5** FastAPI project ✅ *(scaffold sudah dibuat)*
- [x] **W5** AI Gateway (provider abstraction + fallback + circuit breaker) ✅ *(teruji: Gemini primary, OpenRouter fallback)*
- [x] **W5** Test dengan provider nyata ✅ *(Gemini + OpenRouter terhubung & teruji)*
- [x] **W6** Health check endpoints ✅ *(/internal/v1/health + /providers/status)*
- [x] **W7** Admin panel setup ✅ *(Vite+AntD — login, layout, menu)*
- [x] **W7** Providers CRUD + provider keys CRUD ✅ *(via API admin + UI)*
- [x] **W8** Models CRUD + dashboard ✅ *(model + alias 4IG-* + harga; stats)*
- [ ] **W8** Settings management *(fase lanjut: settings, feature-flags, prompts)*
- [ ] **W8** Migrasi Refine.dev *(rencana — versi kini AntD langsung agar cepat)*

### Bulan 3 — MVP Feature A: Stock Screener
- [x] **W9** Stock data fetcher (yfinance) ✅ *(fetcher.py — profil + harga nyata, teruji BBCA/TLKM)*
- [x] **W9** Import IDX stock list ✅ *(28 saham likuid via FastAPI /stocks)*
- [x] **W10** Cache strategy (Redis) ✅ *(Redis + fallback disk, TTL 12 jam, cache hit 0.019s)*
- [x] **W10** Stock data API endpoints ✅ *(NestJS /stocks + FastAPI internal, analisis AI berbasis data nyata)*
- [x] **W11** Prompt template screening ✅ *(prompt AI summary top picks)*
- [x] **W11** Screener UI (form + results) ✅ *(halaman /screener — filter, tabel, AI summary)*
- [x] **W12** AI Gateway integration + filter logic ✅ *(data-driven filter + skor kualitas + AI)*
- [x] **W12** Testing & polish ✅ *(teruji end-to-end: 28 saham, data live + demo fallback)*

> 🏁 **MILESTONE: First feature LIVE! 🎉**

## 🟡 PHASE 2: MONETIZATION (Bulan 4-6)

- [x] **W13-14** Analisis Emiten (prompt, UI, fundamentals, history) ✅ *(halaman /analysis — analisis data nyata + riwayat per-user)*
- [x] **W15-16** Subscription system (plans CRUD, credits, usage tracking) ✅ *(subscribe/cancel/current + kredit bulanan + potong kredit per analisis + pricing & billing page + admin plans CRUD)*
- [x] **W17-18** Payment Midtrans (checkout Snap, webhook signature, invoice, aktivasi otomatis) ✅ *(sandbox: snap token valid, webhook settlement teruji, signature palsu ditolak)*
- [x] **W19-20** Market Recap (news fetcher Google News, sentiment AI, recap harian, riwayat per-user) ✅ *(email via Resend menyusul — butuh API key)*
- [x] **W19-20 follow-up** Email verifikasi + reset password ✅ *(POST /auth/verify-email · resend-verification · forgot-password · reset-password; token SHA-256 24 jam; email Resend — testing mode hanya ke email pemilik, produksi perlu domain terverifikasi)*
- [x] **W21-22** RAG (ChromaDB, PDF processing via pypdf, Gemini embedding) ✅ *(teruji: upload PDF → tanya → jawab dari dokumen)*
- [x] **W23-24** Chat UI (upload PDF + tanya jawab, sumber jawaban) ✅ *(halaman /rag)*

> 🎉 **MILESTONE: Phase 2 — Monetization SELESAI!** (Analisis, Subscription, Payment Midtrans, Market Recap, RAG Q&A)

> 🏁 **MILESTONE: 4 features LIVE + Monetization ready!**

## 🟢 PHASE 3: PUBLIC API (Bulan 7-9)

- [x] **W25-26** API key system (generation 4IG_*, bcrypt hash, rate limit Redis, usage tracking) ✅ *(teruji: 401 tanpa key, usage tercatat)*
- [x] **W27-28** Developer portal (halaman /docs — quick start, endpoint, contoh curl) ✅
- [x] **W31-32** SDK JS + Python ✅ *(keduanya teruji live: list saham, detail BBCA, screener)*
- [ ] **W29-30** Public endpoints standar (format, error, versioning)
- [ ] **W31-32** SDK JS + Python, Postman collection
- [x] **W33-34** Watchlist & alerts + Comparison tools + Export data ✅ *(watchlist CRUD, compare 2-5 saham + AI, export CSV)*

> 🏆 **MILESTONE: Phase 3 — Public API SELESAI!** (API key, SDK JS+Python, Docs, Growth features)
- [ ] **W35-36** Marketing site (landing, blog CMS, SEO)

> 🏁 **MILESTONE: Public API LIVE + Growth features!**

## 🏆 PHASE 4: SCALE & OWN MODEL (Bulan 10-12)

- [x] **W37-38** Infrastruktur model lokal siap ✅ *(provider Ollama di gateway, config env, health status) — GPU server & deploy menyusul*
- [ ] **W39-40** Integrasi model lokal ke gateway + A/B testing
- [x] **W41-42** Script persiapan dataset fine-tune ✅ *(format Alpaca JSONL, data saham nyata) — generate saat GPU siap*
- [ ] **W43-44** Fine-tune (QLoRA) + eval + deploy
- [ ] **W45-46** Launch 4IG-Finance + marketing
- [ ] **W47-48** Year-end review + roadmap Year 2

> 🎉 **MILESTONE: Own model LIVE!**

---

*Target bisnis: Y1 5K users/$5K MRR · Y2 20K/$20K · Y3 100K/$100K (BAGIAN 1).*
