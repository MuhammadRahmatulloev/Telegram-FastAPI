from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import SessionLocal
from core.security import decode_token
from core.websocket import manager
from repositories.chat_repo import ChatRepository
from repositories.message_repo import MessageRepository
from models.message import MessageType
import json

router = APIRouter(tags=["Chat WebSocket"])


@router.websocket("/ws/chat/{chat_id}")
async def chat_websocket(
    websocket: WebSocket,
    chat_id: int,
    token: str = Query(...)
):
    token_payload = decode_token(token)
    if not token_payload or token_payload.get("type") != "access":
        await websocket.close(code=4001, reason="Unauthorized")
        return

    user_id = int(token_payload.get("sub"))

    async with SessionLocal() as db:
        chat_repo = ChatRepository(db)
        member = await chat_repo.get_member(chat_id, user_id)
        if not member:
            await websocket.close(code=4003, reason="Not a member of this chat")
            return

    await manager.connect_to_chat(websocket, chat_id)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                incoming = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "event": "error",
                    "data": {"message": "Invalid JSON"}
                }))
                continue

            event = incoming.get("event")
            payload = incoming.get("data") or {}

            if event == "send_message":
                content = (payload.get("content") or "").strip()
                if not content:
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "data": {"message": "Empty message"}
                    }))
                    continue

                async with SessionLocal() as db:
                    message_repo = MessageRepository(db)
                    message = await message_repo.create(
                        chat_id=chat_id,
                        sender_id=user_id,
                        content=content,
                        message_type=MessageType.TEXT,
                        reply_to_id=payload.get("reply_to_id")
                    )

                payload_out = {
                    "event": "new_message",
                    "data": {
                        "id": message.id,
                        "chat_id": chat_id,
                        "sender_id": user_id,
                        "content": content,
                        "message_type": MessageType.TEXT,
                        "reply_to_id": message.reply_to_id,
                        "created_at": message.created_at.isoformat(),
                    }
                }
                await manager.broadcast_to_chat(chat_id, payload_out)

            elif event == "typing":
                is_typing = bool(payload.get("is_typing", False))
                await manager.broadcast_to_chat(
                    chat_id,
                    {
                        "event": "typing",
                        "data": {"user_id": user_id, "is_typing": is_typing}
                    },
                    exclude=websocket
                )

            else:
                await websocket.send_text(json.dumps({
                    "event": "error",
                    "data": {"message": f"Unknown event: {event}"}
                }))

    except WebSocketDisconnect:
        manager.disconnect_from_chat(websocket, chat_id)
        await manager.broadcast_to_chat(
            chat_id,
            {"event": "user_left", "data": {"user_id": user_id}}
        )