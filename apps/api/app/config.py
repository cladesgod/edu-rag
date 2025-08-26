"""
Application configuration and constants.
Consolidates all environment variables and constants in one place.
"""
import os
from datetime import timezone


class Config:
    """Application configuration class following industry standards."""
    
    # JWT Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET", "devsecret_change_me")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
    
    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@db:5432/edurag",
    )
    
    # MinIO Configuration
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "minio:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_SECURE: bool = os.getenv("MINIO_SECURE", "false").lower() == "true"
    MINIO_BUCKET_NAME: str = os.getenv("MINIO_BUCKET_NAME", "videos")
    
    # Celery Configuration
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/1")
    
    # Application Constants
    SUPPORTED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
    MAX_FILE_SIZE_MB = 100
    
    # Error Messages (standardized)
    ERROR_NOT_AUTHENTICATED = "Authentication required"
    ERROR_INVALID_TOKEN = "Invalid or expired token"
    ERROR_FORBIDDEN = "Insufficient permissions"
    ERROR_INVALID_CREDENTIALS = "Invalid email or password"
    ERROR_EMAIL_EXISTS = "Email already registered"
    ERROR_NOT_FOUND = "Resource not found"
    
    # Pagination defaults
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100


# Global config instance
config = Config()