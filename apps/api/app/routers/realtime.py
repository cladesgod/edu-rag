from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse


router = APIRouter(prefix="/realtime", tags=["realtime"])


@router.get("/hint")
async def hint_stream() -> EventSourceResponse:
    async def generator():
        yield {"event": "hint", "data": "streaming not implemented"}

    return EventSourceResponse(generator())


