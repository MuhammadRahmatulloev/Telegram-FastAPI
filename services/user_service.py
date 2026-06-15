import os
import uuid
import aiofiles
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.user_repo import UserRepository
from schemas.user import UserUpdateRequest

AVATAR_DIR = "avatars"


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_user(self, user_id: int):
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user

    async def update_profile(self, user_id: int, data: UserUpdateRequest):
        update_data = data.model_dump(exclude_none=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        if "username" in update_data:
            existing = await self.user_repo.get_by_username(update_data["username"])
            if existing and existing.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )

        user = await self.user_repo.update(user_id, **update_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user

    async def upload_avatar(self, user_id: int, upload: UploadFile):
        allowed = {"image/jpeg", "image/png", "image/webp"}
        if upload.content_type not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Avatar must be JPEG, PNG, or WebP"
            )

        content = await upload.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Avatar must be under 5 MB"
            )

        os.makedirs(AVATAR_DIR, exist_ok=True)
        ext = os.path.splitext(upload.filename or "avatar.jpg")[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        path = os.path.join(AVATAR_DIR, filename)

        async with aiofiles.open(path, "wb") as f:
            await f.write(content)

        user = await self.user_repo.update(user_id, avatar=path)
        return user

    async def delete_user(self, user_id: int):
        await self.user_repo.soft_delete(user_id)
        return {"message": "Account deleted successfully"}
