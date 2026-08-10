# 🚀 4IGeneration v2.0 — AI Intelligence Platform for Smart Investing

> "Simple AI Infrastructure for Developers" — AI-native platform analisis & screening saham Indonesia.
> Web tools untuk investor retail + Public API untuk developer, fintech, dan sekuritas.

**Status proyek: Phase 1 — Foundation** · [📓 Resume progres](RESUME.md) · [🗺 Roadmap 12 bulan](docs/roadmap.md) · [📘 Blueprint (20 bagian)](docs/blueprint/01-07-bagian-1-sampai-7.md)

---

## 📖 Dokumen Utama

| Dokumen | Lokasi | Isi |
|---|---|---|
| Resume progres (auto-update) | `RESUME.md` | Apa yang dikerjakan · sejauh mana · langkah selanjutnya |
| **Panduan penggunaan lengkap** | **`docs/USAGE.md`** | **Setup, menjalankan, autentikasi, API, git & backup, troubleshooting** |
| Blueprint master | `docs/blueprint/` | 20 bagian lengkap (arsip sumber) |
| Roadmap per minggu | `docs/roadmap.md` | Checklist 12 bulan |
| Arsitektur ringkas | `docs/architecture.md` | Diagram alur & port |
| Skema database | `apps/api/prisma/schema.prisma` | 32 tabel MySQL 8 |

## 🗂 Struktur Monorepo (Turborepo + pnpm)

```
4igeneration/
├── apps/
│   ├── web/          # Next.js 14 (App Router) — Cosmic AI Command Center
│   ├── api/          # NestJS 10 — REST API (prefix /api/v1)
│   ├── ai-service/   # FastAPI — AI Gateway multi-provider
│   └── admin/        # Refine + Ant Design — Admin Panel
├── packages/
│   ├── shared-types/ # Tipe TS bersama
│   ├── constants/    # Konstanta global (provider, port, dll)
│   ├── utils/        # Utilitas (formatIDR, cn, dll)
│   └── tsconfig/     # Base tsconfig
├── docker/           # Nginx + config docker
├── docs/             # Blueprint, roadmap, arsitektur
├── scripts/          # resume.sh, install-hooks.sh, setup-git.sh
└── .github/workflows # CI/CD
```

## 🚀 Quickstart

### Prasyarat
- Node.js **20 LTS** (`.nvmrc`), pnpm 9+ (`corepack enable`)
- Python 3.11+
- Docker + Docker Compose

### 1. Install dependencies
```bash
corepack enable        # aktifkan pnpm (jika belum)
pnpm install           # di root monorepo
```

### 2. Jalankan infrastruktur (MySQL + Redis)
```bash
cp .env.example .env
docker compose up -d   # hanya infra
# full stack (semua app via docker): docker compose --profile apps up -d
```

### 3. Siapkan database (Prisma)
```bash
cp apps/api/.env.example apps/api/.env   # isi DATABASE_URL sesuai .env
pnpm db:migrate                          # buat skema 32 tabel
```

### 4. Jalankan aplikasi (development)
```bash
pnpm dev                # semua app sekaligus (Turborepo)
# atau per-app:
pnpm --filter @4ig/web dev          # http://localhost:3000
pnpm --filter @4ig/api dev          # http://localhost:3001/api/v1
pnpm --filter @4ig/admin dev        # http://localhost:3002
cd apps/ai-service && uvicorn app.main:app --reload --port 8000
```

### 5. Isi AI keys (untuk AI Gateway)
```bash
cp apps/ai-service/.env.example apps/ai-service/.env
# isi GEMINI_API_KEY / GROQ_API_KEY / MISTRAL_API_KEY / OPENROUTER_API_KEY
curl http://localhost:8000/internal/v1/health
```

## 📓 Resume Progres — Cara Update (WAJIB BACA)

Prinsipnya: **setiap pekerjaan langsung update resume.**

**Cara A — Otomatis (recommended):** pasang sekali, maka setiap `git commit` otomatis menambah entri ke `RESUME.md`.
```bash
./scripts/install-hooks.sh
git commit -m "feat: implement auth register"   # → RESUME.md ikut ter-update
```

**Cara B — Manual:**
```bash
./scripts/resume.sh "Implementasi Auth register/login"          # status selesai
./scripts/resume.sh "Integrasi Midtrans" --status "🚧 Dikerjakan"
./scripts/resume.sh "Deskripsi" --commit                        # langsung commit
```

## 🌿 Git Workflow

- **Branches**: `main` (production) · `develop` · `feature/*` · `fix/*` · `hotfix/*` (BAGIAN 14)
- **Commit convention**: `feat:` `fix:` `docs:` `style:` `refactor:` `test:` `chore:` `perf:`
- Contoh: `feat: add stock analysis endpoint`

## ☁️ Menghubungkan ke GitHub

```bash
# 1. Buat repo kosong di GitHub (mis. USER/4igeneration)
# 2. Hubungkan (identitas & remote tidak tersimpan antar sesi → pakai script ini):
./scripts/setup-git.sh --remote https://github.com/USER/4igeneration.git
# 3. Push
git push -u origin main
```
> CI/CD sudah disiapkan di `.github/workflows/ci.yml` (lint → typecheck → build).

## 🔐 Environment Variables

| File | Isi |
|---|---|
| `.env` (root) | Shared: MySQL, Redis, JWT, timezone |
| `apps/api/.env` | DATABASE_URL, REDIS_URL, JWT_SECRET, AI_SERVICE_URL |
| `apps/web/.env.local` | NEXT_PUBLIC_API_URL |
| `apps/ai-service/.env` | GEMINI/GROQ/MISTRAL/OPENROUTER keys |

> **Jangan pernah commit `.env`** — sudah di-ignore. Lihat `.env.example` untuk template.

## 🧭 Roadmap Ringkas

- **Bulan 1-3**: Foundation (setup, auth, design system, AI gateway, admin, **screener MVP**)
- **Bulan 4-6**: Monetization (analisis emiten, subscription, Midtrans, market recap, RAG)
- **Bulan 7-9**: Public API (API keys, developer portal, SDK, growth features)
- **Bulan 10-12**: Own model 4IG-Finance (GPU, fine-tune, launch)

## ⚖️ Legal & Compliance (Ingat dari blueprint)

- Disclaimer edukatif di setiap analisis (bukan rekomendasi beli/jual) — OJK
- UU PDP (data pribadi) + PSE Kominfo + UU ITE — lihat BAGIAN 19

---

*Dibangun mengikuti blueprint 4IGeneration v2.0 · Solo dev edition · Ship 60%, iterate to 100%.*

## 🏆 Phase 4 — Own Model
Panduan lengkap: [docs/PHASE4-OWN-MODEL.md](docs/PHASE4-OWN-MODEL.md) — provider Ollama sudah siap
di AI Gateway (aktif saat `OLLAMA_BASE_URL` diisi), plus script persiapan dataset fine-tune.
