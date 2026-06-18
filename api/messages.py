from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from core.permissions import get_current_user
from schemas.message import MessageSendRequest
from services.message_service import MessageService
from models.user import User
from models.message import Message


router = APIRouter(prefix="/messages", tags=["Messages"])


def serialize_message(msg: Message) -> dict:
    return {
        "id": msg.id,
        "chat_id": msg.chat_id,
        "sender_id": msg.sender_id,
        "sender_username": msg.sender.username if msg.sender else None,
        "content": msg.content,
        "message_type": msg.message_type.value if msg.message_type else "text",
        "file_id": msg.file_id,
        "is_edited": msg.is_edited,
        "is_read": msg.is_read,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


@router.post("/")
async def send_message(
    data: MessageSendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    msg = await service.send_message(data, current_user.id)
    return serialize_message(msg)


@router.get("/chat/{chat_id}")
async def get_messages(
    chat_id: int,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    messages = await service.get_chat_messages(chat_id, current_user.id, limit, offset)
    return [serialize_message(m) for m in messages]


@router.put("/{message_id}")
async def edit_message(
    message_id: int,
    content: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    msg = await service.edit_message(message_id, content, current_user.id)
    return serialize_message(msg)


@router.post("/{message_id}/read")
async def mark_as_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    return await service.mark_as_read(message_id, current_user.id)


@router.delete("/{message_id}")
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    return await service.delete_message(message_id, current_user.id)