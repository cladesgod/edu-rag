from pathlib import Path
from uuid import uuid4
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from minio import Minio
from sqlalchemy.orm import Session

from ..deps import get_db, require_role
from ..models.entities import Video
from ..schemas.video import VideoOut
from ..config import config
from apps.workers.tasks import index_video


router = APIRouter(prefix="/videos", tags=["videos"])


def get_minio_client() -> Minio:
    """Get MinIO client with centralized configuration."""
    return Minio(
        config.MINIO_ENDPOINT,
        access_key=config.MINIO_ACCESS_KEY,
        secret_key=config.MINIO_SECRET_KEY,
        secure=config.MINIO_SECURE
    )


def validate_video_file(file: UploadFile) -> None:
    """Validate uploaded video file following industry standards."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in config.SUPPORTED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {', '.join(config.SUPPORTED_VIDEO_EXTENSIONS)}"
        )
    
    # Check file size (if available)
    if hasattr(file, 'size') and file.size and file.size > config.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {config.MAX_FILE_SIZE_MB}MB"
        )


@router.post("", response_model=VideoOut, status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: None = Depends(require_role("admin", "tutor")),
) -> VideoOut:
    """Upload a video file to MinIO storage."""
    validate_video_file(file)
    
    client = get_minio_client()
    
    # Ensure bucket exists
    if not client.bucket_exists(config.MINIO_BUCKET_NAME):
        client.make_bucket(config.MINIO_BUCKET_NAME)
    
    # Generate unique storage key
    file_ext = Path(file.filename).suffix if file.filename else ""
    storage_key = f"uploads/{uuid4()}{file_ext}"
    
    try:
        # Upload with proper error handling
        client.put_object(
            config.MINIO_BUCKET_NAME,
            storage_key,
            file.file,
            length=-1,
            part_size=10 * 1024 * 1024  # 10MB chunks
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )
    
    # Save to database
    video = Video(storage_key=f"{config.MINIO_BUCKET_NAME}/{storage_key}")
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.post("/{video_id}/index")
def trigger_video_indexing(
    video_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_role("admin", "tutor")),
) -> dict:
    """Trigger video indexing job."""
    video = db.get(Video, video_id)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=config.ERROR_NOT_FOUND
        )
    
    # Queue indexing task
    index_video.delay(str(video_id))
    return {"status": "indexing_queued", "video_id": video_id}


@router.get("", response_model=List[VideoOut])
def list_videos(db: Session = Depends(get_db)) -> List[VideoOut]:
    """List all videos ordered by creation date."""
    return db.query(Video).order_by(Video.created_at.desc()).all()


