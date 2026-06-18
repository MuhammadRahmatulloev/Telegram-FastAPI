from pydantic import BaseModel
from datetime import datetime
from models.message import MessageType


class MessageSendRequest(BaseModel):
    chat_id: int
    content: str | None = None
    message_type: MessageType = MessageType.TEXT
    file_id: int | None = None
    reply_to_id: int | None = None


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    sender_id: int
    sender_username: str | None = None
    content: str | None
    message_type: MessageType
    file_id: int | None = None
    is_edited: bool
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True