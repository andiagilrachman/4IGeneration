"""4IGeneration AI Service — konfigurasi global (12-factor app)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    app_name: str = "4ig-ai-service"

    # AI provider keys (BAGIAN 11)
    gemini_api_key: str = ""
    groq_api_key: str = ""
    mistral_api_key: str = ""
    openrouter_api_key: str = ""

    # Gateway tuning (BAGIAN 10)
    gateway_timeout_ms: int = 30000
    gateway_max_retries: int = 3

    # Cache (Week 10 — Redis)
    redis_url: str = "redis://localhost:6379"
    stock_cache_ttl_seconds: int = 43200  # 12 jam

    # Model lokal (Phase 4 — Own Model, W37-38)
    # Contoh: OLLAMA_BASE_URL=http://localhost:11434 OLLAMA_MODEL=llama3:8b
    ollama_base_url: str = ""
    ollama_model: str = "llama3:8b"

    @property
    def providers_configured(self) -> list[str]:
        """Provider yang punya API key terisi."""
        mapping = {
            "gemini": self.gemini_api_key,
            "groq": self.groq_api_key,
            "mistral": self.mistral_api_key,
            "openrouter": self.openrouter_api_key,
        }
        return [name for name, key in mapping.items() if key]


@lru_cache
def get_settings() -> Settings:
    return Settings()
