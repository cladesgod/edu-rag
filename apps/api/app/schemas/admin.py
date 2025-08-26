from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: Literal["admin", "tutor", "student"]
    created_at: datetime

    class Config:
        from_attributes = True


class CreateUserIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    role: Literal["admin", "tutor", "student"]


class UpdateRoleIn(BaseModel):
    role: Literal["admin", "tutor", "student"]


