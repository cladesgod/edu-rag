import asyncio
import time
from typing import AsyncGenerator, Dict

from fastapi import APIRouter, Depends, Query, Request, WebSocket, WebSocketDisconnect, status
from sse_starlette.sse import EventSourceResponse


router = APIRouter(prefix="/realtime", tags=["realtime"])


# Simple in-memory throttle state (per-process)
_last_event_ts: Dict[str, float] = {}
_lock = asyncio.Lock()
THROTTLE_WINDOW_SECONDS = 0.6  # 600ms


async def _throttle(key: str) -> None:
    async with _lock:
        now = time.monotonic()
        last = _last_event_ts.get(key, 0.0)
        delta = now - last
        if delta < THROTTLE_WINDOW_SECONDS:
            await asyncio.sleep(THROTTLE_WINDOW_SECONDS - delta)
        _last_event_ts[key] = time.monotonic()


@router.get("/hint")
async def hint_sse(request: Request, text: str = Query("")) -> EventSourceResponse:
    client_key = request.client.host if request.client else "anon"

    async def event_generator() -> AsyncGenerator[dict, None]:
        await _throttle(f"sse:{client_key}")

        # Demo: 3-stage nudge without revealing answer
        stages = [
            "Düşün: Soru ne istiyor? Ana kavramı belirle.",
            "İpucu: Verilenleri yaz ve aradığını sembolleştir.",
            "Yönlendirme: Bir önceki adımı kontrol et ve küçük bir örnek dene.",
        ]

        for idx, msg in enumerate(stages, start=1):
            if await request.is_disconnected():
                break
            yield {"event": "hint", "data": msg}
            await asyncio.sleep(0.4)

        # Echo last truncated user text as context acknowledgement
        preview = (text or "").strip()
        if preview:
            preview = (preview[:60] + "…") if len(preview) > 60 else preview
            yield {"event": "context", "data": f"Gelen metin: {preview}"}

    return EventSourceResponse(event_generator(), ping=15000)


@router.websocket("/ws/hint")
async def hint_ws(ws: WebSocket) -> None:
    await ws.accept()
    client_key = "ws:client"
    try:
        while True:
            payload = await ws.receive_json()
            text = (payload.get("text") or "").strip()

            await _throttle(client_key)

            # Stream 3 lightweight messages
            stages = [
                "Önce kavramı düşün.",
                "Verilenleri düzenle.",
                "Bir ara adım dene.",
            ]
            for msg in stages:
                await ws.send_json({"event": "hint", "data": msg})
                await asyncio.sleep(0.3)

            if text:
                preview = (text[:60] + "…") if len(text) > 60 else text
                await ws.send_json({"event": "context", "data": f"Gelen metin: {preview}"})
    except WebSocketDisconnect:
        return


