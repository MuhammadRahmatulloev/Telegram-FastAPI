from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from models.file import File
from datetime import datetime


class FileRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, owner_id: int, file_name: str, file_path: str, file_size: int, mime_type: str, thumbnail_path: str | None = None) -> File:
        file = File(
            owner_id=owner_id,
            file_name=file_name,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            thumbnail_path=thumbnail_path
        )
        self.db.add(file)
        await self.db.commit()
        await self.db.refresh(file)
        return file

    async def get_by_id(self, file_id: int) -> File | None:
        result = await self.db.execute(
            select(File).where(File.id == file_id, File.deleted_at == None)
        )
        return result.scalar_one_or_none()

    async def get_user_files(self, owner_id: int) -> list[File]:
        result = await self.db.execute(
            select(File).where(
                File.owner_id == owner_id,
                File.deleted_at == None
            )
        )
        return result.scalars().all()

    async def soft_delete(self, file_id: int):
        await self.db.execute(
            update(File).where(File.id == file_id).values(deleted_at=datetime.utcnow())
        )
        await self.db.commit()