from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from os import getenv
from dotenv import load_dotenv


load_dotenv()


DATABASE_URL = getenv("DATABASE_URL")


engine = create_async_engine(
    DATABASE_URL,
    echo=True
)


SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with SessionLocal() as session:
        yield session