# 🏆 Phase 4 — Own Model (4IG-Finance) — Panduan Lengkap

> Status: **Persiapan infrastruktur selesai** · Eksekusi butuh GPU server (W37-48).
> Blueprint: BAGIAN 15 Phase 4 + BAGIAN 16 (biaya GPU).

## Ringkasan

Tujuan akhir blueprint: **model AI proprietary sendiri (4IG-Finance)** — tidak lagi bergantung
100% pada API pihak ketiga. Infrastruktur gateway sudah siap; tinggal GPU + data.

## Yang Sudah Disiapkan di Repo ✅

| Komponen | Lokasi | Status |
|---|---|---|
| Provider **Ollama/local** di AI Gateway | `apps/ai-service/app/services/ai/gateway.py` | ✅ (aktif saat `OLLAMA_BASE_URL` diisi) |
| Config `OLLAMA_BASE_URL` & `OLLAMA_MODEL` | `apps/ai-service/app/core/config.py` + `.env.example` | ✅ |
| Script **persiapan dataset fine-tune** | `apps/ai-service/app/scripts/prepare_dataset.py` | ✅ (format Alpaca JSONL, data nyata) |
| Fallback otomatis: model lokal jadi provider terakhir | gateway priority=5 | ✅ |

## Roadmap Eksekusi (butuh GPU)

### W37-38 — Setup GPU + Model Dasar
```bash
# 1. Install Ollama di server GPU (Linux)
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull model dasar (Llama 3 8B atau Mistral 7B)
ollama pull llama3:8b
# atau: ollama pull mistral:7b

# 3. Test API OpenAI-compatible Ollama
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3:8b","messages":[{"role":"user","content":"Halo"}]}'

# 4. Aktifkan di AI service (VPS/GPU)
# apps/ai-service/.env:
#   OLLAMA_BASE_URL=http://<GPU_IP>:11434
#   OLLAMA_MODEL=llama3:8b
```

**Saat aktif**, model lokal otomatis jadi provider fallback terakhir di AI Gateway
(priority 5) — hemat biaya API saat provider cloud down / mahal.

### W39-40 — Integrasi & A/B Testing
- Benchmark model lokal vs Gemini/OpenRouter (harga, ROE, dll)
- A/B test kualitas jawaban: lokal vs cloud (untuk analisis saham)
- Konfigurasi weight di Admin Panel (providers) agar sebagian traffic ke lokal

### W41-42 — Data Preparation (fine-tune)
```bash
# Generate dataset dari data saham nyata (sudah tersedia!)
cd apps/ai-service
.venv/bin/python -m app.scripts.prepare_dataset --limit 28 --output data/finetune.jsonl

# Data nyata: BBCA, BBRI, TLKM, dll — harga, ROE, PE, margin, growth
# Format Alpaca: {instruction, output, system}
```

### W43-44 — Training (QLoRA)
```bash
# Install transformers + peft + bitsandbytes di GPU server
pip install transformers peft bitsandbytes accelerate datasets

# Fine-tune llama3:8b dengan QLoRA (4-bit)
# (gunakan framework: axolotl / unsloth / script custom)
```

### W45-46 — Launch 4IG-Finance
- Deploy model fine-tuned sebagai provider "4IG-Finance" (alias di Admin Panel)
- Pengumuman & marketing (case studies, testimoni)

## Biaya (blueprint BAGIAN 16)

| Item | Biaya |
|---|---|
| GPU server (dedicated) | $500-2000/bulan |
| Storage (model) | $50-200/bulan |
| Training compute | $100-500 (one-time) |

**Alternatif hemat:** GPU cloud per-jam (Vast.ai, RunPod, Lambda) untuk training saja,
lalu inference via Ollama di VPS dengan GPU murah.

## Arsitektur Setelah Phase 4

```
AI Gateway (FastAPI)
  ├→ Gemini (priority 1)     ← cloud primary
  ├→ Groq / OpenRouter       ← fallback
  └→ Ollama (priority 5)     ← 4IG-Finance (own model, hemat biaya)
       ↓
  GPU Server (Llama 3 8B / 4IG-Finance fine-tuned)
```

## Verifikasi Kesiapan

```bash
# 1. Provider Ollama terdaftar (setelah isi env)
curl http://localhost:8000/internal/v1/providers/status
# → lihat "ollama-local" di daftar providers

# 2. Dataset fine-tune siap
.venv/bin/python -m app.scripts.prepare_dataset --limit 28 --output data/finetune.jsonl

# 3. Benchmark model lokal vs cloud (W39-40)
```

---

*Infrastruktur siap. Langkah berikutnya: sewa GPU, install Ollama, isi env, dan model lokal langsung jalan sebagai fallback.*
