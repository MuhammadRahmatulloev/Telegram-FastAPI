import os
from datetime import datetime, timedelta
from celery import Celery
from celery.schedules import crontab
from core.config import settings

celery_app = Celery(
    "tasks",
    broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

celery_app.conf.beat_schedule = {
    "cleanup-expired-tokens-daily": {
        "task": "tasks.cleanup_tasks.cleanup_expired_tokens",
        "schedule": crontab(hour=3, minute=0),
    },
    "cleanup-expired-verification-codes-hourly": {
        "task": "tasks.cleanup_tasks.cleanup_expired_verification_codes",
        "schedule": crontab(minute=0),
    },
    "cleanup-deleted-files-daily": {
        "task": "tasks.cleanup_tasks.cleanup_deleted_files",
        "schedule": crontab(hour=4, minute=0),
    },
}


@celery_app.task
def cleanup_expired_tokens():
    """Delete refresh tokens past their expiry date from the database."""
    from sqlalchemy import create_engine, delete
    from models.user import RefreshToken
    from database.db import Base

    engine = create_engine(settings.DATABASE_URL.replace("+asyncpg", ""))
    with engine.connect() as conn:
        result = conn.execute(
            delete(RefreshToken).where(RefreshToken.expires_at < datetime.utcnow())
        )
        conn.commit()
    return {"deleted_tokens": result.rowcount}


@celery_app.task
def cleanup_expired_verification_codes():
    """Delete verification codes that are past their expiry date."""
    from sqlalchemy import create_engine, delete
    from models.user import VerificationCode

    engine = create_engine(settings.DATABASE_URL.replace("+asyncpg", ""))
    with engine.connect() as conn:
        result = conn.execute(
            delete(VerificationCode).where(VerificationCode.expires_at < datetime.utcnow())
        )
        conn.commit()
    return {"deleted_codes": result.rowcount}


@celery_app.task
def cleanup_deleted_files():
    """
    Remove physical files from disk that were soft-deleted more than 7 days ago.
    """
    from sqlalchemy import create_engine, select
    from models.file import File

    cutoff = datetime.utcnow() - timedelta(days=7)
    engine = create_engine(settings.DATABASE_URL.replace("+asyncpg", ""))
    removed = 0

    with engine.connect() as conn:
        rows = conn.execute(
            select(File.file_path).where(
                File.deleted_at != None,
                File.deleted_at < cutoff
            )
        ).fetchall()

        for (path,) in rows:
            if path and os.path.exists(path):
                os.remove(path)
                removed += 1

    return {"removed_files": removed}
