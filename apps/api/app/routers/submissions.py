from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..deps import get_db, get_current_user, get_current_tutor_user
from ..models.entities import Submission, Answer, Form, Question
from ..schemas.submissions import StartSubmissionIn, SubmissionOut, UpsertAnswerIn, SubmitIn, SubmissionDetailOut, AnswerOut


router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/start", response_model=SubmissionOut)
def start_submission(payload: StartSubmissionIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # ensure form exists
    if not db.query(Form).filter(Form.id == payload.form_id).first():
        raise HTTPException(status_code=404, detail="form not found")
    sub = Submission(form_id=payload.form_id, user_id=int(user.get("sub")))
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.post("/answer")
def upsert_answer(payload: UpsertAnswerIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    sub = db.query(Submission).filter(Submission.id == payload.submission_id, Submission.user_id == int(user.get("sub"))).first()
    if not sub:
        raise HTTPException(status_code=404, detail="submission not found")
    if not db.query(Question).filter(Question.id == payload.question_id, Question.form_id == sub.form_id).first():
        raise HTTPException(status_code=400, detail="invalid question")
    ans = db.query(Answer).filter(Answer.submission_id == sub.id, Answer.question_id == payload.question_id).first()
    if ans:
        ans.content = payload.content
    else:
        ans = Answer(submission_id=sub.id, question_id=payload.question_id, content=payload.content)
        db.add(ans)
    db.commit()
    return {"ok": True}


@router.post("/submit")
def submit(payload: SubmitIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    sub = db.query(Submission).filter(Submission.id == payload.submission_id, Submission.user_id == int(user.get("sub"))).first()
    if not sub:
        raise HTTPException(status_code=404, detail="submission not found")
    sub.submitted_at = __import__("datetime").datetime.utcnow()
    db.commit()
    return {"ok": True}


@router.get("/monitor", dependencies=[Depends(get_current_tutor_user)])
def monitor(db: Session = Depends(get_db)):
    # Very basic monitor: list active submissions (no submitted_at yet)
    active = db.query(Submission).filter(Submission.submitted_at.is_(None)).order_by(Submission.id.desc()).all()
    return [
        {"id": s.id, "form_id": s.form_id, "user_id": s.user_id, "started_at": s.started_at.isoformat()}
        for s in active
    ]


@router.get("/mine", response_model=list[SubmissionOut])
def my_submissions(db: Session = Depends(get_db), user=Depends(get_current_user)):
    subs = db.query(Submission).filter(Submission.user_id == int(user.get("sub"))).order_by(Submission.id.desc()).all()
    return subs


@router.get("/{submission_id}", response_model=SubmissionDetailOut)
def get_submission(submission_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    sub = db.query(Submission).filter(Submission.id == submission_id, Submission.user_id == int(user.get("sub"))).first()
    if not sub:
        raise HTTPException(status_code=404, detail="submission not found")
    answers = [AnswerOut(question_id=a.question_id, content=a.content) for a in sub.answers]
    return SubmissionDetailOut(id=sub.id, form_id=sub.form_id, user_id=sub.user_id, answers=answers)


