# 🏛 Arsitektur — 4IGeneration v2.0 (ringkas)

> Detail lengkap: `docs/blueprint/` (BAGIAN 4, 7, 10, 12, 13).

## Diagram Alur

```
Browser / API Client
        ↓
   Cloudflare (CDN/WAF)
        ↓
     Nginx
   ↓      ↓      ↓      ↓
 Next.js  NestJS  Refine  FastAPI
 :3000    :3001   :3002   :8000
          ↓  ↓  ↓
       MySQL Redis AI Gateway
       :3306 :6379   ↓
                Gemini · Groq · Mistral · OpenRouter
                (Phase 4: own model 4IG-Finance)
```

## Prinsip Kunci

1. **No hardcode** — provider, model, prompt, harga dikelola di Admin Panel (DB).
2. **Multi-provider fallback** — jangan pernah bergantung pada 1 API (BAGIAN 10).
3. **Dual purpose** — web tools + public API dari backend yang sama.
4. **Security berlapis** — lihat BAGIAN 12 (8 layer).
5. **Ship fast** — 60% done, iterate to 100%.

## Port (Development)

| Service | Port | Catatan |
|---|---|---|
| Web (Next.js) | 3000 | `pnpm --filter @4ig/web dev` |
| API (NestJS) | 3001 | prefix `/api/v1` |
| Admin (Refine) | 3002 | |
| AI Service (FastAPI) | 8000 | prefix `/internal/v1` |
| MySQL | 3306 | via docker compose |
| Redis | 6379 | via docker compose |

## Alur Request AI (BAGIAN 10)

```
NestJS → POST /internal/v1/analyze/stock → FastAPI
  → AIGateway.generate(prompt)
  → pilih provider (priority+weight, healthy)
  → call provider API (httpx)
  → fallback provider berikutnya bila gagal (circuit breaker)
  → response ternormalisasi → kembali ke user
```
