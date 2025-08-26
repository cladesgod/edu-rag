from pydantic import BaseModel, Field
from typing import List


class ClassroomCreate(BaseModel):
    name: str = Field(min_length=1)


class ClassroomOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class EnrollmentCreate(BaseModel):
    user_id: int


class EnrollmentOut(BaseModel):
    id: int
    user_id: int
    classroom_id: int

    class Config:
        from_attributes = True


class AssignmentCreate(BaseModel):
    form_id: int


class AssignmentOut(BaseModel):
    id: int
    classroom_id: int
    form_id: int

    class Config:
        from_attributes = True


