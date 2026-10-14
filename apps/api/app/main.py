from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.services.seed_service import seed_initial_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("arenago")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Inicializando ArenaGo API...")
    # Criação das tabelas do banco
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Garantir colunas de promoções e descontos em bancos existentes
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE courts ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5, 2) DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE courts ADD COLUMN IF NOT EXISTS promo_badge VARCHAR(100);"))
            await conn.execute(text("ALTER TABLE courts ADD COLUMN IF NOT EXISTS promo_subtext VARCHAR(255);"))
        except Exception as e:
            logger.warning(f"Aviso de migração de colunas: {e}")
    logger.info("Tabelas verificadas e criadas.")

    # Popular dados de demonstração
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)

    yield

    logger.info("Finalizando conexões da API...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ArenaGo — Sua próxima partida a um clique. Marketplace de Quadras & SaaS para Gestores.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas principais
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Sistema"])
@app.get(f"{settings.API_V1_STR}/health", tags=["Sistema"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "slogan": settings.SLOGAN,
        "environment": settings.ENVIRONMENT
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
