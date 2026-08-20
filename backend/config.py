import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:54322/postgres")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    API_PREFIX: str = "/api"

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()
