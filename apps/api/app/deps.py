from typing import Generator, Optional, Dict, Any
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .models.db import SessionLocal
from .auth import decode_access_token, create_auth_error, create_forbidden_error
from .config import config


def get_db() -> Generator[Session, None, None]:
    """Database dependency with proper typing."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    """Get current authenticated user from JWT token."""
    if credentials is None:
        raise create_auth_error()
    
    payload = decode_access_token(credentials.credentials)
    return payload


def get_current_user_role(user: Dict[str, Any] = Depends(get_current_user)) -> str:
    """Extract user role from authenticated user."""
    return str(user.get("role", ""))


def require_role(*allowed_roles: str):
    """Create a dependency that requires specific roles."""
    def _check_role(role: str = Depends(get_current_user_role)) -> None:
        if role not in allowed_roles:
            raise create_forbidden_error()
        return None
    return _check_role


# Convenience dependencies following industry naming conventions
get_current_admin_user = Depends(require_role("admin"))
get_current_tutor_user = Depends(require_role("tutor", "admin"))
get_current_student_user = Depends(require_role("student", "tutor", "admin"))

