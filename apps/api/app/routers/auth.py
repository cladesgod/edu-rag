from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.entities import User
from ..schemas.auth import LoginIn, RegisterIn, TokenOut
from ..auth import hash_password, verify_password, create_access_token
from ..config import config


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    """Register a new user."""
    # Check if user already exists
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=config.ERROR_EMAIL_EXISTS
        )
    
    # Create new user
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Generate access token
    token = create_access_token(sub=str(user.id), role=user.role)
    return TokenOut(access_token=token)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    """Authenticate user and return access token."""
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=config.ERROR_INVALID_CREDENTIALS
        )
    
    token = create_access_token(sub=str(user.id), role=user.role)
    return TokenOut(access_token=token)


