import json
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, channel: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.setdefault(channel, []).append(websocket)

    def disconnect(self, channel: str, websocket: WebSocket) -> None:
        if channel in self.active:
            self.active[channel] = [ws for ws in self.active[channel] if ws != websocket]

    async def broadcast(self, channel: str, message: dict[str, Any]) -> None:
        payload = json.dumps(message)
        for ws in self.active.get(channel, []):
            try:
                await ws.send_text(payload)
            except Exception:
                pass


manager = ConnectionManager()
