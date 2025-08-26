from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..deps import get_db, require_role
from ..models.entities import User
from ..schemas.admin import CreateUserIn, UpdateRoleIn, UserOut, ResetPasswordIn
from ..auth import hash_password
from ..config import config


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_role("admin"))])


@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)) -> list[UserOut]:
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: CreateUserIn, db: Session = Depends(get_db)) -> UserOut:
    """Create a new user (admin only)."""
    # Check if user already exists
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=config.ERROR_EMAIL_EXISTS
        )
    
    # Create user
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(user_id: int, payload: UpdateRoleIn, db: Session = Depends(get_db)) -> UserOut:
    """Update user role (admin only)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=config.ERROR_NOT_FOUND
        )
    
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/password")
def reset_user_password(
    user_id: int,
    payload: ResetPasswordIn,
    db: Session = Depends(get_db)
) -> dict:
    """Reset user password (admin only)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=config.ERROR_NOT_FOUND
        )
    
    user.password_hash = hash_password(payload.password)
    db.commit()
    return {"message": "Password reset successfully"}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)) -> None:
    """Delete user (admin only)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=config.ERROR_NOT_FOUND
        )
    
    db.delete(user)
    db.commit()


