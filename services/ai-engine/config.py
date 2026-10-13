"""
MineSetu AI — AI Processing Engine Configuration
"""

import os
try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        class BaseSettings:  # type: ignore
            def __init__(self, **kwargs):
                for k, v in kwargs.items():
                    setattr(self, k, v)
from typing import List


class Settings(BaseSettings):
    # Service Information
    APP_NAME: str = "MineSetu AI Processing Engine"
    APP_VERSION: str = "1.0.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # Supabase Connection
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", "http://localhost:54321"))
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv("VITE_SUPABASE_ANON_KEY", "")

    # Storage Buckets
    BUCKET_RAW_DOCUMENTS: str = "raw-documents"
    BUCKET_FACSIMILES: str = "facsimiles"
    BUCKET_EXPORTS: str = "exports"

    # AI Model Providers (3-Tier Failover: Primary -> Secondary -> Tertiary)
    GROK_API_KEY_PRIMARY: str = os.getenv("GROK_API_KEY_PRIMARY", os.getenv("LLM_API_KEY_PRIMARY", ""))
    GROK_API_KEY_SECONDARY: str = os.getenv("GROK_API_KEY_SECONDARY", os.getenv("GROK_API_KEY_FALLBACK", os.getenv("LLM_API_KEY_SECONDARY", "")))
    GROK_API_KEY_TERTIARY: str = os.getenv("GROK_API_KEY_TERTIARY", os.getenv("LLM_API_KEY_TERTIARY", ""))
    GROK_BASE_URL: str = os.getenv("GROK_BASE_URL", "https://api.x.ai/v1")
    GROK_MODEL_ID: str = os.getenv("GROK_MODEL_ID", "grok-2-1212")
    EMBEDDING_MODEL_ID: str = os.getenv("EMBEDDING_MODEL_ID", "text-embedding-3-small")
    EMBEDDING_DIMENSIONS: int = 1536

    # Worker Settings
    WORKER_ENABLED: bool = os.getenv("WORKER_ENABLED", "true").lower() == "true"
    POLL_INTERVAL_SECONDS: float = 3.0
    JOB_LEASE_SECONDS: int = 300
    MAX_JOB_RETRIES: int = 3
    BATCH_SIZE: int = 5

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://minesetu.vercel.app"
    ]

    def get_configured_grok_keys(self) -> List[str]:
        """Returns valid non-placeholder API keys in priority order: Primary -> Secondary -> Tertiary."""
        candidates = [self.GROK_API_KEY_PRIMARY, self.GROK_API_KEY_SECONDARY, self.GROK_API_KEY_TERTIARY]
        return [
            k for k in candidates
            if k and not k.startswith("xai-") and not k.endswith("-here") and len(k) > 10
        ]

    def validate_environment(self) -> dict:
        """Validates critical runtime configuration without printing secret values."""
        configured_keys = self.get_configured_grok_keys()
        return {
            "app_name": self.APP_NAME,
            "version": self.APP_VERSION,
            "supabase_configured": bool(self.SUPABASE_URL and self.SUPABASE_SERVICE_ROLE_KEY),
            "grok_api_configured": bool(self.GROK_API_KEY_PRIMARY or self.GROK_API_KEY_SECONDARY or self.GROK_API_KEY_TERTIARY),
            "grok_keys_count": len(configured_keys),
            "worker_enabled": self.WORKER_ENABLED,
            "cors_origin_count": len(self.CORS_ORIGINS),
        }

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
