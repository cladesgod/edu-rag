from fastapi import APIRouter


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login_placeholder() -> dict:
    return {"message": "login not implemented"}


