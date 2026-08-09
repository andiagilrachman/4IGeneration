# 📘 BLUEPRINT LENGKAP 4IGeneration v2.0

> AI Intelligence Platform for Smart Investing
> Complete Master Document — Solo Dev Edition
> Version: 2.0 Final — Status: Approved & Ready to Execute

## 📑 DAFTAR ISI

| Bagian | Judul |
|---|---|
| 1 | Executive Summary & Vision |
| 2 | Product Identity & Branding |
| 3 | Tech Stack Final |
| 4 | System Architecture |
| 5 | UI/UX Design System (Cosmic AI Command Center) |
| 6 | Struktur Project Monorepo Lengkap |
| 7 | Database Schema (MySQL + Prisma) |
| 8 | API Endpoints Design |
| 9 | Admin Panel Structure |
| 10 | AI Gateway & Multi-Provider Flow |
| 11 | Third-Party Services & Dependencies |
| 12 | Security Architecture |
| 13 | Deployment Strategy |
| 14 | Development Environment |
| 15 | Roadmap 12 Bulan (Detail per Minggu) |
| 16 | Cost Estimation |
| 17 | Launch Strategy |
| 18 | Success Metrics |
| 19 | Legal & Compliance |
| 20 | Emergency Playbook |

---

# 🎯 BAGIAN 1: EXECUTIVE SUMMARY & VISION

## Product Vision

4IGeneration adalah AI-native platform untuk analisis dan screening saham, dimulai dari Indonesia. Menyediakan Web Tools untuk investor retail + Public API untuk developer, fintech, dan sekuritas. Infrastruktur dirancang bisa evolve dari API pihak ketiga menuju model AI proprietary sendiri, tanpa perlu bongkar platform.

## Mission

- Democratize AI-powered stock analysis untuk investor Indonesia
- Bangun AI infrastructure yang scalable dan self-sustainable
- Jadi API provider #1 untuk analisis finansial di Asia Tenggara
- Membangun proprietary financial LLM untuk pasar Indonesia

## Core Values (The 4I)

- 🧠 **Intelligence** — AI cerdas berbasis data akurat
- 💡 **Insight** — Actionable insights, bukan sekadar data mentah
- 💰 **Investment** — Fokus value investing untuk long-term wealth
- 🚀 **Innovation** — Terus berinovasi dengan teknologi terbaru

## Target Audience

**Primary (B2C - Web Platform)**
- Retail investor Indonesia (pemula & menengah)
- Trader aktif harian & swing trader
- Komunitas saham Indonesia
- Financial content creators

**Secondary (B2B - API Platform)**
- Website finansial & media saham
- Fintech startup Indonesia
- Sekuritas & broker
- Developer indie building finance apps

## Unique Value Proposition

> "AI-Powered Stock Intelligence yang paham konteks pasar Indonesia, dengan API yang mudah diintegrasi dan harga yang terjangkau."

## Business Model

- **Freemium**: Free tier terbatas untuk trial
- **Subscription**: Retail investor (Rp 99K - 999K/bulan)
- **API Pay-as-you-go**: Untuk developer
- **Enterprise Custom**: Untuk fintech/sekuritas
- **White-label** (future): Untuk institusi besar

## Success Definition

- **Year 1**: 5,000 users, $5K MRR
- **Year 2**: 20,000 users, $20K MRR
- **Year 3**: 100,000 users, punya model sendiri, $100K MRR

---

# 🎨 BAGIAN 2: PRODUCT IDENTITY & BRANDING

## Naming Convention

| Item | Nama |
|---|---|
| Product Name | 4I_Generation |
| Short Name | 4IG |
| Display Name | 4IGeneration |
| Domain | 4igeneration.com |
| API Product | 4I API |
| Model Family | 4IG-Small (fast, efficient, free tier) · 4IG-Medium (balanced) · 4IG-Pro (advanced, future) · 4IG-Finance (specialized financial, future) |
| Environments | 4I Playground (interactive AI testing) · 4I Lab (ML experiments) · 4I Docs (documentation) · 4I Universe (community) |

## Tagline

- **Primary**: "Simple AI Infrastructure for Developers"
- **Alternative**: "Intelligence for the Next Generation"

## Brand Personality

- 🚀 Futuristic — Ahead of the curve
- 💜 Sophisticated — Premium quality
- 🎯 Trustworthy — Data-driven & transparent
- 🌍 Global-ready — Built for scale
- 💡 Educational — Empower users

## Visual Identity Theme

**"Cosmic AI Command Center"** — Deep Space × Artificial Intelligence × Holographic Technology × Command Center Aesthetic

---

# 🏗 BAGIAN 3: TECH STACK FINAL

## Frontend Stack

| Layer | Pilihan |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5+ |
| Styling | Tailwind CSS + Shadcn/ui |
| State Manager | Zustand |
| Data Fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion + GSAP |
| 3D Graphics | React Three Fiber + Drei + Spline |
| Charts | Recharts + Lightweight Charts |
| Icons | Lucide React |
| UI Primitives | Radix UI (via Shadcn) |
| Notifications | Sonner |

## Backend Stack

| Layer | Pilihan |
|---|---|
| Framework | NestJS 10+ |
| Language | TypeScript 5+ |
| ORM | Prisma |
| Database | MySQL 8.0 |
| Cache | Redis 7 |
| Queue | BullMQ |
| Authentication | Passport.js + JWT |
| Validation | class-validator + Zod |
| API Docs | Swagger / OpenAPI |
| File Upload | Multer |
| Email | Nodemailer + Resend API |

## AI Service Stack

| Layer | Pilihan |
|---|---|
| Framework | FastAPI |
| Language | Python 3.11+ |
| AI Framework | LangChain + LiteLLM |
| Vector DB | ChromaDB (later Qdrant) |
| Data Processing | Pandas, NumPy |
| Stock Data | yfinance, requests, beautifulsoup4 |
| Async | asyncio, httpx, aiohttp |
| Model Serving | Transformers, PyTorch (phase 4) |

## Admin Panel Stack

- Framework: Refine.dev
- Language: TypeScript
- UI Library: Ant Design (built-in Refine)

## Infrastructure Stack

| Layer | Pilihan |
|---|---|
| Container | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| SSL | Let's Encrypt (Certbot) |
| CDN | Cloudflare |
| Storage | Local → Cloudflare R2 |
| Monitoring | Uptime Robot + Sentry + Umami |

## DevOps Tools

| Tool | Pilihan |
|---|---|
| Version Control | Git + GitHub |
| Package Manager | pnpm |
| Monorepo Tool | Turborepo |
| CI/CD | GitHub Actions |
| IDE | VS Code |
| API Testing | Thunder Client / Postman |
| DB GUI | DBeaver / TablePlus |
| Redis GUI | RedisInsight |

---

# 🏛 BAGIAN 4: SYSTEM ARCHITECTURE

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                          END USERS                              │
│  Retail Investor • Trader • Developer • Fintech • Sekuritas    │
└─────────────────────┬──────────────────┬───────────────────────┘
                      │                  │
              ┌───────▼──────┐    ┌──────▼──────┐
              │   BROWSER    │    │  API CLIENT  │
              └───────┬──────┘    └──────┬──────┘
                      │                  │
                      └────────┬─────────┘
                               │
                        ┌──────▼──────┐
                        │  CLOUDFLARE │
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │    NGINX    │
                        └──────┬──────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼─────┐         ┌──────▼──────┐        ┌─────▼─────┐
   │ NEXT.JS  │         │   NESTJS    │        │  REFINE   │
   │ Frontend │         │   API       │        │  Admin    │
   │  :3000   │         │   :3001     │        │  :3002    │
   └────┬─────┘         └──────┬──────┘        └─────┬─────┘
        │                      │                     │
        └──────────────────────┼─────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
  ┌──────────┐          ┌──────────┐          ┌─────────────┐
  │  MYSQL   │          │  REDIS   │          │ AI SERVICE  │
  │  :3306   │          │  :6379   │          │  (FastAPI)  │
  │          │          │          │          │   :8000     │
  └──────────┘          └──────────┘          └──────┬──────┘
                                                     │
                        ┌────────────────────────────┼──────────────────┐
                        ▼                            ▼                  ▼
                  ┌──────────┐               ┌──────────┐        ┌──────────┐
                  │  GEMINI  │               │   GROQ   │        │ MISTRAL  │
                  └──────────┘               └──────────┘        └──────────┘
                                                     │
                                              (Phase 4: Own Model)
```

## Service Communication Flow

```
User Request
    ↓
Frontend (Next.js)
    ↓
API Backend (NestJS)
    ├→ MySQL (data)
    ├→ Redis (cache)
    └→ AI Service (FastAPI)
           ↓
       AI Gateway
           ↓
       Provider Router (fallback logic)
           ↓
       External Provider (Gemini/Groq/etc)
           ↓
       Response back to user
```

## Deployment Topology

**Phase 1-2: Single VPS**

```
VPS ($20-40/month)
└── Docker Compose
    ├── Frontend (Next.js)
    ├── Backend (NestJS)
    ├── AI Service (FastAPI)
    ├── Admin Panel (Refine)
    ├── MySQL
    ├── Redis
    └── Nginx
```

**Phase 3-4: Multi-Server**

```
Vercel (Frontend)
    → VPS 1 (Backend + DB)
        → VPS 2 (AI Service)
            → GPU Server (Own Model)
```

---

# 🎨 BAGIAN 5: UI/UX DESIGN SYSTEM — "Cosmic AI Command Center"

## Design Philosophy — Tiered Design

| Tier | Halaman | Pendekatan |
|---|---|---|
| Tier 1 | Marketing Pages | FULL Cosmic Effect (WOW factor) |
| Tier 2 | Dashboard Overview | BALANCED Cosmic (immersive) |
| Tier 3 | Working Pages | MINIMAL Cosmic (focus on data) |
| Tier 4 | Admin Panel | PROFESSIONAL (productivity) |

## Animation Hierarchy (4 Layers)

| Layer | Elemen | Kecepatan |
|---|---|---|
| Layer 1 | Background | Very Slow (60-120s cycles) |
| Layer 2 | Middle Layer | Medium (particle drift) |
| Layer 3 | UI Elements | Static (only entrance) |
| Layer 4 | Micro-interact | Fast (150-500ms) |

## Color System

**Background**

```css
--bg-deep         : #03030A  /* Deep space black */
--bg-base         : #070B18  /* Space navy */
--bg-elevated     : #0F1424  /* Card background */
--bg-glass        : rgba(15, 20, 36, 0.6)
--bg-glass-heavy  : rgba(15, 20, 36, 0.8)
```

**Brand Colors**

```css
--primary         : #7C3AED  /* Cosmic Purple */
--primary-hover   : #8B5CF6
--primary-active  : #6D28D9
--primary-glow    : rgba(124, 58, 237, 0.4)
--secondary       : #2563EB  /* Electric Blue */
--secondary-hover : #3B82F6
--secondary-glow  : rgba(37, 99, 235, 0.4)
--accent          : #22D3EE  /* Cyan neon */
--accent-glow     : rgba(34, 211, 238, 0.4)
--highlight       : #A78BFA  /* Light purple */
```

**Text Colors**

```css
--text-primary    : #F8FAFC
--text-secondary  : #CBD5E1
--text-muted      : #94A3B8
--text-disabled   : #475569
```

**Semantic Colors**

```css
--success         : #10B981
--warning         : #F59E0B
--error           : #EF4444
--info            : #3B82F6
```

**Stock-Specific Colors**

```css
--bullish         : #22C55E  /* Naik */
--bearish         : #EF4444  /* Turun */
--neutral         : #94A3B8  /* Sideways */
```

**Color Usage Rules**: 80% dark space (backgrounds) · 15% purple/blue (primary elements) · 5% bright neon (accents & highlights)

## Typography System

**Font Stack**

```css
--font-primary  : 'Inter', -apple-system, sans-serif
--font-display  : 'Space Grotesk', 'Inter', sans-serif
--font-mono     : 'JetBrains Mono', 'Fira Code', monospace
```

**Font Sizes**

```css
--text-xs 12px · --text-sm 14px · --text-base 16px · --text-lg 18px · --text-xl 20px
--text-2xl 24px · --text-3xl 30px · --text-4xl 36px · --text-5xl 48px
--text-6xl 60px · --text-7xl 72px
```

**Font Weights**: 400 normal · 500 medium · 600 semibold · 700 bold · 800 extrabold

## Spacing System

```css
--space-xs 4px · --space-sm 8px · --space-md 16px · --space-lg 24px
--space-xl 32px · --space-2xl 48px · --space-3xl 64px · --space-4xl 96px
```

## Border Radius

```css
--radius-sm 6px · --radius-md 8px · --radius-lg 12px · --radius-xl 16px
--radius-2xl 24px · --radius-full 9999px
```

## Shadows & Glow Effects

```css
--shadow-sm 0 1px 2px rgba(0,0,0,0.3) · --shadow-md 0 4px 12px rgba(0,0,0,0.4)
--shadow-lg 0 8px 24px rgba(0,0,0,0.5) · --shadow-xl 0 12px 32px rgba(0,0,0,0.6)
--glow-purple 0 0 20px rgba(124,58,237,0.5) · --glow-blue 0 0 20px rgba(37,99,235,0.5)
--glow-cyan 0 0 20px rgba(34,211,238,0.5) · --glow-lg 0 0 40px rgba(124,58,237,0.6)
```

## Component Library

**Base Components (Shadcn/ui)**: Button (default, cosmic, ghost, outline, link) · Card (default, glass, elevated, cosmic) · Input, Select, Combobox · Dialog, Sheet, Drawer · Toast, Alert · Tabs, Accordion · Table, DataTable · Avatar, Badge, Chip · Skeleton, Progress · Slider, Switch

**Custom Cosmic Components**: CosmicHero · NeonCard · HolographicPanel · CommandCenter · NeuralIndicator · DataMatrix · StatusOrb · ParticleField · OrbitalRing · SpaceBackground · StockCard · AIResponseCard · GalaxyChart · ModelSelector

## Responsive Breakpoints

```css
--screen-sm 640px · --screen-md 768px · --screen-lg 1024px · --screen-xl 1280px · --screen-2xl 1536px
```

## Effect Reduction Strategy

- **Mobile (<768px)**: ❌ 3D disabled · ❌ particles disabled · ✅ minimal animations only
- **Tablet (768-1024px)**: ✅ 3D low quality · ✅ particles 30-50% · ✅ standard animations
- **Desktop (>1024px)**: ✅ full 3D · ✅ full particles · ✅ all animations
- User Preference: toggle "Performance Mode" di settings + auto-detect `prefers-reduced-motion`

## AI Response Design Pattern

**Loading State**

```
┌─────────────────────────────────────┐
│  ◉ 4IG-SMALL                        │
│  Neural Core Active                 │
│                                     │
│  ▪ Fetching stock data...           │
│  ▪ Analyzing fundamentals...        │
│  ▪ Generating insights...           │
│                                     │
│  ████████████░░░░ 74%              │
│  ⏱  Est. 2s remaining               │
└─────────────────────────────────────┘
```

**Completed State**

```
┌─────────────────────────────────────┐
│  ◉ 4IG-SMALL      ✓ Complete       │
│  428 tokens • 1.2s response time    │
├─────────────────────────────────────┤
│  [Analysis Content Here]            │
│  [Copy] [Regenerate] [Share] [Save] │
└─────────────────────────────────────┘
```

**Error State**

```
┌─────────────────────────────────────┐
│  ⚠ 4IG-SMALL      ✗ Failed         │
│  Provider timeout, retrying...      │
├─────────────────────────────────────┤
│  Trying next provider (Groq)...     │
│  [Cancel] [Retry Now]               │
└─────────────────────────────────────┘
```

## 3D Assets Strategy (Hybrid)

1. **Spline** (untuk hero 3D objects): spacecraft, planet, space station — via `@splinetool/react-spline`
2. **React Three Fiber** (untuk background): star field, nebula, particles
3. **Static Images** (mobile fallback): pre-rendered WebP backgrounds

---

# 📁 BAGIAN 6: STRUKTUR PROJECT MONOREPO

## Root Directory

```
📁 4igeneration/
├── 📁 apps/                              # Aplikasi utama
│   ├── 📁 web/                           # Next.js Frontend
│   ├── 📁 admin/                         # Refine Admin Panel
│   ├── 📁 api/                           # NestJS Backend
│   └── 📁 ai-service/                    # FastAPI AI Service
│
├── 📁 packages/                          # Shared packages
│   ├── 📁 shared-types/
│   ├── 📁 ui-components/
│   ├── 📁 utils/
│   ├── 📁 constants/
│   ├── 📁 config/
│   └── 📁 tsconfig/
│
├── 📁 docker/                            # Docker configs
├── 📁 docs/                              # Documentation
├── 📁 scripts/                           # Utility scripts
├── 📁 .github/                           # GitHub Actions
├── 📁 .vscode/                           # VS Code settings
│
├── 📄 docker-compose.yml
├── 📄 docker-compose.prod.yml
├── 📄 turbo.json
├── 📄 package.json
├── 📄 pnpm-workspace.yaml
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 .prettierrc
├── 📄 .eslintrc.json
├── 📄 README.md
└── 📄 LICENSE
```

## Detail apps/web/ (Next.js Frontend)

```
📁 apps/web/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 (public)/            # Public routes
│   │   │   ├── page.tsx            # /
│   │   │   ├── pricing/
│   │   │   ├── docs/
│   │   │   ├── about/
│   │   │   ├── blog/
│   │   │   └── legal/
│   │   ├── 📁 (auth)/              # Auth routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── 📁 (dashboard)/         # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── analysis/
│   │   │   ├── screener/
│   │   │   ├── market/
│   │   │   ├── playground/
│   │   │   ├── watchlist/
│   │   │   ├── api-keys/
│   │   │   ├── usage/
│   │   │   ├── billing/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── 📁 components/
│   │   ├── ui/                     # Shadcn base
│   │   ├── cosmic/                 # Cosmic themed
│   │   ├── layout/                 # Layout components
│   │   ├── features/               # Feature-specific
│   │   ├── shared/                 # Shared
│   │   └── providers/              # Context providers
│   │
│   ├── 📁 lib/                     # Utilities
│   ├── 📁 hooks/                   # Custom hooks
│   ├── 📁 store/                   # Zustand stores
│   ├── 📁 types/                   # TypeScript types
│   ├── 📁 styles/                  # Additional styles
│   └── 📁 config/                  # App config
│
├── 📁 public/
│   ├── images/
│   ├── icons/
│   ├── 3d/
│   ├── fonts/
│   └── favicon.ico
│
├── 📄 next.config.js
├── 📄 tailwind.config.ts
├── 📄 tsconfig.json
├── 📄 package.json
└── 📄 middleware.ts
```

## Detail apps/api/ (NestJS Backend)

```
📁 apps/api/
├── 📁 src/
│   ├── 📁 modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── subscriptions/
│   │   ├── plans/
│   │   ├── payments/
│   │   ├── credits/
│   │   ├── api-keys/
│   │   ├── providers/
│   │   ├── provider-keys/
│   │   ├── models/
│   │   ├── stocks/
│   │   ├── analysis/
│   │   ├── usage/
│   │   ├── settings/
│   │   ├── prompts/
│   │   ├── audit/
│   │   ├── notifications/
│   │   ├── email/
│   │   └── admin/
│   │
│   ├── 📁 common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── middleware/
│   │   └── pipes/
│   │
│   ├── 📁 config/
│   ├── 📁 database/
│   ├── 📁 queues/
│   ├── 📁 services/
│   ├── 📁 utils/
│   ├── 📁 types/
│   │
│   ├── 📄 app.module.ts
│   ├── 📄 app.controller.ts
│   └── 📄 main.ts
│
├── 📁 prisma/
│   └── 📄 schema.prisma
│
├── 📁 test/
├── 📄 nest-cli.json
├── 📄 tsconfig.json
└── 📄 package.json
```

## Detail apps/ai-service/ (FastAPI Python)

```
📁 apps/ai-service/
├── 📁 app/
│   ├── 📁 api/v1/
│   │   ├── analysis.py
│   │   ├── screener.py
│   │   ├── sentiment.py
│   │   ├── chat.py
│   │   └── health.py
│   │
│   ├── 📁 core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   │
│   ├── 📁 services/
│   │   ├── ai/
│   │   │   ├── gateway.py
│   │   │   ├── router.py
│   │   │   ├── fallback.py
│   │   │   └── providers/
│   │   ├── stock/
│   │   ├── news/
│   │   └── prompts/
│   │
│   ├── 📁 models/                  # Pydantic models
│   ├── 📁 utils/
│   ├── 📁 middleware/
│   └── 📄 main.py
│
├── 📁 tests/
├── 📄 requirements.txt
├── 📄 Dockerfile
└── 📄 .env.example
```

## Detail apps/admin/ (Refine)

```
📁 apps/admin/
├── 📁 src/
│   ├── 📁 pages/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── plans/
│   │   ├── subscriptions/
│   │   ├── payments/
│   │   ├── providers/
│   │   ├── provider-keys/
│   │   ├── models/
│   │   ├── stocks/
│   │   ├── api-keys/
│   │   ├── usage/
│   │   ├── settings/
│   │   ├── prompts/
│   │   ├── content/
│   │   ├── emails/
│   │   ├── feature-flags/
│   │   └── audit-logs/
│   │
│   ├── 📁 components/
│   ├── 📁 providers/
│   ├── 📁 utils/
│   ├── 📁 types/
│   ├── 📄 App.tsx
│   └── 📄 main.tsx
│
├── 📁 public/
├── 📄 package.json
└── 📄 vite.config.ts
```

---

# 🗄 BAGIAN 7: DATABASE SCHEMA

## Overview

- Total Tables: 30+
- Database: MySQL 8.0
- ORM: Prisma

## Kategori & Tabel

**1. Authentication & Users (5 tabel)**
- `users` — Core user data
- `user_profiles` — Extended profile
- `sessions` — Login sessions
- `password_resets` — Password reset tokens
- `email_verifications` — Email verify tokens

**2. Subscription & Billing (6 tabel)**
- `plans` — Subscription plans
- `subscriptions` — User subscriptions
- `credits` — User credit balance
- `credit_transactions` — Credit history
- `payments` — Payment records
- `invoices` — Invoice records

**3. API Keys & Access (2 tabel)**
- `api_keys` — User API keys
- `api_key_usage_logs` — API usage per key

**4. AI Providers (3 tabel)**
- `ai_providers` — Provider configuration
- `provider_keys` — API keys pool
- `ai_models` — Models per provider

**5. Stock Data (4 tabel)**
- `stocks` — Master stocks
- `stock_prices` — Historical prices
- `stock_fundamentals` — Financial data
- `stock_news` — News & sentiment

**6. Analysis & Usage (4 tabel)**
- `analysis_requests` — AI analysis history
- `usage_logs` — General usage logs
- `rate_limit_hits` — Rate limit tracking
- `watchlists` — User watchlists

**7. System Configuration (5 tabel)**
- `settings` — System settings
- `feature_flags` — Feature toggles
- `prompt_templates` — AI prompt templates
- `content_pages` — CMS content
- `email_templates` — Email templates

**8. Audit & Notifications (3 tabel)**
- `audit_logs` — Admin action logs
- `notifications` — User notifications
- `email_logs` — Email history

## Key Design Principles

- ✅ UUID untuk public ID (bukan auto-increment)
- ✅ Soft delete (`deleted_at`) untuk data penting
- ✅ Timestamps di semua tabel
- ✅ JSON columns untuk data fleksibel
- ✅ Proper indexing untuk performance
- ✅ Foreign keys untuk data integrity

## Critical Indexes

| Tabel | Index |
|---|---|
| users | email (unique), status |
| sessions | user_id, token, expires_at |
| api_keys | user_id, key_prefix |
| usage_logs | user_id, created_at, endpoint |
| stock_prices | (stock_id, date) unique |
| audit_logs | user_id, action, created_at |

---

> **Lanjut ke:** [Bagian 8–14](08-14-bagian-8-sampai-14.md) · [Bagian 15–20](15-20-bagian-15-sampai-20.md)
