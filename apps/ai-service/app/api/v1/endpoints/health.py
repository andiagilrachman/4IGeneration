"""Health & provider status endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter

from app.services.ai.gateway import get_gateway

router = APIRouter()


@router.get("/health")
async def health() -> dict:
    gateway = get_gateway()
    return {
        "success": True,
        "data": {
            "service": "4ig-ai-service",
            "status": "ok",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "providers_configured": len(gateway.providers),
        },
    }


@router.get("/providers/status")
async def providers_status() -> dict:
    return {"success": True, "data": await get_gateway().status()}
