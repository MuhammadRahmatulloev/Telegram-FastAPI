import os
import uuid
import aiofiles
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.file_repo import FileRepository

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024
ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/webm",
    "audio/mpeg", "audio/ogg", "audio/wav",
    "application/pdf",
    "application/zip",
    "text/plain",
}


class FileService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.file_repo = FileRepository(db)

    async def upload_file(self, upload: UploadFile, owner_id: int):
        if upload.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type '{upload.content_type}' is not allowed"
            )

        content = await upload.read()
        file_size = len(content)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File exceeds the 50 MB size limit"
            )

        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(upload.filename or "file")[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        file = await self.file_repo.create(
            owner_id=owner_id,
            file_name=upload.filename or unique_name,
            file_path=file_path,
            file_size=file_size,
            mime_type=upload.content_type,
        )
        return file

    async def get_file(self, file_id: int, user_id: int):
        file = await self.file_repo.get_by_id(file_id)
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        return file

    async def get_user_files(self, owner_id: int):
        return await self.file_repo.get_user_files(owner_id)

    async def delete_file(self, file_id: int, user_id: int):
        file = await self.file_repo.get_by_id(file_id)
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        if file.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own files"
            )
        # Remove from disk
        if os.path.exists(file.file_path):
            os.remove(file.file_path)

        await self.file_repo.soft_delete(file_id)
        return {"message": "File deleted successfully"}
