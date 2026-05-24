from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "AI Insights Hub API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Backend API for AI Insights Blog Platform"

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ai_insights"

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    API_PREFIX: str = "/api/v1"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
