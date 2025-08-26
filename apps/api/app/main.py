from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, forms, questions, realtime, video, admin
from .models.db import engine
from .models.entities import Base


def create_app() -> FastAPI:
    app = FastAPI(title="edu-rag API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(forms.router)
    app.include_router(questions.router)
    app.include_router(realtime.router)
    app.include_router(video.router)
    app.include_router(admin.router)

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    @app.get("/")
    def root() -> dict:
        return {"service": "edu-rag api"}

    return app


app = create_app()

# Create tables at startup (dev convenience)
Base.metadata.create_all(bind=engine)


