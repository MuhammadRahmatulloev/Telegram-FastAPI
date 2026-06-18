from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.chat_repo import ChatRepository
from repositories.user_repo import UserRepository
from schemas.chat import ChatCreateRequest
from models.chat import ChatType


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.chat_repo = ChatRepository(db)
        self.user_repo = UserRepository(db)

    async def create_chat(self, data: ChatCreateRequest, creator_id: int):
        if data.chat_type == ChatType.PRIVATE and len(data.member_ids) == 1:
            other_id = data.member_ids[0]
            existing = await self.chat_repo.find_private_chat(creator_id, other_id)
            if existing:
                return await self._with_display_title(existing, creator_id)

        chat = await self.chat_repo.create(
            title=data.title,
            chat_type=data.chat_type,
            created_by=creator_id
        )
        await self.chat_repo.add_member(chat.id, creator_id, is_admin=True)

        for user_id in data.member_ids:
            if user_id == creator_id:
                continue
            user = await self.user_repo.get_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User {user_id} not found"
                )
            await self.chat_repo.add_member(chat.id, user_id, is_admin=False)

        return await self._with_display_title(chat, creator_id)

    async def _with_display_title(self, chat, viewer_id: int):
        """For private chats with no explicit title, show the other participant's name instead of null/'Unknown',
        and attach their id so the frontend knows who to call."""
        if chat.chat_type == ChatType.PRIVATE:
            members = await self.chat_repo.get_members(chat.id)
            other = next((m for m in members if m.user_id != viewer_id), None)
            if other:
                chat.other_user_id = other.user_id
                if not chat.title:
                    other_user = await self.user_repo.get_by_id(other.user_id)
                    if other_user:
                        chat.title = other_user.username
        return chat

    async def get_chat(self, chat_id: int, user_id: int):
        chat = await self.chat_repo.get_by_id(chat_id)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        member = await self.chat_repo.get_member(chat_id, user_id)
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this chat"
            )
        return await self._with_display_title(chat, user_id)

    async def get_user_chats(self, user_id: int):
        chats = await self.chat_repo.get_user_chats(user_id)
        return [await self._with_display_title(chat, user_id) for chat in chats]

    async def add_member(self, chat_id: int, user_id: int, requester_id: int):
        chat = await self.chat_repo.get_by_id(chat_id)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        requester = await self.chat_repo.get_member(chat_id, requester_id)
        if not requester or not requester.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can add members"
            )
        existing = await self.chat_repo.get_member(chat_id, user_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member"
            )
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        await self.chat_repo.add_member(chat_id, user_id)
        return {"message": "Member added successfully"}

    async def remove_member(self, chat_id: int, user_id: int, requester_id: int):
        chat = await self.chat_repo.get_by_id(chat_id)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        requester = await self.chat_repo.get_member(chat_id, requester_id)
        if not requester or not requester.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can remove members"
            )
        if user_id == requester_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove yourself. Use /leave instead"
            )
        await self.chat_repo.remove_member(chat_id, user_id)
        return {"message": "Member removed successfully"}

    async def leave_chat(self, chat_id: int, user_id: int):
        member = await self.chat_repo.get_member(chat_id, user_id)
        if not member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are not a member of this chat"
            )
        await self.chat_repo.remove_member(chat_id, user_id)
        return {"message": "Left chat successfully"}

    async def delete_chat(self, chat_id: int, user_id: int):
        chat = await self.chat_repo.get_by_id(chat_id)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        if chat.created_by != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the creator can delete this chat"
            )
        await self.chat_repo.soft_delete(chat_id)
        return {"message": "Chat deleted successfully"}