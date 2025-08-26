from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..deps import get_db, get_current_tutor_user
from ..models.entities import Classroom, ClassroomEnrollment, ClassroomAssignment, User, Form
from ..schemas.classroom import (
    ClassroomCreate,
    ClassroomOut,
    EnrollmentCreate,
    EnrollmentOut,
    AssignmentCreate,
    AssignmentOut,
)


router = APIRouter(prefix="/classrooms", tags=["classrooms"], dependencies=[Depends(get_current_tutor_user)])


@router.post("/", response_model=ClassroomOut)
def create_classroom(payload: ClassroomCreate, db: Session = Depends(get_db)):
    c = Classroom(name=payload.name)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("/", response_model=list[ClassroomOut])
def list_classrooms(db: Session = Depends(get_db)):
    return db.query(Classroom).order_by(Classroom.id.desc()).all()


@router.post("/{classroom_id}/enroll", response_model=EnrollmentOut)
def enroll_student(classroom_id: int, payload: EnrollmentCreate, db: Session = Depends(get_db)):
    if not db.query(Classroom).filter(Classroom.id == classroom_id).first():
        raise HTTPException(status_code=404, detail="classroom not found")
    if not db.query(User).filter(User.id == payload.user_id).first():
        raise HTTPException(status_code=404, detail="user not found")
    e = ClassroomEnrollment(classroom_id=classroom_id, user_id=payload.user_id, role="student")
    db.add(e)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="already enrolled or conflict")
    db.refresh(e)
    return e


@router.post("/{classroom_id}/assign", response_model=AssignmentOut)
def assign_form(classroom_id: int, payload: AssignmentCreate, db: Session = Depends(get_db)):
    if not db.query(Classroom).filter(Classroom.id == classroom_id).first():
        raise HTTPException(status_code=404, detail="classroom not found")
    if not db.query(Form).filter(Form.id == payload.form_id).first():
        raise HTTPException(status_code=404, detail="form not found")
    a = ClassroomAssignment(classroom_id=classroom_id, form_id=payload.form_id)
    db.add(a)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="already assigned or conflict")
    db.refresh(a)
    return a


