from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from models.message import Message
from datetime import datetime


class MessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, chat_id: int, sender_id: int, content: str | None, message_type: str, file_id: int | None = None, reply_to_id: int | None = None) -> Message:
        message = Message(
            chat_id=chat_id,
            sender_id=sender_id,
            content=content,
            message_type=message_type,
            file_id=file_id,
            reply_to_id=reply_to_id
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        # Reload with sender for username
        return await self.get_by_id(message.id)

    async def get_by_id(self, message_id: int) -> Message | None:
        result = await self.db.execute(
            select(Message)
            .options(selectinload(Message.sender))
            .where(Message.id == message_id, Message.deleted_at == None)
        )
        return result.scalar_one_or_none()

    async def get_chat_messages(self, chat_id: int, limit: int = 50, offset: int = 0) -> list[Message]:
        result = await self.db.execute(
            select(Message)
            .options(selectinload(Message.sender))
            .where(
                Message.chat_id == chat_id,
                Message.deleted_at == None
            ).order_by(Message.created_at.asc()).limit(limit).offset(offset)
        )
        return result.scalars().all()

    async def update(self, message_id: int, content: str) -> Message | None:
        await self.db.execute(
            update(Message).where(Message.id == message_id).values(
                content=content,
                is_edited=True
            )
        )
        await self.db.commit()
        return await self.get_by_id(message_id)

    async def mark_as_read(self, message_id: int):
        await self.db.execute(
            update(Message).where(Message.id == message_id).values(is_read=True)
        )
        await self.db.commit()

    async def soft_delete(self, message_id: int):
        await self.db.execute(
            update(Message).where(Message.id == message_id).values(deleted_at=datetime.utcnow())
        )
        await self.db.commit()