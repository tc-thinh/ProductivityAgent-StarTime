import logging
import pathlib
import os 

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = pathlib.Path(os.path.dirname(os.path.abspath(__file__))).parent.parent.parent.resolve()

class BackendBaseSettings(BaseSettings):
    TITLE: str = "Normos AI Agent"
    VERSION: str = "0.1.0"
    TIMEZONE: str = "UTC"
    DESCRIPTION: str | None = None
    DEBUG: bool = False

    BACKEND_SERVER_HOST: str
    BACKEND_SERVER_PORT: int
    BACKEND_SERVER_WORKERS: int
    API_PREFIX: str = "/api"
    DOCS_URL: str = "/docs"
    OPENAPI_URL: str = "/openapi.json"
    REDOC_URL: str = "/redoc"
    OPENAPI_PREFIX: str = ""

    POSTGRES_HOST: str
    POSTGRES_DB: str
    POSTGRES_PASSWORD: str
    POSTGRES_PORT: int
    POSTGRES_SCHEMA: str
    POSTGRES_USERNAME: str

    DB_POOL_SIZE: int
    DB_POOL_OVERFLOW: int
    DB_TIMEOUT: int
    IS_DB_ECHO_LOG: bool = False

    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://0.0.0.0:3000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://0.0.0.0:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]
    ALLOWED_METHODS: list[str] = ["*"]
    ALLOWED_HEADERS: list[str] = ["*"]

    LOGGING_LEVEL: int = logging.INFO
    LOGGERS: tuple[str, str] = ("uvicorn.asgi", "uvicorn.access")

    OPENAI_API_KEY: str
    LANGFUSE_PUBLIC_KEY: str
    LANGFUSE_SECRET_KEY: str
    LANGFUSE_HOST: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    DATABASE_SERVICE: str

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=f"{str(ROOT_DIR)}/.env",
    )

    @property
    def set_backend_app_attributes(self) -> dict[str, str | bool | None]:
        return {
            "title": self.TITLE,
            "version": self.VERSION,
            "debug": self.DEBUG,
            "description": self.DESCRIPTION,
            "docs_url": self.DOCS_URL,
            "openapi_url": self.OPENAPI_URL,
            "redoc_url": self.REDOC_URL,
            "openapi_prefix": self.OPENAPI_PREFIX,
            "api_prefix": self.API_PREFIX, 
        }
