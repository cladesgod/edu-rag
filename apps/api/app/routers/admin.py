from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..deps import get_db, require_role
from ..models.entities import User
from ..schemas.admin import CreateUserIn, UpdateRoleIn, UserOut
from .auth import hash_password


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_role("admin"))])


@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)) -> list[UserOut]:
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: CreateUserIn, db: Session = Depends(get_db)) -> UserOut:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="email exists")
    u = User(email=payload.email, password_hash=hash_password(payload.password), role=payload.role)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_role(user_id: int, payload: UpdateRoleIn, db: Session = Depends(get_db)) -> UserOut:
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="user not found")
    u.role = payload.role
    db.commit()
    db.refresh(u)
    return u


@router.patch("/users/{user_id}/password")
def reset_password(user_id: int, payload: dict, db: Session = Depends(get_db)) -> dict:
    new_password = payload.get("password")
    if not new_password or len(str(new_password)) < 6:
        raise HTTPException(status_code=400, detail="password must be at least 6 characters")
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="user not found")
    u.password_hash = hash_password(str(new_password))
    db.commit()
    return {"ok": True}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)) -> None:
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="user not found")
    db.delete(u)
    db.commit()
    return None


