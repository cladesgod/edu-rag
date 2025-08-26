import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models.entities import User
from ..schemas.auth import LoginIn, RegisterIn, TokenOut


router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET", "devsecret_change_me")
ALGO = "HS256"
ACCESS_TOKEN_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))


def hash_password(p: str) -> str:
    return pwd_context.hash(p)


def verify_password(p: str, h: str) -> bool:
    return pwd_context.verify(p, h)


def create_token(*, sub: str, role: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    to_encode = {"sub": sub, "role": role, "exp": exp}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGO)


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="email exists")
    u = User(email=payload.email, password_hash=hash_password(payload.password), role=payload.role)
    db.add(u)
    db.commit()
    db.refresh(u)
    token = create_token(sub=str(u.id), role=u.role)
    return TokenOut(access_token=token)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    u = db.query(User).filter(User.email == payload.email).first()
    if not u or not verify_password(payload.password, u.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")
    token = create_token(sub=str(u.id), role=u.role)
    return TokenOut(access_token=token)


