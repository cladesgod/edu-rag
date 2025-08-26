from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.entities import Form
from ..schemas.forms import FormCreate, FormOut, FormUpdate


router = APIRouter(prefix="/forms", tags=["forms"])


@router.post("", response_model=FormOut, status_code=status.HTTP_201_CREATED)
def create_form(payload: FormCreate, db: Session = Depends(get_db)) -> FormOut:
    form = Form(
        title=payload.title,
        description=payload.description,
        course_id=payload.course_id,
        settings_json=payload.settings_json,
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


@router.get("/{form_id}", response_model=FormOut)
def get_form(form_id: int, db: Session = Depends(get_db)) -> FormOut:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


@router.get("", response_model=List[FormOut])
def list_forms(db: Session = Depends(get_db)) -> list[FormOut]:
    return db.query(Form).order_by(Form.created_at.desc()).all()


@router.patch("/{form_id}", response_model=FormOut)
def update_form(form_id: int, payload: FormUpdate, db: Session = Depends(get_db)) -> FormOut:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(form, field, value)
    db.commit()
    db.refresh(form)
    return form


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: int, db: Session = Depends(get_db)) -> None:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    db.delete(form)
    db.commit()
    return None


