import asyncio
import logging
from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback de locks em memória caso Redis esteja offline durante desenvolvimento
_in_memory_locks: dict[str, asyncio.Lock] = {}
_in_memory_keys: set[str] = set()

_redis_pool: Optional[aioredis.Redis] = None
_redis_last_check: float = 0.0


async def get_redis() -> Optional[aioredis.Redis]:
    global _redis_pool, _redis_last_check
    import time
    now = time.time()
    # Se já tentou nos últimos 60 segundos e falhou, não tenta de novo imediatamente
    if _redis_pool is None and (now - _redis_last_check < 60.0):
        return None

    if _redis_pool is None:
        _redis_last_check = now
        try:
            client = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_timeout=0.5,
                socket_connect_timeout=0.5
            )
            await client.ping()
            _redis_pool = client
            logger.info("Conectado com sucesso ao Redis.")
        except Exception as e:
            logger.warning(f"Redis indisponível ({e}). Utilizando gerenciador de concorrência em memória.")
            _redis_pool = None
    return _redis_pool


class DistributedLock:
    """
    Lock distribuído para evitar reservas simultâneas da mesma quadra no mesmo horário.
    Usa Redis com fallback seguro para lock assíncrono em memória.
    """
    def __init__(self, key: str, ttl_seconds: int = 15):
        self.key = f"lock:arenago:{key}"
        self.ttl = ttl_seconds
        self.acquired = False
        self._redis: Optional[aioredis.Redis] = None

    async def acquire(self) -> bool:
        self._redis = await get_redis()
        if self._redis:
            try:
                # setnx com expiração atômica
                res = await self._redis.set(self.key, "1", nx=True, ex=self.ttl)
                self.acquired = bool(res)
                return self.acquired
            except Exception as e:
                logger.warning(f"Erro no Redis ao obter lock ({e}). Usando fallback.")

        # Fallback em memória
        if self.key in _in_memory_keys:
            return False
        _in_memory_keys.add(self.key)
        self.acquired = True
        return True

    async def release(self):
        if not self.acquired:
            return
        if self._redis:
            try:
                await self._redis.delete(self.key)
            except Exception:
                pass
        _in_memory_keys.discard(self.key)
        self.acquired = False

    async def __aenter__(self):
        acquired = await self.acquire()
        return acquired

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.release()
