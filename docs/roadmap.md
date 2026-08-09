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
- [ ] **W4** Cosmic components (NeonCard, StatusOrb, dst)
- [ ] **W4** Landing page basic
- [ ] **W4** Testing & refinement

### Bulan 2 — AI Gateway & Admin Panel
- [ ] **W5** FastAPI project ✅ *(scaffold sudah dibuat)*
- [ ] **W5** AI Gateway LiteLLM (provider abstraction + fallback) ✅ *(skeleton dasar sudah)*
- [ ] **W5** Test dengan Gemini + Groq
- [ ] **W6** Health check endpoints ✅ *(sudah ada /internal/v1/health)*
- [ ] **W7** Refine.dev setup ✅ *(scaffold sudah dibuat)*
- [ ] **W7** Providers CRUD + provider keys CRUD
- [ ] **W8** Models CRUD + settings management
- [ ] **W8** Basic dashboard admin

### Bulan 3 — MVP Feature A: Stock Screener
- [ ] **W9** Stock data fetcher (yfinance)
- [ ] **W9** Import IDX stock list
- [ ] **W10** Cache strategy (Redis)
- [ ] **W10** Stock data API endpoints
- [ ] **W11** Prompt template screening
- [ ] **W11** Screener UI (form + results)
- [ ] **W12** AI Gateway integration + filter logic
- [ ] **W12** Testing & polish

> 🏁 **MILESTONE: First feature LIVE!**

## 🟡 PHASE 2: MONETIZATION (Bulan 4-6)

- [ ] **W13-14** Analisis Emiten (prompt, UI, fundamentals, history)
- [ ] **W15-16** Subscription system (plans CRUD, credits, usage tracking)
- [ ] **W17-18** Payment Midtrans (checkout, callback, invoice, webhooks)
- [ ] **W19-20** Market Recap (news fetcher, sentiment, email)
- [ ] **W21-22** RAG (ChromaDB, PDF processing, embeddings)
- [ ] **W23-24** Chat UI (streaming, context, upload)

> 🏁 **MILESTONE: 4 features LIVE + Monetization ready!**

## 🟢 PHASE 3: PUBLIC API (Bulan 7-9)

- [ ] **W25-26** API key system (generation, scopes, rate limit, usage)
- [ ] **W27-28** Developer portal (docs, playground, examples, SDK plan)
- [ ] **W29-30** Public endpoints standar (format, error, versioning)
- [ ] **W31-32** SDK JS + Python, Postman collection
- [ ] **W33-34** Portfolio, watchlist & alerts, comparison, export
- [ ] **W35-36** Marketing site (landing, blog CMS, SEO)

> 🏁 **MILESTONE: Public API LIVE + Growth features!**

## 🏆 PHASE 4: SCALE & OWN MODEL (Bulan 10-12)

- [ ] **W37-38** GPU server + Ollama/vLLM + Llama 3 8B benchmark
- [ ] **W39-40** Integrasi model lokal ke gateway + A/B testing
- [ ] **W41-42** Dataset finansial + cleaning + format training
- [ ] **W43-44** Fine-tune (QLoRA) + eval + deploy
- [ ] **W45-46** Launch 4IG-Finance + marketing
- [ ] **W47-48** Year-end review + roadmap Year 2

> 🎉 **MILESTONE: Own model LIVE!**

---

*Target bisnis: Y1 5K users/$5K MRR · Y2 20K/$20K · Y3 100K/$100K (BAGIAN 1).*
