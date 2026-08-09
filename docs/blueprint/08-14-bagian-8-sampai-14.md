# 🗄 BAGIAN 8: API ENDPOINTS DESIGN

## API Structure

- Base URL Development: `http://localhost:3001/api/v1`
- Base URL Production: `https://api.4igeneration.com/v1`
- Format: REST + JSON
- Authentication: Bearer JWT (users) + API Key (developers)
- Rate Limiting: per user + per API key
- Versioning: URL path (v1, v2, ...)

## 8.1 Authentication Endpoints

```
POST   /auth/register              # Daftar user baru
POST   /auth/login                 # Login user
POST   /auth/logout                # Logout
POST   /auth/refresh               # Refresh JWT token
POST   /auth/forgot-password       # Request reset password
POST   /auth/reset-password        # Reset password dengan token
POST   /auth/verify-email          # Verify email dengan token
POST   /auth/resend-verification   # Resend email verification
GET    /auth/me                    # Get current user info
POST   /auth/2fa/enable            # Enable 2FA
POST   /auth/2fa/verify            # Verify 2FA code
POST   /auth/2fa/disable           # Disable 2FA
GET    /auth/sessions              # List active sessions
DELETE /auth/sessions/:id          # Revoke session
```

## 8.2 User Management Endpoints

```
GET    /users/profile              # Get profile
PUT    /users/profile              # Update profile
PUT    /users/password             # Change password
PUT    /users/email                # Change email
POST   /users/avatar               # Upload avatar
DELETE /users/account              # Delete account
GET    /users/preferences          # Get preferences
PUT    /users/preferences          # Update preferences
GET    /users/notifications        # Get notifications
PUT    /users/notifications/:id/read  # Mark as read
DELETE /users/notifications/:id    # Delete notification
PUT    /users/notifications/mark-all-read
```

## 8.3 API Keys Endpoints

```
GET    /api-keys                   # List user's API keys
POST   /api-keys                   # Create new API key
GET    /api-keys/:id               # Get API key details
PUT    /api-keys/:id               # Update API key
DELETE /api-keys/:id               # Revoke API key
POST   /api-keys/:id/regenerate    # Regenerate key
GET    /api-keys/:id/usage         # Usage stats per key
```

## 8.4 Subscription & Billing Endpoints

```
GET    /plans                      # List all plans
GET    /plans/:slug                # Get plan details
GET    /subscriptions/current      # Current subscription
POST   /subscriptions/subscribe    # Subscribe to plan
POST   /subscriptions/upgrade      # Upgrade plan
POST   /subscriptions/downgrade    # Downgrade plan
POST   /subscriptions/cancel       # Cancel subscription
POST   /subscriptions/resume       # Resume subscription
GET    /credits/balance            # Credit balance
GET    /credits/transactions       # Credit history
POST   /credits/purchase           # Buy credits
GET    /payments                   # Payment history
POST   /payments/create            # Create payment
GET    /payments/:id               # Payment details
POST   /payments/webhook/midtrans  # Midtrans webhook
POST   /payments/webhook/stripe    # Stripe webhook
GET    /invoices                   # List invoices
GET    /invoices/:id               # Get invoice
GET    /invoices/:id/download      # Download PDF
```

## 8.5 Stock Data Endpoints

```
GET    /stocks                     # List all stocks (paginated)
GET    /stocks/search?q=           # Search stocks
GET    /stocks/:ticker             # Stock details
GET    /stocks/:ticker/prices      # Historical prices
GET    /stocks/:ticker/fundamentals # Financial data
GET    /stocks/:ticker/news        # Stock news
GET    /stocks/:ticker/technicals  # Technical indicators
GET    /stocks/sectors             # List sectors
GET    /stocks/sectors/:slug       # Stocks in sector
GET    /stocks/indices             # List indices (LQ45, IDX30)
GET    /stocks/indices/:slug       # Stocks in index
GET    /stocks/top-gainers         # Top gainers
GET    /stocks/top-losers          # Top losers
GET    /stocks/most-active         # Most active
```

## 8.6 AI Analysis Endpoints

```
POST   /analysis/stock             # Analisis 1 saham
POST   /analysis/compare           # Compare multiple stocks
POST   /analysis/screener          # AI-powered screening
POST   /analysis/sentiment         # News sentiment analysis
POST   /analysis/summary           # Ringkasan laporan keuangan
POST   /analysis/chat              # Chat/Q&A dengan AI
POST   /analysis/market-recap      # Market recap harian
POST   /analysis/portfolio         # Portfolio analysis
GET    /analysis/history           # User's analysis history
GET    /analysis/:id               # Get specific analysis
DELETE /analysis/:id               # Delete analysis
POST   /analysis/:id/regenerate    # Regenerate analysis
```

## 8.7 Playground Endpoints

```
POST   /playground/generate        # Test AI generation
GET    /playground/models          # Available models
POST   /playground/save            # Save conversation
GET    /playground/saved           # List saved conversations
```

## 8.8 Watchlist Endpoints

```
GET    /watchlists                 # List user's watchlists
POST   /watchlists                 # Create watchlist
GET    /watchlists/:id             # Get watchlist
PUT    /watchlists/:id             # Update watchlist
DELETE /watchlists/:id             # Delete watchlist
POST   /watchlists/:id/tickers     # Add ticker
DELETE /watchlists/:id/tickers/:ticker  # Remove ticker
```

## 8.9 Usage & Analytics

```
GET    /usage/current              # Current month usage
GET    /usage/history              # Usage history
GET    /usage/by-endpoint          # Usage per endpoint
GET    /usage/by-model             # Usage per AI model
GET    /usage/export               # Export usage CSV
```

## 8.10 Admin Endpoints

```
# Auth
POST   /admin/auth/login
GET    /admin/auth/me

# Dashboard
GET    /admin/dashboard/stats
GET    /admin/dashboard/revenue
GET    /admin/dashboard/users-growth
GET    /admin/dashboard/api-calls
GET    /admin/dashboard/top-users

# Users Management
GET    /admin/users
GET    /admin/users/:id
PUT    /admin/users/:id
DELETE /admin/users/:id
POST   /admin/users/:id/suspend
POST   /admin/users/:id/unsuspend
POST   /admin/users/:id/credits    # Adjust credits
POST   /admin/users/:id/impersonate

# Plans Management
GET    /admin/plans
POST   /admin/plans
PUT    /admin/plans/:id
DELETE /admin/plans/:id

# Providers Management
GET    /admin/providers
POST   /admin/providers
PUT    /admin/providers/:id
DELETE /admin/providers/:id
POST   /admin/providers/:id/test
GET    /admin/providers/:id/health

# Provider Keys
GET    /admin/provider-keys
POST   /admin/provider-keys
PUT    /admin/provider-keys/:id
DELETE /admin/provider-keys/:id
POST   /admin/provider-keys/:id/reset
POST   /admin/provider-keys/:id/enable
POST   /admin/provider-keys/:id/disable

# Models Management
GET    /admin/models
POST   /admin/models
PUT    /admin/models/:id
DELETE /admin/models/:id

# Prompts Management
GET    /admin/prompts
POST   /admin/prompts
PUT    /admin/prompts/:id
DELETE /admin/prompts/:id
POST   /admin/prompts/:id/test

# Stocks Management
GET    /admin/stocks
POST   /admin/stocks
PUT    /admin/stocks/:id
DELETE /admin/stocks/:id
POST   /admin/stocks/sync          # Sync dari IDX
POST   /admin/stocks/import        # Import CSV

# Settings
GET    /admin/settings
GET    /admin/settings/:category
PUT    /admin/settings/:category/:key
POST   /admin/settings/reset

# Feature Flags
GET    /admin/feature-flags
POST   /admin/feature-flags
PUT    /admin/feature-flags/:id
DELETE /admin/feature-flags/:id

# Content
GET    /admin/content
POST   /admin/content
PUT    /admin/content/:id
DELETE /admin/content/:id

# Email Templates
GET    /admin/email-templates
POST   /admin/email-templates
PUT    /admin/email-templates/:id
POST   /admin/email-templates/:id/test

# Audit Logs
GET    /admin/audit-logs
GET    /admin/audit-logs/:id
GET    /admin/audit-logs/export

# System
GET    /admin/system/health
GET    /admin/system/info
POST   /admin/system/cache/clear
POST   /admin/system/maintenance
GET    /admin/system/logs
```

## 8.11 AI Service Internal Endpoints (FastAPI)

```
POST   /internal/v1/generate               # Main AI generation
POST   /internal/v1/analyze/stock          # Stock analysis
POST   /internal/v1/analyze/sentiment      # Sentiment analysis
POST   /internal/v1/screen                 # Screening logic
POST   /internal/v1/summarize              # Text summarization
POST   /internal/v1/chat                   # Chat completion
POST   /internal/v1/embeddings             # Generate embeddings
GET    /internal/v1/health                 # Health check
GET    /internal/v1/providers/status       # Providers status
POST   /internal/v1/providers/test         # Test provider
```

## Response Format Standard

**Success**

```json
{
  "success": true,
  "data": {},
  "meta": { "timestamp": "2025-01-15T10:30:00Z", "request_id": "req_abc123" }
}
```

**Paginated**

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "per_page": 20, "total": 150, "total_pages": 8 },
  "meta": {}
}
```

**Error**

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Invalid input", "details": {} },
  "meta": {}
}
```

**HTTP Status Codes**: 200 OK · 201 Created · 204 No Content · 400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 409 Conflict · 422 Validation · 429 Rate limit · 500 Server Error · 502 Bad Gateway (provider error) · 503 Service Unavailable (maintenance)

---

# 🎛 BAGIAN 9: ADMIN PANEL STRUCTURE

## Main Menu Structure

```
📊 DASHBOARD
├── Overview (KPIs, charts)
├── Revenue Analytics
├── User Growth
├── API Usage
├── Provider Performance
└── Real-time Monitor

👥 USER MANAGEMENT
├── All Users
├── User Roles & Permissions
├── Suspended Users
├── User Analytics
└── Impersonation Log

💳 SUBSCRIPTION & BILLING
├── Plans
├── Active Subscriptions
├── Cancelled Subscriptions
├── Payments
├── Invoices
├── Refunds
└── Credit Adjustments

🤖 AI CONFIGURATION
├── Providers (Add/Edit, Health, Fallback Config)
├── Provider Keys Pool (All, Active, Dead, Usage Stats)
├── AI Models (Available, Aliases, Pricing)
├── Prompt Templates (Manage, Test, Version History)
├── Load Balancer Config
└── Analytics per Provider

🔑 API MANAGEMENT
├── User API Keys
├── Rate Limits Configuration
├── Endpoint Management
├── Usage Logs
├── API Analytics
└── Deprecated Endpoints

📈 STOCK DATA
├── Stocks Database
├── Price Data
├── Fundamentals
├── News Feed
├── Sectors & Industries
├── Indices Management
├── Data Sources Config
└── Sync Jobs

📄 CONTENT MANAGEMENT
├── Landing Page
├── Pricing Page
├── Blog Posts
├── Documentation
├── Help Center
├── Legal Pages
├── FAQ Management
└── Testimonials

📧 EMAIL & NOTIFICATIONS
├── Email Templates
├── SMTP Configuration
├── Email Logs
├── Notification Templates
├── Push Notifications
└── Broadcast Messages

⚙ SETTINGS
├── General (Site Info, Contact, Business Info)
├── Email (SMTP)
├── Payment Gateways (Midtrans, Stripe, Manual)
├── Security (Password Policy, 2FA, Session Mgmt)
├── Integrations (Google OAuth, GitHub OAuth, Cloudflare, Analytics)
├── Notifications
├── Feature Flags
├── Localization
├── SEO
└── Legal Settings

🔒 SECURITY
├── Audit Logs
├── Login Attempts
├── Failed Requests
├── IP Blacklist/Whitelist
├── Admin Users
├── 2FA Management
├── API Access Logs
└── Security Reports

🛠 SYSTEM
├── Health Check
├── System Info
├── Cache Management
├── Queue Monitor
├── Backup & Restore
├── Maintenance Mode
├── Logs Viewer
├── Database Console
└── Deployment Info

📊 REPORTS
├── Revenue Reports
├── User Reports
├── Usage Reports
├── Financial Reports
├── Custom Reports
└── Export Data
```

## Dashboard Widgets

Total Users (growth %) · Active Subscriptions · MRR · Total API Calls Today · Provider Health Status · Recent Activities · Top Users by Usage · Revenue Chart (line) · User Growth Chart (line) · API Usage Chart (bar) · Provider Distribution (pie) · System Alerts

## Bulk Actions & Advanced Features

- Bulk: suspend users, send emails, delete records, export data, import CSV
- Real-time notifications, dark mode toggle, multi-language
- Search everything (Cmd+K), keyboard shortcuts, activity timeline
- Quick actions menu, custom dashboards per admin

---

# 🧠 BAGIAN 10: AI GATEWAY & MULTI-PROVIDER FLOW

## Architecture

```
Application Request
        ↓
┌─────────────────────────┐
│   AI Gateway Service    │
│      (FastAPI)          │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│   Provider Router       │
│   - Load balancer       │
│   - Priority manager    │
│   - Health checker      │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│   Provider Selection    │
│   - Check availability  │
│   - Pick best key       │
│   - Apply rate limit    │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│   Provider Adapter      │
│   - Normalize request   │
│   - Call provider API   │
│   - Handle errors       │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│   Response Normalizer   │
│   - Standard format     │
│   - Extract usage       │
│   - Log analytics       │
└──────────┬──────────────┘
           ↓
    Return to App
```

## Multi-Provider Fallback Logic (Step-by-Step)

```
[1] Request comes in
    ↓
[2] Validate API key & permissions
    ↓
[3] Check rate limits (Redis)
    ↓ Pass
[4] Check user credit balance
    ↓ Sufficient
[5] Load balancer picks provider (weight, health, priority)
    ↓
[6] Pick available API key from pool
    - Filter: status = active
    - Filter: not cooling_down
    - Filter: within daily limit
    ↓
[7] Send request to provider
    ↓
    ├─ Success (200)
    │   ↓ [8a] Normalize response
    │   [9a] Log usage & analytics
    │   [10a] Deduct credits
    │   [11a] Return to user
    │
    └─ Failure (any error)
        ↓ [8b] Log error, mark key cooling_down
        [9b] Try next API key of same provider
             ├─ Success → return
             └─ All keys failed
                 ↓ [10b] Fallback to next provider
                      ├─ Success → return
                      └─ All providers failed
                          ↓ [11b] Return graceful error
                          [12b] Alert admin
```

## Provider Priority Example

```
Priority 1: GEMINI (Primary)
├─ gemini-key-1 (active, 40% used today)
├─ gemini-key-2 (active, 60% used today)
├─ gemini-key-3 (cooling_down until 15:30)
└─ gemini-key-4 (active, 20% used today)

Priority 2: GROQ (Fast fallback)
├─ groq-key-1 (active)
└─ groq-key-2 (active)

Priority 3: MISTRAL (Backup)
├─ mistral-key-1 (active)
└─ mistral-key-2 (rate_limited)

Priority 4: OPENROUTER (Last resort, paid)
└─ openrouter-key-1 (active, $5.20 balance)
```

## Load Balancing Strategies

1. **Weighted Round Robin** — Gemini 40% · Groq 40% · Mistral 15% · OpenRouter 5%
2. **Least Used (LRU)** — pick provider/key dengan usage paling sedikit hari ini
3. **Fastest Response** — pick provider dengan avg response time terendah
4. **Random Selection** — distribute evenly

## Circuit Breaker Pattern

```
HEALTHY → (5 failures/menit) → DEGRADED (traffic 20%)
DEGRADED → (10 failures) → OPEN (stop traffic, cooldown 5 menit)
OPEN → (setelah 5 menit) → HALF-OPEN (kirim 1 test request)
HALF-OPEN → sukses → HEALTHY · gagal → OPEN lagi
```

## Health Check System (setiap 60 detik)

- Response time < 2s → HEALTHY
- Response time 2-5s → DEGRADED
- Response time > 5s atau error → DOWN
- Alert admin jika provider DOWN > 5 menit

## Provider Configuration Example

```yaml
Provider: Gemini
  Base URL: https://generativelanguage.googleapis.com
  Auth Type: api_key_query
  Priority: 1
  Weight: 40
  Timeout: 30s
  Max Retries: 3
  Retry Delay: 1s
  Health Check: /v1beta/models

  Models:
    - id: gemini-1.5-pro
      alias: 4IG-Pro
      context: 1M tokens
      price_input: $0.00035/1k
      price_output: $0.00105/1k
    - id: gemini-1.5-flash
      alias: 4IG-Small
      context: 1M tokens
      price_input: $0.000075/1k
      price_output: $0.0003/1k

  Keys Pool:
    - key: encrypted_key_1
      daily_limit: 1500
      monthly_limit: 45000
      status: active
    - key: encrypted_key_2
      daily_limit: 1500
      monthly_limit: 45000
      status: active
```

## Response Normalization (format internal standar)

```json
{
  "id": "req_abc123",
  "provider": "gemini",
  "model": "gemini-1.5-pro",
  "model_alias": "4IG-Pro",
  "content": "The analysis result...",
  "finish_reason": "stop",
  "usage": { "input_tokens": 250, "output_tokens": 500, "total_tokens": 750 },
  "cost": { "input_cost": 0.0000875, "output_cost": 0.000525, "total_cost": 0.0006125 },
  "credits_used": 10,
  "response_time_ms": 1250,
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

# 🔌 BAGIAN 11: THIRD-PARTY SERVICES & DEPENDENCIES

## 1. AI Providers (Free Tier)

| Provider | URL | Free tier | Best for |
|---|---|---|---|
| Google Gemini | aistudio.google.com | 15 RPM, 1M TPM, 1500 RPD | Long context, multimodal |
| Groq | console.groq.com | Very fast, generous | Llama 3, Mixtral speed |
| Mistral AI | console.mistral.ai | La Plateforme | Mistral models |
| OpenRouter (paid, murah) | openrouter.ai | Pay per token | Akses banyak models |

## 2. Stock Data Sources

| Sumber | Biaya | Keterangan |
|---|---|---|
| Yahoo Finance (yfinance) | Free | Unofficial, bisa break; historical prices |
| Alpha Vantage | Free 25 req/hari, paid $50-500/bln | Fundamentals |
| Twelve Data | Free 800 req/hari, paid $30-99/bln | Real-time data |
| IEX Cloud | Free tier | US stocks |
| Financial Modeling Prep | Free 250 req/hari | Financial statements |

## 3. News API

- NewsAPI.org — free 100 req/hari (dev), paid $449/bln
- Google News (scraping) — free, berita lokal Indonesia
- Detik/Kompas/CNBC Indonesia — scraping (hati-hati ToS)

## 4. Email Services

- **Resend** — free 100 email/hari, 3000/bln; paid $20-90/bln (recommended)
- SendGrid — free 100/hari
- Mailgun — trial 5000 emails/3 bln

## 5. Payment Gateways

- **Midtrans** (Indonesia) — fee 2-3%; VA, e-wallet, credit card (recommended)
- Xendit (Indonesia) — alternatif Midtrans
- Stripe (Global) — 2.9% + $0.30

## 6. Cloud & Infrastructure

- DigitalOcean (VPS) $6-40/bln · Vultr $6-40/bln · Contabo (budget) $6-15/bln
- Vercel (frontend, free tier) · Cloudflare (CDN+DNS, free) · Cloudflare R2 ($0.015/GB, no egress)

## 7. Database Services

- Self-hosted MySQL (Docker) — free, full control (recommended)
- PlanetScale (managed) · Railway $5-20/bln · Redis Cloud free 30MB · Upstash free 10K cmd/hari

## 8. Monitoring & Analytics

- Sentry (5K errors/bln free) · Uptime Robot (50 monitors free) · Umami (self-hosted) · Google Analytics

## 9. Development Tools

- GitHub (private repos unlimited) · GitHub Actions (2000 min/bln free) · Postman · DBeaver · Docker Hub · npm

## 10. Optional Services

- Algolia (10K searches/bln free) · Meilisearch (self-hosted) · Cloudflare Turnstile (CAPTCHA) · OneSignal (push) · Twilio (SMS) · Fonnte (WA Indonesia, Rp 50K/bln)

## Recommended Stack untuk MVP

**Phase 1 (Bulan 1-3)**: Gemini + Groq (free) · Yahoo Finance + Alpha Vantage (free) · Resend (free) · DigitalOcean $10/bln · Cloudflare (free) · Local storage · Sentry + Uptime Robot (free) · Umami → **Total ~$10-20/bln**

**Phase 2 (Bulan 4-6)**: + Midtrans · + Cloudflare R2 · Resend $20 → **Total ~$60-100/bln**

**Phase 3 (Bulan 7-12)**: hosting lebih baik, paid stock API, marketing → **Total ~$200-500/bln**

---

# 🔒 BAGIAN 12: SECURITY ARCHITECTURE

## Security Layers

| Layer | Isi |
|---|---|
| 1. Network | Cloudflare DDoS, rate limit CDN, IP blocking, WAF |
| 2. Application | HTTPS (Let's Encrypt), CORS, CSP, X-Frame-Options, HSTS |
| 3. Auth & Authz | bcrypt (cost 12), JWT RS256, access token 15 min, refresh 7 hari, session Redis, 2FA TOTP, OAuth Google/GitHub, RBAC |
| 4. Data | API keys encrypted, PII anonymized, backup encrypted, env vars tidak di git |
| 5. Input Validation | Zod/class-validator, SQL injection (Prisma), XSS (React + DOMPurify), CSRF tokens, file upload validation |
| 6. API Security | API keys hashed bcrypt, prefix 8 chars, rate limit per key, IP whitelist, versioning, deprecation warnings |
| 7. Infrastructure | SSH key-only, firewall minimal port, fail2ban, auto security updates, DB no public access, Redis ber-password, Docker non-root |
| 8. Monitoring | Failed login tracking, Sentry, audit logs admin, access logs, incident response plan |

## Security Checklist

- **Development**: env vars untuk secrets · jangan commit .env · secret scanning (GitHub) · dependabot · npm audit · code review
- **Production**: SSL · force HTTPS · HSTS · CSP · rate limiting · backup otomatis · restore test · monitoring & alerts · incident response
- **Ongoing**: update dependency mingguan · review access log mingguan · rotate secrets kuartalan · penetration test tahunan · review UU PDP

---

# 🚀 BAGIAN 13: DEPLOYMENT STRATEGY

## Environment Setup

| Environment | Lokasi | Keterangan |
|---|---|---|
| Development | local | Docker Compose, hot reload, mock data |
| Staging | VPS | staging.4igeneration.com, test data |
| Production | VPS | 4igeneration.com, real users, monitoring |

## Deployment Phases

- **Phase 1 (Bulan 1-6)**: 1 VPS $20-40/bln, Docker Compose semua service → 0-1000 users
- **Phase 2 (Bulan 6-12)**: Vercel (frontend) → VPS 1 (backend+DB) → VPS 2 (AI service) → 1000-10K users
- **Phase 3 (Post 12 bln)**: Cloud native (Vercel, Railway/Render, PlanetScale, Upstash, GPU server) → 10K+ users

## CI/CD Pipeline (GitHub Actions)

```
On Push to main:
1. Lint & format  2. Type check  3. Unit tests  4. Integration tests
5. Build all apps  6. Build Docker images  7. Push registry
8. Deploy staging  9. E2E tests staging  10. Manual approval
11. Deploy production  12. Smoke tests  13. Notification
```

## Rollback & Backup

- Keep last 3 Docker images · reversible migrations · feature flags · blue-green (later) · one-click rollback
- Backup DB harian 2 AM WIB, retention 30 hari, storage R2, test restore bulanan, AES-256
- User uploads di R2 · config di git · logs 30 hari

## Domain & DNS (Cloudflare)

```
4igeneration.com  → Main website
www               → redirect ke main
app               → Web application
api               → API endpoint
admin             → Admin panel
docs              → Documentation
status            → Status page
blog              → Blog (later)
```

**SSL**: Let's Encrypt + Certbot, wildcard cert, force HTTPS, HSTS, target grade A+

---

# 💻 BAGIAN 14: DEVELOPMENT ENVIRONMENT

## Required Software

- Node.js v20 LTS (NVM) · Python 3.11+ · Docker Desktop · Git · VS Code · pnpm v9+

## VS Code Extensions

- **Essential**: ESLint, Prettier, Prisma, Tailwind IntelliSense, Python, Pylance, Docker, GitLens, Error Lens, Thunder Client
- **Nice to have**: Auto Rename Tag, Path Intellisense, Better Comments, Material Icon Theme, TODO Highlight, Import Cost

## Local Dev Setup

- OS: Windows 10/11, macOS, Linux · RAM 8GB min / 16GB recommended · Storage 20GB · CPU 4 cores

## Docker Compose Services (Local)

- mysql :3306 · redis :6379 · api :3001 · web :3000 · admin :3002 · ai-service :8000 · nginx :80/443

## Environment Variables Structure

```
📄 .env (root, shared)         → NODE_ENV, APP_NAME, APP_URL, TIMEZONE, ...
📄 apps/api/.env               → DATABASE_URL, REDIS_URL, JWT_SECRET, AI_SERVICE_URL, ...
📄 apps/web/.env.local         → NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL, ...
📄 apps/ai-service/.env        → GEMINI_API_KEY, GROQ_API_KEY, MISTRAL_API_KEY, ...
```

## Git Workflow

**Branch Strategy**: `main` (production) · `develop` (development) · `feature/*` · `fix/*` · `hotfix/*` · `release/*`

**Commit Convention**: `feat:` · `fix:` · `docs:` · `style:` · `refactor:` · `test:` · `chore:` · `perf:`

**PR Process**: feature branch dari develop → changes → tests → docs → PR ke develop → self-review → merge setelah CI → deploy staging → test → merge develop ke main

---

> **Lanjut ke:** [Bagian 15–20](15-20-bagian-15-sampai-20.md) · [Kembali ke Bagian 1–7](01-07-bagian-1-sampai-7.md)
