import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

    PROJECT_NAME: str = "EduMaster.ai Enterprise API"
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = "INFO"

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "edumaster_enterprise_secret_jwt_key_2026_super_secure_32chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Database: Supports Railway PostgreSQL (postgresql+asyncpg://...) and SQLite local fallback
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./edumaster_enterprise.db"
    )

    # Redis: Supports Railway Redis and graceful fallback if absent
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # CORS configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "https://*.vercel.app",
        "https://frontend-five-rho-83.vercel.app",
        "https://edumaster-ai.vercel.app"
    ] + [
        origin.strip()
        for origin in os.getenv("PUBLIC_FRONTEND_ORIGIN", "").split(",")
        if origin.strip()
    ]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ("production", "prod")

    @property
    def clean_database_url(self) -> str:
        # Railway provides "postgres://" which must be translated to "postgresql+asyncpg://"
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
