# edu-rag
Monorepo for LLM-assisted education platform (Google Forms-like with realtime hints, grading, Video-RAG).

## Dev quickstart

Requirements: Docker + Docker Compose.

1) Build and start services

```
docker compose -f infra/docker/compose.yml up -d --build
```

Services:
- API: http://localhost:8000
- Postgres (pgvector) : localhost:5432 (user: postgres / pass: postgres / db: edurag)
- Redis: localhost:6379
- MinIO: http://localhost:9000 (console http://localhost:9001) user/pass: minioadmin

2) Health check

```
curl http://localhost:8000/health
```

## Structure

```
repo/
  apps/
    api/                # FastAPI app
    workers/            # Celery workers
    video-indexer/      # ASR + indexing (placeholder)
  infra/
    docker/compose.yml  # Dev compose stack
```

## Environment

Defaults are baked for dev (see `apps/api/app/models/db.py`). You can set:
- `DATABASE_URL` (default: `postgresql+psycopg://postgres:postgres@db:5432/edurag`)
- `CELERY_BROKER_URL` (default: `redis://redis:6379/0`)
- `CELERY_RESULT_BACKEND` (default: `redis://redis:6379/1`)

