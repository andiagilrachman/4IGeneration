# 📖 PANDUAN PENGGUNAAN LENGKAP — 4IGeneration v2.0

> **Cara pakai / penggunaan seluruh sistem** — dari setup, menjalankan, autentikasi, API, hingga workflow git & backup.
> 📌 Dokumen ini **di-update setiap kali ada pekerjaan selesai** (selalu mencerminkan kondisi terkini).
> Terakhir diperbarui: **2026-08-10**

---

## 📑 Daftar Isi

1. [Ringkasan Sistem](#1-ringkasan-sistem)
2. [Prasyarat](#2-prasyarat)
3. [Setup Pertama Kali](#3-setup-pertama-kali)
4. [Menjalankan Aplikasi](#4-menjalankan-aplikasi)
5. [Autentikasi — Cara Pakai](#5-autentikasi--cara-pakai)
6. [Daftar Endpoint API](#6-daftar-endpoint-api)
7. [Format Respons API](#7-format-respons-api)
8. [Design System Cosmic](#8-design-system-cosmic)
9. [AI Service & API Keys](#9-ai-service--api-keys)
10. [Admin Panel](#10-admin-panel)
11. [Git Workflow & Backup](#11-git-workflow--backup)
12. [Script Utility](#12-script-utility)
13. [Resume Progres Otomatis](#13-resume-progres-otomatis)
14. [Troubleshooting](#14-troubleshooting)
15. [Status Roadmap](#15-status-roadmap)

---

## 1. Ringkasan Sistem

4IGeneration adalah **AI-native platform analisis & screening saham Indonesia** — monorepo dengan 4 aplikasi:

| Aplikasi | Teknologi | Port | Fungsi |
|---|---|---|---|
| `apps/web` | Next.js 14 + Tailwind | **3000** | Frontend pengguna (Cosmic AI Command Center) |
| `apps/api` | NestJS 10 + Prisma | **3001** | REST API backend (prefix `/api/v1`) |
| `apps/ai-service` | FastAPI + Python | **8000** | AI Gateway multi-provider (internal) |
| `apps/admin` | Refine + Ant Design | **3002** | Admin panel (scaffold, diisi Week 7-8) |

**Infrastruktur:** MySQL 8 (database, port 3306) · Redis 7 (cache, port 6379) · Nginx (reverse proxy) · semua via Docker Compose.

```
Browser / API Client
   ↓
 Nginx (reverse proxy)
   ├→ Web (:3000)  →  halaman pengguna
   ├→ API (:3001)  →  REST API (auth, users, dst)
   ├→ Admin (:3002)
   └→ AI Service (:8000)  →  AI Gateway → Gemini/Groq/Mistral/OpenRouter
```

---

## 2. Prasyarat

| Tool | Versi | Catatan |
|---|---|---|
| Node.js | **20 LTS** | `node -v` |
| pnpm | **9+** | `corepack enable` lalu `pnpm -v` |
| Python | **3.11+** | untuk ai-service |
| Docker + Compose | latest | untuk MySQL/Redis (opsional jika pakai DB lokal) |
| Git | latest | |

---

## 3. Setup Pertama Kali

### Langkah 1 — Clone & install dependencies
```bash
git clone https://github.com/andiagilrachman/4IGeneration.git
cd 4IGeneration
corepack enable
pnpm install          # install semua workspace
```

### Langkah 2 — Siapkan environment variables
```bash
cp .env.example .env                         # root (shared: MySQL, Redis, JWT)
cp apps/api/.env.example apps/api/.env       # API (DATABASE_URL, JWT secrets)
cp apps/web/.env.example apps/web/.env.local # Frontend (NEXT_PUBLIC_API_URL)
cp apps/ai-service/.env.example apps/ai-service/.env  # AI keys (opsional)
```

### Langkah 3 — Jalankan database (MySQL + Redis)
```bash
docker compose up -d         # MySQL + Redis saja
# atau full stack: docker compose --profile apps up -d
```

### Langkah 4 — Migrasi database (buat 32 tabel)
```bash
pnpm db:migrate              # = prisma migrate dev (butuh DATABASE_URL di apps/api/.env)
pnpm db:generate             # generate Prisma Client
```

### Langkah 5 — (Opsional) Pasang hook auto-resume
```bash
./scripts/install-hooks.sh
```

---

## 4. Menjalankan Aplikasi

### Development (semua sekaligus)
```bash
pnpm dev                     # Turborepo: web + api + admin sekaligus
cd apps/ai-service && uvicorn app.main:app --reload --port 8000   # AI service
```

### Per-aplikasi
```bash
pnpm --filter @4ig/web dev          # Web   → http://localhost:3000
pnpm --filter @4ig/api dev          # API   → http://localhost:3001/api/v1
pnpm --filter @4ig/admin dev        # Admin → http://localhost:3002
pnpm --filter @4ig/api prisma studio  # GUI database (Prisma Studio)
```

### Production (single VPS — BAGIAN 13 blueprint)
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Verifikasi semua hidup
```bash
curl http://localhost:3001/api/v1/health   # → {"success":true,"data":{"status":"ok",...}}
curl http://localhost:3000/                # → landing page
```

---

## 5. Autentikasi — Cara Pakai

### 5.1 Melalui Web (halaman)

| Halaman | URL | Fungsi |
|---|---|---|
| Landing | `http://localhost:3000/` | Beranda |
| Register | `http://localhost:3000/register` | Daftar akun baru |
| Login | `http://localhost:3000/login` | Masuk |
| Dashboard | `http://localhost:3000/dashboard` | **Terproteksi** — wajib login |

**Alur:** Daftar/Login → token disimpan (localStorage + cookie) → diarahkan ke Dashboard → tombol **Keluar** untuk logout.

> ⚠️ **Proteksi route:** tanpa cookie `4ig_auth`, akses `/dashboard` otomatis di-redirect ke `/login`.

### 5.2 Melalui API (curl / Postman / Thunder Client)

**Register**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@contoh.com","password":"rahasia123","name":"Nama User"}'
```

**Login**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@contoh.com","password":"rahasia123"}'
# → { success, data: { user, accessToken, refreshToken } }
```

**Akses endpoint terproteksi** — pakai header `Authorization: Bearer <accessToken>`
```bash
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOi..."     # → data user
```

**Refresh token** (access token kedaluwarsa 15 menit)
```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'       # → pasangan token baru
```

**Logout** (mencabut session)
```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

### 5.3 Aturan Token (blueprint BAGIAN 12)

| Token | Umur | Dipakai untuk |
|---|---|---|
| accessToken (JWT) | **15 menit** | Header `Authorization: Bearer` pada request terproteksi |
| refreshToken (JWT) | **7 hari** | Mendapat access token baru, di-revoke saat logout |

- Password di-hash **bcrypt cost 12**
- Session disimpan di tabel `sessions` (hash SHA-256 refresh token)
- Saat refresh → session lama di-revoke, session baru dibuat (rotasi)

### 5.4 Verifikasi Email & Reset Password (W21-22 follow-up)

| Halaman | Alur |
|---|---|
| `/verify-email?token=…` | Token dari email → `POST /auth/verify-email` → `emailVerifiedAt` terisi |
| `/forgot-password` | Input email → `POST /auth/forgot-password` → email reset terkirim |
| `/reset-password?token=…` | Password baru → `POST /auth/reset-password` → semua session di-revoke |

- Register otomatis mengirim email verifikasi (fire-and-forget — kegagalan email tidak menggagalkan register).
- Token: acak 32-byte, tersimpan **hash SHA-256** di tabel `email_verifications` / `password_resets`, berlaku **24 jam**.
- Email dikirim via **Resend** (EmailService). ⚠️ Akun Resend *free/testing* hanya bisa kirim ke email pemilik (`andiagylrachman@gmail.com`) & butuh domain terverifikasi untuk penerima lain — di produksi (domain terverifikasi) email jalan ke semua user.

---

## 6. Daftar Endpoint API

> Base URL: `http://localhost:3001/api/v1` (dev) · `https://api.4igeneration.com/v1` (prod, nanti)

### ✅ Sudah berfungsi

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/health` | — | Health check service |
| POST | `/auth/register` | — | Daftar user baru |
| POST | `/auth/login` | — | Login → user + token |
| POST | `/auth/refresh` | — | Rotasi refresh token |
| POST | `/auth/logout` | — | Revoke session |
| GET | `/auth/me` | 🔒 | Data user saat ini |
| POST | `/auth/verify-email` | — | **Verifikasi email** via token (dari email) |
| POST | `/auth/resend-verification` | — | **Kirim ulang** email verifikasi |
| POST | `/auth/forgot-password` | — | **Lupa password** → kirim email reset |
| POST | `/auth/reset-password` | — | **Set password baru** via token |
| GET | `/users/profile` | 🔒 | Profil lengkap user |
| PUT | `/users/profile` | 🔒 | Update profil (name/fullName) |
| GET | `/stocks` | — | Daftar saham IDX likuid (28 saham) |
| GET | `/stocks/:ticker` | — | Data saham nyata (harga, PE, ROE, range 52w, 5 hari) |
| GET | `/stocks/sectors` | — | Daftar sektor unik (dropdown screener) |
| GET | `/plans` | — | Daftar plan (public) — free/starter/pro |
| GET | `/plans/:slug` | — | Detail satu plan |
| GET | `/subscriptions/current` | 🔒 | Subscription aktif + saldo kredit |
| POST | `/subscriptions/subscribe` | 🔒 | Subscribe ke plan (slug) → alokasi kredit bulanan |
| POST | `/subscriptions/cancel` | 🔒 | Batalkan langganan |
| GET | `/credits/balance` | 🔒 | Saldo kredit user |
| GET | `/credits/transactions` | 🔒 | Riwayat transaksi kredit |
| POST | `/payments/create` | 🔒 | Buat transaksi Midtrans Snap (planSlug) → snap token |
| GET | `/payments` | 🔒 | Riwayat pembayaran (+ invoice) |
| GET | `/payments/:id` | 🔒 | Detail pembayaran |
| POST | `/payments/webhook/midtrans` | — | Notifikasi Midtrans (public, signature SHA512 diverifikasi) |
| POST | `/analysis/market-recap` | 🔒 | **Market Recap** — berita + data + AI (tersimpan) |
| GET | `/analysis/market-recap/history` | 🔒 | Riwayat recap user |
| GET | `/analysis/market-recap/:id` | 🔒 | Detail recap |
| POST | `/analysis/screener` | — | **AI-powered screener** (filter fundamental + opsi analisis AI) |
| POST | `/analysis/stock` | 🔒 | Analisis 1 saham (data nyata) + **tersimpan ke riwayat** |
| GET | `/analysis/history` | 🔒 | Riwayat analisis user (terbaru di atas) |
| GET | `/analysis/:id` | 🔒 | Detail satu analisis (hanya milik user) |
| DELETE | `/analysis/:id` | 🔒 | Hapus analisis |
| GET | `/analysis/health` | — | Status module analysis |

**AI Service (internal, prefix `/internal/v1`):**

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/stocks` | Daftar saham IDX (sumber: FastAPI) |
| GET | `/stocks/:ticker` | Data saham mentah (yfinance) |
| POST | `/screen` | **Screener** (kriteria + opsi `analyze`) |
| GET | `/screen/sectors` | Daftar sektor unik |
| POST | `/analyze/stock` | Analisis AI **berbasis data nyata** |
| GET | `/health` · `/providers/status` | Health & status provider |

### ⚡ Cara pakai Screener (fitur pertama 🏁)
1. Buka **http://localhost:3000/screener** (dari dashboard klik **🔍 Screener**)
2. Isi filter: sektor, max P/E, min ROE (%), maks hasil — centang **Analisis AI** untuk rangkuman
3. Klik **🚀 Jalankan** → tabel hasil diurutkan skor kualitas + AI summary
4. Badge **LIVE** = data real-time Yahoo · **DEMO** = fallback saat Yahoo rate-limited

Contoh curl:
```bash
curl -X POST http://localhost:3001/api/v1/analysis/screener \
  -H "Content-Type: application/json" \
  -d '{"min_roe":0.15,"limit":10,"analyze":true}'
```

### 💳 Subscription, Kredit & Payment (W15-18)
- **Pricing page** (public): http://localhost:3000/pricing — free (Rp 0), starter (Rp 99rb/bln), pro (Rp 299rb/bln)
- **Billing page** (login): http://localhost:3000/billing — lihat plan aktif, saldo kredit, riwayat transaksi, **💳 Bayar & Aktifkan** (Midtrans Snap)
- **Kredit**: 1 kredit = 1 analisis saham AI. Subscribe → +kredit bulanan (mis. starter = 100) → analisis menguranginya
- **Seed plan** (jika DB baru): `pnpm --filter @4ig/api seed:plans`

#### Alur pembayaran Midtrans (sandbox, W17-18)
1. Klik **💳 Bayar & Aktifkan** di billing → `POST /payments/create` → dapat snap token
2. Snap popup terbuka (atau klik **Buka Halaman Bayar** bila popup gagal dimuat)
3. Bayar pakai **kartu test sandbox**: `4811 1111 1111 1114` (sukses), OTP `112233`
4. Midtrans kirim webhook → payment **PAID** + subscription **ACTIVE** + kredit masuk + **invoice** dibuat otomatis
5. Konfigurasi: `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY` di `apps/api/.env` (sandbox: `SB-Mid-...`, `MIDTRANS_IS_PRODUCTION=false`)
6. Webhook signature SHA512 diverifikasi (payload palsu → 400)

> ⚠️ Di preview sandbox (iframe tanpa internet), Snap popup tidak bisa dimuat — gunakan tombol **Buka Halaman Bayar** (buka di tab browser). Di VPS/domain produksi, semuanya jalan normal.

### 📰 Market Recap (W19-20)
- Login → buka **http://localhost:3000/market-recap** (dari dashboard klik **📰 Recap**)
- Klik **"Buat Recap Hari Ini"** → AI susun ringkasan pasar (berita Google News real-time + data saham + analisis)
- Hasil tersimpan ke riwayat per user (Lihat untuk membuka kembali)
- Endpoint internal (FastAPI): `GET /news` · `POST /news/sentiment` · `POST /market-recap`
- Sentiment: AI menilai pasar (positif/netral/negatif + skor 1-100)

### 🧠 Cara pakai Analisis Emiten
1. Login → buka **http://localhost:3000/analysis** (dari dashboard klik **🧠 Analisis**)
2. Ketik kode saham (BBCA, BBRI, dst) → klik **Analisis**
3. AI menganalisis **data nyata** (harga, ROE, PE, margin, range 52w) → hasil + data yang dipakai ditampilkan
4. Hasil **otomatis tersimpan ke riwayat** — klik "Lihat" untuk membuka lagi, "Hapus" untuk menghapus
5. Riwayat per-user (butuh login; tanpa login → 401)

### ⏳ Rencana (blueprint BAGIAN 8 — belum dibuat)

- `/stocks/:ticker/prices` · `/fundamentals` · `/news` · `/technicals` (fase lanjut)
- `/analysis/*` lengkap (compare, screener, sentiment, chat, market-recap)
- `/watchlists*`, `/subscriptions*`, `/plans*`, `/payments*`, `/credits*`
- `/api-keys*`, `/usage*`, `/admin/*`, `/playground/*`
- AI Service: `/internal/v1/generate`, `/analyze/sentiment`, `/screen`, `/summarize`

> Seluruh endpoint di atas akan ditambahkan bertahap sesuai roadmap. Lihat `docs/roadmap.md`.

---

## 7. Format Respons API

Semua respons dibungkus **format standar** (blueprint BAGIAN 8) oleh interceptor/filter global.

**Sukses:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-08-10T...", "request_id": "req_..." }
}
```

**Error:**
```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Email tidak valid", "details": [...] },
  "meta": { "timestamp": "...", "request_id": "..." }
}
```

**Kode HTTP umum:** `200` OK · `201` Created · `400` Validasi · `401` Belum login · `403` Dilarang · `404` Tidak ditemukan · `409` Konflik (email terdaftar) · `500` Internal error.

---

## 8. Design System Cosmic

**Tema visual:** "Cosmic AI Command Center" (BAGIAN 5 blueprint) — deep space × AI × holographic.

> 🎨 **v2.1 — Signature Look (2026-08-10):** landing & dashboard di-redesign meniru mockup developer-platform (referensi user): navbar glass sticky + hero + baris statistik (`99.99% Uptime · 20+ Models · 10K+ Developers · 1B+ API Requests`), 4 pilar fitur (NeonCard), demo AI response, CTA + footer. Dashboard kini developer-style: **sidebar** (Overview → Docs) + **stat cards data nyata** dari API (`/credits/balance`, `/api-keys`, `/analysis/history`, `/watchlists`) + **Usage Overview chart** 7 hari + **Recent Activity**.
> **v2.2 (2026-08-10):** sidebar dipindah ke **shared layout** `apps/web/src/app/(dashboard)/layout.tsx` → **SEMUA halaman** di /dashboard-group (Analisis, Screener, Market, Watchlist, Compare, RAG, Recap, API Keys, Billing, Docs) kini memakai sidebar + header konsisten otomatis. Halaman auth baru: `/forgot-password`, `/reset-password`, `/verify-email` (gaya cosmic sama).
> **Admin panel:** dark theme AntD (ConfigProvider darkAlgorithm, primary violet `#7c3aed`) + halaman baru **Plans** (CRUD paket subscription via `/admin/plans`).
> Warna inti tetap: navy `#070b18` + neon ungu `#7c3aed` + biru `#2563eb` + cyan `#22d3ee` — senada dengan mockup (`#0f1020` / `#7c44e7` / `#517cd0`).

### Komponen UI dasar (`apps/web/src/components/ui/`)
| Komponen | Varian | Lokasi |
|---|---|---|
| `Button` | default (cosmic), ghost, outline, link, danger · size sm/md/lg | `ui/button.tsx` |
| `Input` | + label, hint, error | `ui/input.tsx` |
| `Card` | default (elevated), glass (blur), cosmic (glow) | `ui/card.tsx` |

### Komponen Cosmic (`apps/web/src/components/cosmic/`)
| Komponen | Fungsi |
|---|---|
| `NeonCard` | Kartu dengan aksen neon (glow: purple/blue/cyan) + hover lift |
| `StatusOrb` | Indikator status ber-pulse (success/warning/error/info/neutral) |
| `ParticleField` | Background bintang & nebula (CSS murni, nonaktif di mobile) |
| `AIResponseCard` | Pola respons AI: loading (progress) / completed (tokens+actions) / error (fallback) |

### Contoh pemakaian
```tsx
import { NeonCard } from "@/components/cosmic/neon-card";
import { StatusOrb } from "@/components/cosmic/status-orb";

<NeonCard glow="purple" title="AI Stock Analysis" subtitle="...">konten</NeonCard>
<StatusOrb status="success" label="API Online" />
```

### Tier kosmik (sesuai blueprint)
- **Tier 1** Marketing (landing) → full cosmic: ParticleField + NeonCard + AIResponseCard demo
- **Tier 2** Dashboard → balanced cosmic: StatusOrb + NeonCard statistik
- **Tier 3** Working pages (login/register) → minimal cosmic: Card + Input + Button
- **Tier 4** Admin panel → profesional (Refine/AntD, diisi Week 7-8)

### Efek reduksi
- Mobile (<768px): ParticleField mati otomatis (CSS `hidden md:block`)
- `prefers-reduced-motion`: semua animasi dikecilkan (globals.css)

### Cache (Week 10 — Redis)
- Data saham di-cache di **Redis** (`app/services/cache/redis_cache.py`) — TTL 12 jam
- Key pattern: `4ig:stock:<TICKER>`
- **Fallback otomatis ke disk cache** bila Redis mati (resilient)
- Benchmark screener: **cache miss ~6s → cache hit 0.019s (~300×)**
- Config: `REDIS_URL` (default `redis://localhost:6379`), `STOCK_CACHE_TTL_SECONDS`

---

## 9. AI Service & API Keys

**AI Service** (`apps/ai-service`, port 8000) adalah **AI Gateway multi-provider** — titik masuk semua permintaan AI ke provider eksternal, dengan **fallback otomatis** (prinsip *never depend on 1 API*, blueprint BAGIAN 10).

### Provider yang dikonfigurasi saat ini

| Provider | Priority | Weight | Status |
|---|---|---|---|
| **Gemini** (`gemini-flash-latest`) | 1 (primary) | 40% | ✅ Aktif — key valid |
| **OpenRouter** (`openai/gpt-4o-mini`) | 4 (backup) | 5% | ✅ Aktif — key valid |
| Groq / Mistral | 2-3 | 40%/15% | ⏳ Belum (isi key kapan saja) |

> 📌 **Model Gemini:** akun baru tidak bisa pakai `gemini-1.5-flash` / `2.x` — gateway memakai **`gemini-flash-latest`** (alias stabil, sudah teruji).

### Cara isi API key

```bash
cp apps/ai-service/.env.example apps/ai-service/.env
# isi: GEMINI_API_KEY=... · GROQ_API_KEY=... · MISTRAL_API_KEY=... · OPENROUTER_API_KEY=...
```
> ⚠️ `.env` di-gitignore — **tidak akan pernah ter-commit** ke GitHub.

### Endpoint AI Service (prefix `/internal/v1`)

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/health` | Health check + jumlah provider |
| GET | `/providers/status` | Status tiap provider (healthy, hits, avg response) |
| POST | `/analyze/stock` | Analisis 1 saham IDX via AI Gateway (`{"ticker":"BBCA"}`) |
| POST | `/generate` | (rencana) Generasi AI umum |

### Alur fallback (sudah teruji ✅)

```
Request → AIGateway.generate()
  → pilih provider priority terendah yang healthy (Gemini)
  → berhasil? → respons ternormalisasi → balik ke user
  → gagal?   → otomatis coba provider berikutnya (OpenRouter)
  → semua gagal → error 502 dengan pesan jelas
```

**Hasil uji:** Gemini analisis BBCA/TLKM ✅ · saat Gemini dinonaktifkan, OpenRouter otomatis ambil alih analisis BBRI ✅.

### Contoh curl
```bash
# health
curl http://localhost:8000/internal/v1/health

# analisis saham
curl -X POST http://localhost:8000/internal/v1/analyze/stock \
  -H "Content-Type: application/json" \
  -d '{"ticker":"BBCA"}'
```

---

## 10. Admin Panel

**URL:** http://localhost:3002 · **Teknologi:** Vite + React + Ant Design · **Tema:** dark cosmic (ConfigProvider darkAlgorithm, primary `#7c3aed`)

> Catatan: sesuai prinsip blueprint "no hardcode" — provider, model, dan API keys
> dikelola **dari UI admin**, bukan dari kode/env. (Refine.dev dijadwalkan sebagai
> pengganti bertahap; versi ini AntD langsung agar cepat berfungsi.)

### Menu yang tersedia
| Menu | Fungsi |
|---|---|
| Dashboard | Statistik (users, requests, revenue, provider status) |
| AI Providers | CRUD provider (gemini, openrouter, ollama-local) |
| AI Models | CRUD model + alias `4IG-*` + harga |
| Provider Keys | CRUD API key per provider + status aktif |
| Plans | **CRUD paket subscription** (free/starter/pro) — `GET/POST/PUT/DELETE /admin/plans` |
| Konfigurasi | Settings per kategori (general, email, payments, security, notifications, integrations) + secret masking |

## 11. Blog & SEO (W35-36)

| Aset | Lokasi / Detail |
|---|---|
| Halaman daftar | `/blog` — 6 artikel edukasi (SSG) |
| Halaman detail | `/blog/[slug]` — `generateStaticParams` + `generateMetadata` (title, description, keywords, OpenGraph, JSON-LD BlogPosting) |
| Konten | `apps/web/src/lib/blog.ts` (data statis, mudah ditambah) |
| Sitemap | `/sitemap.xml` — halaman statis + semua artikel |
| Robots | `/robots.txt` — disallow area privat (`/dashboard`, `/api-keys`, `/billing`, `/api/`) |
| Metadata global | `layout.tsx` — title template `%s — 4IGeneration`, OG, keywords, robots |
| Link | Navbar & footer landing → `/blog` |

## 12. CI/CD (GitHub Actions)

- Workflow: `.github/workflows/ci.yml` (aktif di branch `main` & `develop`, trigger push/PR).
- Job `ci`: install pnpm → `prisma generate` → **lint** → **typecheck** → **build** (API NestJS + Web Next.js).
- Env CI inline: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `DATABASE_URL` (dev, aman).
- Semua check lokal terverifikasi bersih sebelum workflow diaktifkan.

### Login
| Field | Nilai (seed default) |
|---|---|
| Email | `admin@4igeneration.com` |
| Password | `admin12345` |

**Ubah password:** seed ulang dengan env berbeda, atau ganti di DB. Jangan biarkan default di production!
```bash
# seed ulang admin dengan password baru
cd apps/api && DATABASE_URL="mysql://..." ADMIN_PASSWORD="password-kuat" pnpm seed:admin
```

### Menu & Fitur
| Menu | Fungsi | Endpoint API |
|---|---|---|
| 📊 Dashboard | Statistik: providers, keys, models, users + provider aktif | `GET /admin/dashboard/stats` |
| 🤖 AI Providers | CRUD provider (slug, base URL, priority, weight, timeout) | `/admin/providers*` |
| 🧠 AI Models | CRUD model + alias 4IG-* + harga per 1K token | `/admin/models*` |
| 🔑 Provider Keys | CRUD key pool + status (aktif/nonaktif/cooldown) + limit | `/admin/provider-keys*` |

### Keamanan
- Semua route admin butuh **JWT + role ADMIN/SUPER_ADMIN** (user biasa → `403`)
- Key tersimpan di DB; TODO fase lanjut: enkripsi AES-256 sebelum simpan
- CORS: API mengizinkan origin `:3000` & `:3002` (override via `CORS_ORIGINS`)

### Uji cepat (curl)
```bash
# login admin
curl -X POST localhost:3001/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@4igeneration.com","password":"admin12345"}'
# → simpan accessToken, lalu:
curl localhost:3001/api/v1/admin/providers -H "Authorization: Bearer <TOKEN>"
```

---

## 11. Git Workflow & Backup

> **Prinsip kerja:** setiap pekerjaan selesai → **commit + push ke GitHub langsung** (backup otomatis, sesuai kesepakatan).

### Alur harian
```bash
# 1. Lihat perubahan
git status

# 2. Tandai semua & commit (pesan deskriptif)
git add -A
git commit -m "feat: deskripsi singkat pekerjaan"

# 3. Push ke GitHub
git push
```

### Setup ulang di sesi baru (⚠️ penting)
File `.git/config` (remote & identitas) **tidak ikut tersimpan antar sesi workspace**. Setiap sesi baru, jalankan sekali:
```bash
./scripts/setup-git.sh --remote https://github.com/andiagilrachman/4IGeneration.git
```

### Push butuh token
```bash
GITHUB_TOKEN=ghp_xxx ./scripts/github-push.sh
```
> Token dipakai sekali lalu **dihapus dari config** (tidak tersimpan). Buat token di https://github.com/settings/tokens (classic, scope `repo`) atau fine-grained dengan **Contents: Read and write**.

### Branch strategy
`main` (production) · `develop` · `feature/*` · `fix/*` · `hotfix/*`

### Commit convention
`feat:` `fix:` `docs:` `style:` `refactor:` `test:` `chore:` `perf:`

---

## 9. Script Utility

| Script | Fungsi | Contoh |
|---|---|---|
| `scripts/resume.sh` | Update RESUME.md manual | `./scripts/resume.sh "implementasi X"` |
| `scripts/install-hooks.sh` | Pasang post-commit hook (auto-resume) | `./scripts/install-hooks.sh` |
| `scripts/setup-git.sh` | Set identitas git + remote origin | `./scripts/setup-git.sh --remote <url>` |
| `scripts/github-push.sh` | Push ke GitHub dengan token (aman) | `GITHUB_TOKEN=ghp_x ./scripts/github-push.sh` |

---

## 10. Resume Progres Otomatis

`RESUME.md` di root = **resume resmi proyek** (apa yang dikerjakan, sejauh mana, langkah selanjutnya).

**Cara kerja:**
- **Otomatis:** setelah `scripts/install-hooks.sh` dipasang, setiap `git commit` menambah entri ke tabel log RESUME.md
- **Manual:** `./scripts/resume.sh "deskripsi"` atau `pnpm resume "deskripsi"`

**Cara membaca:** bagian `Log Pekerjaan` (terbaru di atas) · `Progres per Fase` (checklist roadmap) · `Langkah Selanjutnya` (next actions).

---

## 11. Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| API tidak merespons | Server belum jalan | `pnpm --filter @4ig/api dev` |
| `ECONNREFUSED` di port 3306 | MySQL belum jalan | `docker compose up -d` (atau `sudo service mariadb start`) |
| `P1001` Prisma (DB tidak konek) | `DATABASE_URL` salah | Cek `apps/api/.env`, pastikan user/pass benar |
| `P1003` Prisma (tabel tidak ada) | Belum migrasi | `pnpm db:migrate` |
| `/dashboard` redirect terus ke login | Belum login | Daftar/login dulu di web |
| Push ditolak `403` | Token tanpa izin tulis | Buat token dengan scope `repo` / Contents read-write |
| Push ditolak (bukan fast-forward) | Remote punya commit lain | `git pull --rebase` lalu push (atau force jika yakin) |
| Hook tidak jalan (warning ignored) | Bit executable hilang | `chmod +x .git/hooks/post-commit` |
| `node_modules` tidak ada (sesi baru) | Tidak tersimpan antar sesi | `pnpm install` |
| Web `500` saat akses halaman | Compile error | Cek terminal web dev server |

---

## 12. Status Roadmap

| Fase | Bulan | Status |
|---|---|---|
| **Fase 0 — Persiapan repo** | — | ✅ **Selesai** (monorepo, Docker, Prisma, CI, git) |
| **Phase 1 — Foundation** | 1-3 | 🟡 **Berjalan** (Week 1-4) |
| Phase 2 — Monetization | 4-6 | ⏳ Belum |
| Phase 3 — Public API | 7-9 | ⏳ Belum |
| Phase 4 — Own Model | 10-12 | ⏳ Belum |

**Detail checklist per minggu:** lihat `docs/roadmap.md` · **Resume eksekutif:** lihat `RESUME.md`

---

*Dokumen ini hidup — diperbarui setiap ada pekerjaan selesai. Terakhir: 2026-08-10 (Design System Cosmic).*

### 💬 Q&A Laporan Keuangan (RAG — W21-24)
- Login → buka **http://localhost:3000/rag** (dari dashboard klik **💬 Q&A**)
- **Upload PDF** laporan keuangan (maks 20MB) → diproses (pypdf) + dipecah chunk + di-embedding (Gemini) + disimpan ke **ChromaDB**
- **Tanya apa saja** — AI mencari chunk relevan (vector search) lalu menjawab **berdasarkan isi dokumen** (dengan sumber)
- Endpoint: `POST /rag/upload` · `GET /rag/documents` · `POST /rag/ask` · `DELETE /rag/documents/:id` (🔒 login)
- Data vector tersimpan di `.rag_data/` (ter-gitignore)

### 🔑 Public API & API Keys (Phase 3 — W25-28)
- Login → buka **http://localhost:3000/api-keys** → buat API key (nama aplikasi)
- **Key format**: `4IG_<prefix8>_<secret32>` — plain key tampil SEKALI (simpan baik-baik)
- Pakai di header: `X-API-Key: 4IG_...` pada endpoint `/api/v1/public/*`
- **Endpoint public**: `GET /public/stocks` · `GET /public/stocks/:ticker` · `POST /public/analysis/screener` · `POST /public/analysis/stock`
- **Keamanan**: key di-hash bcrypt (prefix 8 char saja yang terlihat) · rate limit 60 req/menit per key (Redis) · usage tercatat (`GET /api-keys/:id/usage`)
- **Kelola**: buat / cabut (revoke) key di halaman API Keys

### 📦 SDK (W31-32)
- **JS/TS SDK** (`packages/sdk-js`) — `new FourIG({ apiKey })` → `client.stocks.list()`, `client.stocks.detail("BBCA")`, `client.analysis.screener()`, `client.analysis.stock()`
- **Python SDK** (`packages/sdk-python`) — `pip install -e packages/sdk-python` → `FourIG(api_key=...)` dengan metode sama
- **Halaman Developer Docs**: `/docs` (login) — quick start, endpoint, contoh curl, keamanan
- Kedua SDK teruji live: list 28 saham, detail BBCA (price 6375, ROE 21.8%), screener

### 📌 Growth Features (W33-34)
- **Watchlist** (`/watchlist`, 🔒): buat watchlist, tambah/hapus saham, kelola per user — `GET/POST /watchlists*`
- **Compare** (`/compare`, 🔒): bandingkan 2-5 saham — tabel metrik (harga, PE, ROE, margin) + **AI summary** — `POST /analysis/compare`
- **Export CSV** (`GET /analysis/export/csv`, 🔒): unduh riwayat analisis sebagai file CSV
- **Public API** juga sudah punya `POST /public/analysis/stock` & screener untuk developer

### 📧 Email (Resend) & ⚙️ Konfigurasi di Admin Panel
- **EmailService** terintegrasi Resend — market recap otomatis dikirim ke email user setelah generate
- **Settings di Admin Panel** (menu "Konfigurasi") — semua konfigurasi dikelola dari UI, tersimpan di DB (tabel `settings`), prinsip *no hardcode*:
  - `GET /admin/settings` · `GET /admin/settings/:category` · `POST /admin/settings/:category` · `DELETE /admin/settings/:category/:key`
  - Kategori: general, email, payments, security, notifications, integrations
  - **Secret** (`isSecret: true`) → nilai disembunyikan saat GET (••••••)
- Konfigurasi Resend: `RESEND_API_KEY` & `RESEND_FROM_EMAIL` di `apps/api/.env`
