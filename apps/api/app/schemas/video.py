from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class VideoOut(BaseModel):
    id: int
    storage_key: str
    duration: Optional[int]
    lang: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


