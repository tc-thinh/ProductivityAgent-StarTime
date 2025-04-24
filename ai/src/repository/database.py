import pydantic
from sqlalchemy.ext.asyncio import (
    async_sessionmaker as sqlalchemy_async_sessionmaker, 
    AsyncEngine as SQLAlchemyAsyncEngine,
    AsyncSession as SQLAlchemyAsyncSession,
    create_async_engine as create_sqlalchemy_async_engine,
)
from sqlalchemy.pool import Pool as SQLAlchemyPool 

from src.config.manager import settings


class AsyncDatabase:
    def __init__(self):
        self.postgres_uri: pydantic.PostgresDsn = pydantic.PostgresDsn(
            url=f"{settings.DB_POSTGRES_SCHEMA}://{settings.DB_POSTGRES_USERNAME}:{settings.DB_POSTGRES_PASSWORD}@{settings.DB_POSTGRES_HOST}:{settings.DB_POSTGRES_PORT}/{settings.DB_POSTGRES_NAME}",
        )
        self.async_engine: SQLAlchemyAsyncEngine = create_sqlalchemy_async_engine(
            url=self.set_async_db_uri,
            echo=settings.IS_DB_ECHO_LOG,
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_POOL_OVERFLOW, 
        )

        self.async_session_maker = sqlalchemy_async_sessionmaker(
            bind=self.async_engine,
            expire_on_commit=False 
        )

        self.pool: SQLAlchemyPool = self.async_engine.pool

    @property
    def set_async_db_uri(self) -> str | pydantic.PostgresDsn:
        """
        Set the synchronous database driver into asynchronous version by utilizing AsyncPG:

            `postgresql://` => `postgresql+asyncpg://`
        """
        return (
            self.postgres_uri.encoded_string().replace("postgresql://", "postgresql+asyncpg://")
            if settings.DB_POSTGRES_SCHEMA == "postgresql"
            else self.postgres_uri.encoded_string()
        )

    # Add a method to get sessions
    def get_session(self) -> SQLAlchemyAsyncSession:
        return self.async_session_maker()


async_db: AsyncDatabase = AsyncDatabase()
