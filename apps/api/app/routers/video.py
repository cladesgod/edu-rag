import os
from uuid import uuid4

from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from minio import Minio
from sqlalchemy.orm import Session

from ..deps import get_db, require_role
from ..models.entities import Video
from ..schemas.video import VideoOut
from apps.workers.tasks import index_video


router = APIRouter(prefix="/videos", tags=["videos"])


def get_minio_client() -> Minio:
    endpoint = os.getenv("MINIO_ENDPOINT", "minio:9000")
    access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    secure = os.getenv("MINIO_SECURE", "false").lower() == "true"
    return Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure)


@router.post("", response_model=VideoOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role("admin", "tutor"))])
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    bucket = os.getenv("MINIO_BUCKET", "videos")
    client = get_minio_client()
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)

    key = f"uploads/{uuid4()}_{file.filename}"
    try:
        client.put_object(bucket, key, file.file, length=-1, part_size=10 * 1024 * 1024)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"upload failed: {e}")

    v = Video(storage_key=f"{bucket}/{key}")
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


@router.post("/{video_id}/index", dependencies=[Depends(require_role("admin", "tutor"))])
def index(video_id: int, db: Session = Depends(get_db)) -> dict:
    v = db.get(Video, video_id)
    if not v:
        raise HTTPException(status_code=404, detail="Video not found")
    index_video.delay(str(video_id))
    return {"status": "queued"}


@router.get("", response_model=List[VideoOut])
def list_videos(db: Session = Depends(get_db)) -> list[VideoOut]:
    return db.query(Video).order_by(Video.created_at.desc()).all()


