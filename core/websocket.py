from fastapi import WebSocket
from typing import Dict, Set
import json


class ConnectionManager:
    def __init__(self):
        self.chat_connections: Dict[int, Set[WebSocket]] = {}
        self.call_connections: Dict[int, WebSocket] = {}

    async def connect_to_chat(self, websocket: WebSocket, chat_id: int):
        await websocket.accept()
        if chat_id not in self.chat_connections:
            self.chat_connections[chat_id] = set()
        self.chat_connections[chat_id].add(websocket)

    def disconnect_from_chat(self, websocket: WebSocket, chat_id: int):
        if chat_id in self.chat_connections:
            self.chat_connections[chat_id].discard(websocket)
            if not self.chat_connections[chat_id]:
                del self.chat_connections[chat_id]

    async def broadcast_to_chat(self, chat_id: int, message: dict, exclude: WebSocket = None):
        if chat_id not in self.chat_connections:
            return
        dead = set()
        for connection in self.chat_connections[chat_id]:
            if connection is exclude:
                continue
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead.add(connection)
        for conn in dead:
            self.chat_connections[chat_id].discard(conn)

    # ── Call connections ──────────────────────────────────────────────────────

    async def connect_to_call(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.call_connections[user_id] = websocket

    def disconnect_from_call(self, user_id: int):
        self.call_connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, message: dict) -> bool:
        """Send a signal to a specific user. Returns False if user is offline."""
        websocket = self.call_connections.get(user_id)
        if not websocket:
            return False
        try:
            await websocket.send_text(json.dumps(message))
            return True
        except Exception:
            self.disconnect_from_call(user_id)
            return False

    def is_user_online(self, user_id: int) -> bool:
        return user_id in self.call_connections


manager = ConnectionManager()
