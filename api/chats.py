from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from core.permissions import get_current_user
from schemas.chat import ChatCreateRequest, ChatResponse
from services.chat_service import ChatService
from models.user import User

router = APIRouter(prefix="/chats", tags=["Chats"])


@router.post("/", response_model=ChatResponse)
async def create_chat(
    data: ChatCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ChatService(db)
    return await service.create_chat(data, current_user.id)


@router.get("/", response_model=list[ChatResponse])
async def get_my_chats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ChatService(db)
    return await service.get_user_chats(current_user.id)


@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ChatService(db)
    return await service.get_chat(chat_id, current_user.id)


@router.post("/{chat_id}/members/{user_id}")
async def add_member(
    chat_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ChatService(db)
    return await service.add_member(chat_id, user_id, current_user.id)


@router.delete("/{chat_id}/members/{user_id}")
async def remove_member(
    chat_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ChatService(db)
    return await service.remove_member(chat_id, user_id, current_user.id)


@router.delete("/{chat_id}/leave")
async def leave_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ChatService(db)
    return await service.leave_chat(chat_id, current_user.id)


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ChatService(db)
    return await service.delete_chat(chat_id, current_user.id)
