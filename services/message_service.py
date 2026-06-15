from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.message_repo import MessageRepository
from repositories.chat_repo import ChatRepository
from schemas.message import MessageSendRequest


class MessageService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.message_repo = MessageRepository(db)
        self.chat_repo = ChatRepository(db)

    async def _check_membership(self, chat_id: int, user_id: int):
        member = await self.chat_repo.get_member(chat_id, user_id)
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this chat"
            )

    async def send_message(self, data: MessageSendRequest, sender_id: int):
        chat = await self.chat_repo.get_by_id(data.chat_id)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        await self._check_membership(data.chat_id, sender_id)

        if not data.content and not data.file_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message must have content or a file"
            )

        return await self.message_repo.create(
            chat_id=data.chat_id,
            sender_id=sender_id,
            content=data.content,
            message_type=data.message_type,
            file_id=data.file_id,
            reply_to_id=data.reply_to_id
        )

    async def get_chat_messages(self, chat_id: int, user_id: int, limit: int, offset: int):
        chat = await self.chat_repo.get_by_id(chat_id)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        await self._check_membership(chat_id, user_id)
        return await self.message_repo.get_chat_messages(chat_id, limit, offset)

    async def edit_message(self, message_id: int, content: str, user_id: int):
        message = await self.message_repo.get_by_id(message_id)
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        if message.sender_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit your own messages"
            )
        return await self.message_repo.update(message_id, content)

    async def mark_as_read(self, message_id: int, user_id: int):
        message = await self.message_repo.get_by_id(message_id)
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        await self._check_membership(message.chat_id, user_id)
        await self.message_repo.mark_as_read(message_id)
        return {"message": "Message marked as read"}

    async def delete_message(self, message_id: int, user_id: int):
        message = await self.message_repo.get_by_id(message_id)
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        if message.sender_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own messages"
            )
        await self.message_repo.soft_delete(message_id)
        return {"message": "Message deleted"}
