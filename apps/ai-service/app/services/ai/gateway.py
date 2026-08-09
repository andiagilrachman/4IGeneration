"""AI Gateway — multi-provider dengan fallback logic.

Referensi blueprint BAGIAN 10:
- Provider Router (priority + weight)
- Fallback antar provider bila error
- Circuit breaker & health check (TODO fase 2, dari DB admin panel)
- Response normalization ke format standar internal

No hardcode: prioritas/weight/key idealnya diambil dari Admin Panel
(provider_keys + ai_providers) — ini versi lokal untuk development.
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Any

import httpx

from app.core.config import Settings, get_settings


@dataclass
class Provider:
    """Representasi satu AI provider (versi lokal sederhana)."""

    name: str
    priority: int  # 1 = primary
    weight: int  # % traffic (weighted round robin)
    api_key: str
    base_url: str
    model: str
    auth_scheme: str = "bearer"  # bearer | key_query

    # status runtime (circuit breaker sederhana)
    healthy: bool = True
    failures: int = 0
    avg_response_ms: float = 0.0
    hits: int = 0

    def record(self, ok: bool, response_ms: float) -> None:
        self.hits += 1
        if ok:
            self.failures = 0
            self.healthy = True
            # EMA sederhana
            self.avg_response_ms = (
                self.avg_response_ms * (self.hits - 1) + response_ms
            ) / self.hits
        else:
            self.failures += 1
            # circuit breaker: 5 gagal beruntun -> mark down
            if self.failures >= 5:
                self.healthy = False


# ------------------------------------------------------------------
# Registri provider — priority sesuai blueprint BAGIAN 10
# ------------------------------------------------------------------
def build_providers(settings: Settings) -> list[Provider]:
    providers: list[Provider] = []

    if settings.gemini_api_key:
        providers.append(
            Provider(
                name="gemini",
                priority=1,
                weight=40,
                api_key=settings.gemini_api_key,
                base_url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
                model="gemini-1.5-flash",
                auth_scheme="key_query",
            )
        )
    if settings.groq_api_key:
        providers.append(
            Provider(
                name="groq",
                priority=2,
                weight=40,
                api_key=settings.groq_api_key,
                base_url="https://api.groq.com/openai/v1/chat/completions",
                model="llama-3.1-8b-instant",
            )
        )
    if settings.mistral_api_key:
        providers.append(
            Provider(
                name="mistral",
                priority=3,
                weight=15,
                api_key=settings.mistral_api_key,
                base_url="https://api.mistral.ai/v1/chat/completions",
                model="mistral-small-latest",
            )
        )
    if settings.openrouter_api_key:
        providers.append(
            Provider(
                name="openrouter",
                priority=4,
                weight=5,
                api_key=settings.openrouter_api_key,
                base_url="https://openrouter.ai/api/v1/chat/completions",
                model="openai/gpt-4o-mini",
            )
        )
    return providers


def _payload_for(provider: Provider, prompt: str, system: str | None) -> dict[str, Any]:
    messages: list[dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    if provider.name == "gemini":
        return {"contents": [{"parts": [{"text": prompt}]}]}

    return {"model": provider.model, "messages": messages, "temperature": 0.3}


def _extract_content(provider: Provider, data: dict[str, Any]) -> str:
    """Response normalization: ekstrak teks dari format tiap provider."""
    if provider.name == "gemini":
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError, TypeError):
            return ""
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return ""


class AIGateway:
    """Titik masuk utama AI Gateway dengan fallback logic."""

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.providers = build_providers(self.settings)

    async def _call_provider(self, provider: Provider, prompt: str, system: str | None) -> str:
        headers: dict[str, str] = {}
        params: dict[str, str] = {}
        url = provider.base_url

        if provider.auth_scheme == "key_query":
            params["key"] = provider.api_key
        else:
            headers["Authorization"] = f"Bearer {provider.api_key}"

        body = _payload_for(provider, prompt, system)
        timeout = httpx.Timeout(self.settings.gateway_timeout_ms / 1000)

        start = time.perf_counter()
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, headers=headers, params=params, json=body)
        elapsed_ms = (time.perf_counter() - start) * 1000

        resp.raise_for_status()
        content = _extract_content(provider, resp.json())
        provider.record(ok=True, response_ms=elapsed_ms)
        return content

    async def generate(self, prompt: str, system: str | None = None) -> dict[str, Any]:
        """Kirim prompt ke provider terbaik, fallback otomatis bila gagal."""
        if not self.providers:
            raise RuntimeError(
                "Tidak ada AI provider yang dikonfigurasi. "
                "Isi GEMINI_API_KEY / GROQ_API_KEY / MISTRAL_API_KEY di apps/ai-service/.env"
            )

        # urutkan berdasarkan priority, hanya yang healthy
        ordered = sorted(
            (p for p in self.providers if p.healthy),
            key=lambda p: p.priority,
        )

        last_error: Exception | None = None
        for provider in ordered:
            try:
                content = await self._call_provider(provider, prompt, system)
                return {
                    "provider": provider.name,
                    "model": provider.model,
                    "model_alias": {
                        "gemini": "4IG-Small",
                        "groq": "4IG-Small",
                        "mistral": "4IG-Small",
                        "openrouter": "4IG-Medium",
                    }.get(provider.name, "4IG-Small"),
                    "content": content,
                    "response_time_ms": round(provider.avg_response_ms, 1),
                }
            except Exception as exc:  # noqa: BLE001 — fallback flow
                last_error = exc
                provider.record(ok=False, response_ms=0)

        raise RuntimeError(
            f"Semua provider gagal ({len(self.providers)} provider): {last_error}"
        ) from last_error

    async def status(self) -> dict[str, Any]:
        """Status tiap provider (untuk /internal/v1/health & admin)."""
        return {
            "configured": [p.name for p in self.providers],
            "providers": [
                {
                    "name": p.name,
                    "priority": p.priority,
                    "weight": p.weight,
                    "healthy": p.healthy,
                    "failures": p.failures,
                    "avg_response_ms": round(p.avg_response_ms, 1),
                    "hits": p.hits,
                }
                for p in sorted(self.providers, key=lambda p: p.priority)
            ],
        }


_gateway: AIGateway | None = None


def get_gateway() -> AIGateway:
    global _gateway
    if _gateway is None:
        _gateway = AIGateway()
    return _gateway
