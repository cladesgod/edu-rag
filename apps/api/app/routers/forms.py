from fastapi import APIRouter


router = APIRouter(prefix="/forms", tags=["forms"])


@router.post("")
def create_form() -> dict:
    return {"id": "placeholder"}


@router.get("/{form_id}")
def get_form(form_id: str) -> dict:
    return {"id": form_id, "status": "placeholder"}


