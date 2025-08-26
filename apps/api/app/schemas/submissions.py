from pydantic import BaseModel


class StartSubmissionIn(BaseModel):
    form_id: int


class SubmissionOut(BaseModel):
    id: int
    form_id: int
    user_id: int

    class Config:
        from_attributes = True


class UpsertAnswerIn(BaseModel):
    submission_id: int
    question_id: int
    content: str


class SubmitIn(BaseModel):
    submission_id: int


class AnswerOut(BaseModel):
    question_id: int
    content: str | None = None


class SubmissionDetailOut(BaseModel):
    id: int
    form_id: int
    user_id: int
    answers: list[AnswerOut]

    class Config:
        from_attributes = True

