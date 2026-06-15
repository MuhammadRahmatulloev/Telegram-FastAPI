from pydantic import BaseModel, EmailStr
from datetime import datetime
from models.user import Role


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_verified: bool
    role: Role
    avatar: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    username: str | None = None
    avatar: str | None = None