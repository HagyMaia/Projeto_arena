from typing import AsyncGenerator
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


def parse_database_url(raw_url: str):
    """
    Normaliza a URL do banco para suporte universal:
    - Converte 'postgres://' e 'postgresql://' para 'postgresql+asyncpg://'
    - Trata SSL para o asyncpg (requerido pelo Neon.tech e cloud DBs)
    - Remove parâmetros específicos de libpq (sslmode, channel_binding) que não são aceitos pelo asyncpg
    """
    url = raw_url
    connect_args = {}

    if "sqlite" in url:
        connect_args["check_same_thread"] = False
        return url, connect_args

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    parsed = urlparse(url)

    if "neon.tech" in parsed.netloc or "sslmode" in parsed.query or "channel_binding" in parsed.query:
        connect_args["ssl"] = True

    # asyncpg não aceita parâmetros de libpq psql na URL (ex: channel_binding, sslmode)
    clean_url = urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        "",
        "",
        ""
    ))

    return clean_url, connect_args


db_url, connect_args = parse_database_url(settings.DATABASE_URL)

# Engine assíncrona compatível com PostgreSQL (asyncpg) e SQLite (aiosqlite)
engine = create_async_engine(
    db_url,
    echo=settings.ENVIRONMENT == "development",
    future=True,
    connect_args=connect_args,
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
