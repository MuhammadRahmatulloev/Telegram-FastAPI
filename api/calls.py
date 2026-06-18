from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database.db import get_db
from models.call import Call
from models.user import User
from core.security import decode_token
from fastapi import Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security

router = APIRouter(prefix="/calls", tags=["Calls"])
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(HTTPBearer()),
    db: AsyncSession = Depends(get_db),
):
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = int(payload.get("sub"))
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/history")
async def get_call_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Возвращает историю звонков текущего пользователя.
    Включает звонки где он был инициатором или участником чата.
    """
    from models.chat import ChatMember
    from sqlalchemy import or_

    members_result = await db.execute(
        select(ChatMember.chat_id).where(ChatMember.user_id == current_user.id)
    )
    chat_ids = [row[0] for row in members_result.all()]

    if not chat_ids:
        return []

    calls_result = await db.execute(
        select(Call)
        .options(selectinload(Call.started_by_user))
        .where(Call.chat_id.in_(chat_ids))
        .order_by(Call.started_at.desc())
        .limit(50)
    )
    calls = calls_result.scalars().all()

    result = []
    for call in calls:
        caller = call.started_by_user
        is_outgoing = call.started_by == current_user.id

        other_member_result = await db.execute(
            select(ChatMember).where(
                ChatMember.chat_id == call.chat_id,
                ChatMember.user_id != current_user.id,
            )
        )
        other_member = other_member_result.scalar_one_or_none()
        other_user = None
        if other_member:
            user_res = await db.execute(select(User).where(User.id == other_member.user_id))
            other_user = user_res.scalar_one_or_none()

        peer_name = other_user.username if other_user else (caller.username if not is_outgoing else "Unknown")

        result.append({
            "id": call.id,
            "peer_username": peer_name,
            "call_type": call.call_type.value,
            "status": call.status.value,
            "is_outgoing": is_outgoing,
            "started_at": call.started_at.isoformat() if call.started_at else None,
            "ended_at": call.ended_at.isoformat() if call.ended_at else None,
        })

    return result