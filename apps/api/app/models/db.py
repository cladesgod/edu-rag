from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ..config import config

# Database engine with proper configuration
engine = create_engine(
    config.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,  # Industry standard: recycle connections every 5 minutes
    pool_size=5,       # Industry standard: reasonable connection pool size
    max_overflow=10,   # Industry standard: allow temporary overflow
    echo=False,        # Set to True for debugging SQL queries
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


