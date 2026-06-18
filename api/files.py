import os
from fastapi import APIRouter, Depends
from fastapi import UploadFile, File as FastAPIFile
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from core.permissions import get_current_user
from services.file_service import FileService
from models.user import User
from repositories.file_repo import FileRepository
from fastapi import HTTPException, status

router = APIRouter(prefix="/files", tags=["Files"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FileService(db)
    return await service.upload_file(file, current_user.id)


@router.get("/serve/{file_id}")
async def serve_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Стримим файл напрямую (нужно для воспроизведения аудио в браузере)."""
    repo = FileRepository(db)
    file = await repo.get_by_id(file_id)
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    if not os.path.exists(file.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on disk")

    return FileResponse(
        path=file.file_path,
        media_type=file.mime_type,
        filename=file.file_name,
        headers={"Accept-Ranges": "bytes"},
    )


@router.get("/{file_id}")
async def get_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FileService(db)
    return await service.get_file(file_id, current_user.id)


@router.get("/")
async def get_my_files(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FileService(db)
    return await service.get_user_files(current_user.id)


@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FileService(db)
    return await service.delete_file(file_id, current_user.id)