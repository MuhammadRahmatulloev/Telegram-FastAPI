from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from core.security import decode_token
from core.websocket import manager
from database.db import SessionLocal
from models.call import Call, CallStatus, CallType
from models.chat import Chat, ChatMember
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
import json
from datetime import datetime, timezone

router = APIRouter(tags=["Call WebSocket"])

SIGNAL_EVENTS = {"offer", "answer", "ice_candidate", "call_end", "call_reject"}


async def get_private_chat_id(db: AsyncSession, user_id: int, target_user_id: int) -> int | None:
    """Найти id приватного чата между двумя пользователями."""
    result = await db.execute(
        select(Chat)
        .join(ChatMember, ChatMember.chat_id == Chat.id)
        .where(
            Chat.chat_type == "private",
            ChatMember.user_id == user_id
        )
    )
    chats = result.scalars().all()
    for chat in chats:
        members_result = await db.execute(
            select(ChatMember).where(ChatMember.chat_id == chat.id)
        )
        members = members_result.scalars().all()
        member_ids = {m.user_id for m in members}
        if target_user_id in member_ids:
            return chat.id
    return None


async def save_call(
    caller_id: int,
    target_user_id: int,
    call_type_str: str,
    status: CallStatus,
    started_at: datetime,
    ended_at: datetime | None = None,
):
    """Сохранить запись о звонке в БД."""
    async with SessionLocal() as db:
        chat_id = await get_private_chat_id(db, caller_id, target_user_id)
        if not chat_id:
            return 

        call_type = CallType.VIDEO if call_type_str == "video" else CallType.AUDIO
        call = Call(
            chat_id=chat_id,
            started_by=caller_id,
            call_type=call_type,
            status=status,
            started_at=started_at,
            ended_at=ended_at or datetime.now(timezone.utc),
        )
        db.add(call)
        await db.commit()


@router.websocket("/ws/call")
async def call_websocket(
    websocket: WebSocket,
    token: str = Query(...)
):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=4001, reason="Unauthorized")
        return

    user_id = int(payload.get("sub"))
    await manager.connect_to_call(websocket, user_id)

    active_outgoing: dict[int, dict] = {}

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON"}))
                continue

            event = data.get("event")
            target_user_id = data.get("target_user_id")

            if not event or not target_user_id:
                await websocket.send_text(json.dumps({"error": "Missing event or target_user_id"}))
                continue

            if event not in SIGNAL_EVENTS and event != "call_request":
                await websocket.send_text(json.dumps({"error": f"Unknown event: {event}"}))
                continue

            # Запоминаем исходящий звонок
            if event == "call_request":
                call_data = data.get("data") or {}
                active_outgoing[target_user_id] = {
                    "call_type": call_data.get("call_type", "audio"),
                    "started_at": datetime.now(timezone.utc),
                }

            elif event == "answer":
                if target_user_id in active_outgoing:
                    active_outgoing[target_user_id]["accepted"] = True

            elif event == "call_end":
                if target_user_id in active_outgoing:
                    info = active_outgoing.pop(target_user_id)
                    status = CallStatus.ENDED if info.get("accepted") else CallStatus.MISSED
                    await save_call(
                        caller_id=user_id,
                        target_user_id=target_user_id,
                        call_type_str=info["call_type"],
                        status=status,
                        started_at=info["started_at"],
                    )

            elif event == "call_reject":
                if target_user_id in active_outgoing:
                    info = active_outgoing.pop(target_user_id)
                    await save_call(
                        caller_id=user_id,
                        target_user_id=target_user_id,
                        call_type_str=info["call_type"],
                        status=CallStatus.REJECTED,
                        started_at=info["started_at"],
                    )

            signal = {
                "event": event,
                "from_user_id": user_id,
                "data": data.get("data"),
            }
            await manager.send_to_user(target_user_id, signal)

    except WebSocketDisconnect:
        manager.disconnect_from_call(user_id)
        for tid, info in active_outgoing.items():
            await save_call(
                caller_id=user_id,
                target_user_id=tid,
                call_type_str=info["call_type"],
                status=CallStatus.MISSED,
                started_at=info["started_at"],
            )