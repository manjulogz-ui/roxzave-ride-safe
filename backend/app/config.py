from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./roxzave.db"
    database_url_sync: str = "sqlite:///./roxzave.db"
    use_sqlite: bool = True
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret_key: str = "dev-secret-change-in-production-min-32-chars"
    jwt_refresh_secret_key: str = "dev-refresh-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    cors_origins: str = (
        "http://localhost:5173,http://localhost:8080,http://localhost:3000,"
        "http://127.0.0.1:8080,http://127.0.0.1:5173,capacitor://localhost,http://localhost"
    )
    environment: str = "development"
    google_maps_api_key: str = ""
    mapbox_access_token: str = ""
    graphhopper_api_key: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.use_sqlite or self.database_url.startswith("sqlite")


settings = Settings()
