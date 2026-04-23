from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Dream Guardian API"
    jwt_secret: str = "change-me-in-prod-32-bytes-min-xxxxxxxxxxxx"
    jwt_algorithm: str = "HS256"
    jwt_ttl_hours: int = 24 * 7

    admin_username: str = "admin"
    admin_password: str = "123456"

    # Prefer /data (Fly.io persistent volume mount) when available, else ./data (local dev)
    data_dir: Path = Path("/data") if Path("/data").is_dir() else Path("./data")

    cors_origins: str = "*"  # comma separated

    @property
    def sqlite_path(self) -> Path:
        return self.data_dir / "dream.db"

    @property
    def upload_dir(self) -> Path:
        return self.data_dir / "uploads"


settings = Settings()
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.upload_dir.mkdir(parents=True, exist_ok=True)
