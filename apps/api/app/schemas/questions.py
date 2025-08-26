from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


QuestionType = Literal["mcq", "short", "open", "numeric"]


class QuestionCreate(BaseModel):
    form_id: int
    type: QuestionType
    prompt: str = Field(min_length=1)
    rubric_id: Optional[int] = None
    metadata_json: Optional[dict[str, Any]] = None


class QuestionUpdate(BaseModel):
    type: Optional[QuestionType] = None
    prompt: Optional[str] = None
    rubric_id: Optional[int] = None
    metadata_json: Optional[dict[str, Any]] = None


class QuestionOut(BaseModel):
    id: int
    form_id: int
    type: QuestionType
    prompt: str
    rubric_id: Optional[int]
    metadata_json: Optional[dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


