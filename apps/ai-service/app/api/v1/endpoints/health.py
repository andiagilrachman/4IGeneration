"""Health & provider status endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter

from app.services.ai.gateway import get_gateway
from app.services.cache import redis_cache

router = APIRouter()


@router.get("/health")
async def health() -> dict:
    gateway = get_gateway()
    from app.core.config import get_settings

    settings = get_settings()
    return {
        "success": True,
        "data": {
            "service": "4ig-ai-service",
            "status": "ok",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "providers_configured": len(gateway.providers),
            "cache": redis_cache.stats(),
            "local_model": {
                "enabled": bool(settings.ollama_base_url),
                "url": settings.ollama_base_url or None,
                "model": settings.ollama_model,
            },
        },
    }


@router.get("/providers/status")
async def providers_status() -> dict:
    return {"success": True, "data": await get_gateway().status()}
