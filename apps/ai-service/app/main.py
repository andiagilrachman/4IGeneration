"""FastAPI entry point — 4IGeneration AI Service.

Referensi blueprint BAGIAN 8.11 (AI Service Internal Endpoints):
prefix /internal/v1
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="4IGeneration AI Service",
    version="0.1.0",
    description="AI Gateway multi-provider untuk analisis saham (internal service).",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # internal service — proteksi via network layer
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/internal/v1")


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "4ig-ai-service", "docs": "/docs", "health": "/internal/v1/health"}
