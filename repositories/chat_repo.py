from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from sqlalchemy.orm import aliased
from models.chat import Chat, ChatMember, ChatType
from datetime import datetime


class ChatRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, title: str | None, chat_type: ChatType, created_by: int) -> Chat:
        chat = Chat(title=title, chat_type=chat_type, created_by=created_by)
        self.db.add(chat)
        await self.db.commit()
        await self.db.refresh(chat)
        return chat

    async def find_private_chat(self, user_a: int, user_b: int) -> Chat | None:
        cm1 = aliased(ChatMember)
        cm2 = aliased(ChatMember)
        result = await self.db.execute(
            select(Chat)
            .join(cm1, and_(cm1.chat_id == Chat.id, cm1.user_id == user_a, cm1.left_at == None))
            .join(cm2, and_(cm2.chat_id == Chat.id, cm2.user_id == user_b, cm2.left_at == None))
            .where(Chat.chat_type == ChatType.PRIVATE, Chat.deleted_at == None)
        )
        return result.scalars().first()

    async def get_by_id(self, chat_id: int) -> Chat | None:
        result = await self.db.execute(
            select(Chat).where(Chat.id == chat_id, Chat.deleted_at == None)
        )
        return result.scalar_one_or_none()

    async def get_user_chats(self, user_id: int) -> list[Chat]:
        result = await self.db.execute(
            select(Chat).join(ChatMember).where(
                ChatMember.user_id == user_id,
                ChatMember.left_at == None,
                Chat.deleted_at == None
            )
        )
        return result.scalars().all()

    async def soft_delete(self, chat_id: int):
        await self.db.execute(
            update(Chat).where(Chat.id == chat_id).values(deleted_at=datetime.utcnow())
        )
        await self.db.commit()

    async def add_member(self, chat_id: int, user_id: int, is_admin: bool = False) -> ChatMember:
        member = ChatMember(chat_id=chat_id, user_id=user_id, is_admin=is_admin)
        self.db.add(member)
        await self.db.commit()
        await self.db.refresh(member)
        return member

    async def get_member(self, chat_id: int, user_id: int) -> ChatMember | None:
        result = await self.db.execute(
            select(ChatMember).where(
                ChatMember.chat_id == chat_id,
                ChatMember.user_id == user_id,
                ChatMember.left_at == None
            )
        )
        return result.scalar_one_or_none()

    async def get_members(self, chat_id: int) -> list[ChatMember]:
        result = await self.db.execute(
            select(ChatMember).where(
                ChatMember.chat_id == chat_id,
                ChatMember.left_at == None
            )
        )
        return result.scalars().all()

    async def remove_member(self, chat_id: int, user_id: int):
        await self.db.execute(
            update(ChatMember).where(
                ChatMember.chat_id == chat_id,
                ChatMember.user_id == user_id
            ).values(left_at=datetime.utcnow())
        )
        await self.db.commit()