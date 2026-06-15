from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from core.permissions import get_current_user
from services.file_service import FileService
from models.user import User

router = APIRouter(prefix="/files", tags=["Files"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FileService(db)
    return await service.upload_file(file, current_user.id)


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
