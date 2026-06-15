from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from core.permissions import get_current_user
from schemas.message import MessageSendRequest, MessageResponse
from services.message_service import MessageService
from models.user import User

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageResponse)
async def send_message(
    data: MessageSendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    return await service.send_message(data, current_user.id)


@router.get("/chat/{chat_id}", response_model=list[MessageResponse])
async def get_messages(
    chat_id: int,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    return await service.get_chat_messages(chat_id, current_user.id, limit, offset)


@router.put("/{message_id}", response_model=MessageResponse)
async def edit_message(
    message_id: int,
    content: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    return await service.edit_message(message_id, content, current_user.id)


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
