from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, forms, questions, realtime, video, admin, classrooms, submissions
from .models.db import engine
from .models.entities import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management following FastAPI best practices."""
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: Cleanup if needed


def create_app() -> FastAPI:
    """Create FastAPI application with proper configuration."""
    app = FastAPI(
        title="EduRAG API",
        version="0.1.0",
        description="LLM-assisted education platform API",
        lifespan=lifespan,
    )

    # CORS middleware - restrictive for production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # More secure than "*"
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["*"],
    )

    # Include routers with consistent ordering
    routers = [
        auth.router,
        admin.router,
        forms.router,
        questions.router,
        submissions.router,
        classrooms.router,
        video.router,
        realtime.router,
    ]
    
    for router in routers:
        app.include_router(router)

    # Health check endpoints
    @app.get("/health", tags=["health"])
    def health_check() -> dict:
        """Health check endpoint for monitoring."""
        return {"status": "healthy", "service": "edurag-api"}

    @app.get("/", tags=["root"])
    def root() -> dict:
        """Root endpoint with service information."""
        return {
            "service": "EduRAG API",
            "version": "0.1.0",
            "docs": "/docs",
            "health": "/health"
        }

    return app


# Create the application instance
app = create_app()


