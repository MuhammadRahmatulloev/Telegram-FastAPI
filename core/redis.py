from redis.asyncio import Redis
from core.config import settings

redis_client: Redis = None

async def get_redis() -> Redis:
    return redis_client

async def init_redis():
    global redis_client
    redis_client = Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        decode_responses=True
    )

async def close_redis():
    if redis_client:
        await redis_client.close()