from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class FormCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    course_id: Optional[int] = None
    settings_json: Optional[dict[str, Any]] = None


class FormUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    course_id: Optional[int] = None
    settings_json: Optional[dict[str, Any]] = None


class FormOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    owner_id: Optional[int]
    course_id: Optional[int]
    settings_json: Optional[dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


