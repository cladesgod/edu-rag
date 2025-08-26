from fastapi import APIRouter


router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("")
def create_question() -> dict:
    return {"id": "placeholder"}


@router.patch("/{question_id}")
def update_question(question_id: str) -> dict:
    return {"id": question_id, "updated": True}


