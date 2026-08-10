from fastapi import APIRouter

from app.api.v1.endpoints import analysis, health, news, screener

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(analysis.router, tags=["analysis", "stocks"])
api_router.include_router(screener.router, tags=["screener"])
api_router.include_router(news.router, tags=["news", "market-recap"])
