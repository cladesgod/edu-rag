from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.entities import Question, Form
from ..schemas.questions import QuestionCreate, QuestionOut, QuestionUpdate


router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db)) -> QuestionOut:
    if not db.get(Form, payload.form_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    q = Question(
        form_id=payload.form_id,
        type=payload.type,
        prompt=payload.prompt,
        rubric_id=payload.rubric_id,
        metadata_json=payload.metadata_json,
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.get("/{question_id}", response_model=QuestionOut)
def get_question(question_id: int, db: Session = Depends(get_db)) -> QuestionOut:
    q = db.get(Question, question_id)
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return q


@router.get("", response_model=List[QuestionOut])
def list_questions(form_id: int | None = None, db: Session = Depends(get_db)) -> list[QuestionOut]:
    query = db.query(Question)
    if form_id is not None:
        query = query.filter(Question.form_id == form_id)
    return query.order_by(Question.created_at.asc()).all()


@router.patch("/{question_id}", response_model=QuestionOut)
def update_question(question_id: int, payload: QuestionUpdate, db: Session = Depends(get_db)) -> QuestionOut:
    q = db.get(Question, question_id)
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(q, field, value)
    db.commit()
    db.refresh(q)
    return q


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db)) -> None:
    q = db.get(Question, question_id)
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    db.delete(q)
    db.commit()
    return None


