from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from core.permissions import get_current_user, admin_required
from schemas.user import UserResponse, UserUpdateRequest
from services.user_service import UserService
from models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = UserService(db)
    return await service.update_profile(current_user.id, data)


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = UserService(db)
    return await service.upload_avatar(current_user.id, file)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = UserService(db)
    return await service.get_user(user_id)


@router.delete("/me")
async def delete_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = UserService(db)
    return await service.delete_user(current_user.id)
