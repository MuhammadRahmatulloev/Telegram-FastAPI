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
    bio: str | None = None
    birthday: str | None = None
    phone: str | None = None
    name_color: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    username: str | None = None
    avatar: str | None = None
    bio: str | None = None
    birthday: str | None = None
    phone: str | None = None
    name_color: str | None = None