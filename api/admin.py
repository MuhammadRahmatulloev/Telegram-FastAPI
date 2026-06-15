from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.db import get_db
from core.permissions import admin_required
from schemas.user import UserResponse
from models.user import User, Role
from repositories.user_repo import UserRepository
from repositories.chat_repo import ChatRepository

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserResponse])
async def get_all_users(
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    current_user: User = Depends(admin_required),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.deleted_at == None).limit(limit).offset(offset)
    )
    return result.scalars().all()


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(admin_required),
    db: AsyncSession = Depends(get_db)
):
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await repo.soft_delete(user_id)
    return {"message": f"User {user_id} deleted"}


@router.post("/users/{user_id}/make-admin", response_model=UserResponse)
async def make_admin(
    user_id: int,
    current_user: User = Depends(admin_required),
    db: AsyncSession = Depends(get_db)
):
    repo = UserRepository(db)
    user = await repo.update(user_id, role=Role.ADMIN)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/users/{user_id}/revoke-admin", response_model=UserResponse)
async def revoke_admin(
    user_id: int,
    current_user: User = Depends(admin_required),
    db: AsyncSession = Depends(get_db)
):
    repo = UserRepository(db)
    user = await repo.update(user_id, role=Role.USER)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(admin_required),
    db: AsyncSession = Depends(get_db)
):
    total_users = await db.execute(
        select(func.count()).where(User.deleted_at == None)
    )
    verified_users = await db.execute(
        select(func.count()).where(User.deleted_at == None, User.is_verified == True)
    )
    return {
        "total_users": total_users.scalar(),
        "verified_users": verified_users.scalar(),
    }
