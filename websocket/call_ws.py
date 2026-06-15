from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from core.security import decode_token
from core.websocket import manager
import json

router = APIRouter(tags=["Call WebSocket"])

SIGNAL_EVENTS = {"offer", "answer", "ice_candidate", "call_end", "call_reject"}


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

            # Forward the signal to the target user
            signal = {
                "event": event,
                "from_user_id": user_id,
                "data": data.get("data")  # SDP / ICE candidate / call type etc.
            }
            delivered = await manager.send_to_user(target_user_id, signal)

            if not delivered:
                await websocket.send_text(json.dumps({
                    "event": "user_unavailable",
                    "target_user_id": target_user_id
                }))

    except WebSocketDisconnect:
        manager.disconnect_from_call(user_id)
