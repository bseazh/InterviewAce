from pydantic import BaseModel
import os


class Settings(BaseModel):
    env: str = os.getenv("APP_ENV", "dev")
    debug: bool = os.getenv("APP_DEBUG", "true").lower() == "true"
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:postgres@localhost:5432/interviewace",
    )
    # Sandbox limits
    sandbox_timeout_sec: int = int(os.getenv("SANDBOX_TIMEOUT_SEC", "5"))
    sandbox_memory_mb: int = int(os.getenv("SANDBOX_MEMORY_MB", "256"))
    sandbox_cpus: float = float(os.getenv("SANDBOX_CPUS", "1"))
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]


def get_settings() -> Settings:
    return Settings()
