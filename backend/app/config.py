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

    data_dir: Path = Path("./data")
    sqlite_path: Path = Path("./data/dream.db")
    upload_dir: Path = Path("./data/uploads")

    cors_origins: str = "*"  # comma separated


settings = Settings()
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.upload_dir.mkdir(parents=True, exist_ok=True)
