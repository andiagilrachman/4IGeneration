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
