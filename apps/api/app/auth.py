"""
Authentication utilities following industry standards.
Consolidates all JWT and password handling logic.
"""
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

from .config import config


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(*, sub: str, role: str, additional_claims: Dict[str, Any] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        sub: Subject (typically user ID)
        role: User role
        additional_claims: Optional additional claims to include
    
    Returns:
        JWT token string
    """
    # Use timezone-aware datetime (industry standard)
    expire = datetime.now(timezone.utc) + timedelta(minutes=config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": sub,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),  # Issued at
    }
    
    if additional_claims:
        to_encode.update(additional_claims)
    
    return jwt.encode(to_encode, config.JWT_SECRET_KEY, algorithm=config.JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT access token.
    
    Args:
        token: JWT token string
        
    Returns:
        Token payload dictionary
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=[config.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=config.ERROR_INVALID_TOKEN,
            headers={"WWW-Authenticate": "Bearer"},
        )


def create_auth_error(detail: str = None) -> HTTPException:
    """Create a standardized authentication error."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail or config.ERROR_NOT_AUTHENTICATED,
        headers={"WWW-Authenticate": "Bearer"},
    )


def create_forbidden_error(detail: str = None) -> HTTPException:
    """Create a standardized forbidden error."""
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail or config.ERROR_FORBIDDEN,
    )