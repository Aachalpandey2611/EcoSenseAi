"""
ECOSENSE AI — Application Settings

Centralized configuration using pydantic-settings.
All values are loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────
    APP_NAME: str = "ECOSENSE AI"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # ── Database ─────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://ecosense:ecosense@localhost:5433/ecosense"

    # ── Security ─────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-use-a-64-char-hex-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── CORS ─────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"
    FRONTEND_URL: str = ""

    # ── AI / Gemini ──────────────────────────────────────
    GEMINI_API_KEY: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        return origins

    # Razorpay
    RAZORPAY_KEY_ID: str = "rzp_test_dummy_key_id"
    RAZORPAY_KEY_SECRET: str = "dummy_secret"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }

settings = Settings()
