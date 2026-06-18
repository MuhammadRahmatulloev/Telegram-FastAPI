from pydantic import BaseModel
from datetime import datetime
from models.chat import ChatType


class ChatCreateRequest(BaseModel):
    title: str | None = None
    chat_type: ChatType
    member_ids: list[int]


class ChatResponse(BaseModel):
    id: int
    title: str | None
    chat_type: ChatType
    created_by: int | None
    created_at: datetime
    other_user_id: int | None = None

    class Config:
        from_attributes = True