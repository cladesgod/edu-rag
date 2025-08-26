# edu-rag
Monorepo for an LLM-assisted education platform combining Google Forms–style assessment with realtime hints, rubric grading, and Video-RAG.

Public demo URLs (adjust host/IP as needed):
- Web UI (Landing): `http://<HOST_OR_IP>:3000`
- API: `http://<HOST_OR_IP>:8000` (Swagger UI `http://<HOST_OR_IP>:8000/docs`)
- MinIO (S3-compatible) console: `http://<HOST_OR_IP>:9001` (minioadmin/minioadmin)

## What’s implemented in this MVP
- FastAPI API with:
  - Forms and Questions CRUD (Postgres/SQLAlchemy)
  - Realtime hint demo via SSE `/realtime/hint` and WS `/realtime/ws/hint`
  - Video upload to MinIO and indexing trigger (`POST /videos`, `POST /videos/{id}/index`, `GET /videos`)
  - Health endpoints `/` and `/health`
- Celery worker with placeholder tasks (`videos.index`, `grading.run`)
- Next.js web app (TS + Tailwind) with pages:
  - `/` Landing page with CTAs (Login, Tutor Dashboard, Admin Panel, Student Demo) and API health
  - `/forms` Forms list/create + inline edit/delete (tutor/admin)
  - `/classrooms` Classroom management (create, enroll students, assign forms) (tutor/admin)
  - `/forms/[id]` Questions list/create (MCQ) + inline edit/delete
  - `/videos` Upload and Index trigger
  - `/ws` WebSocket hint demo
  - `/login` Email/password login; stores JWT in localStorage
  - `/admin` Admin panel (users list) — requires admin role

Planned next (high-level):
- JWT auth with roles (tutor, student). Tutor dashboard and student exam flow with realtime guidance.
- Grading pipeline job + feedback UI.
- Video-RAG improvements (ASR, chunking, retrieval, timestamp suggestions).

## Architecture (dev)
Docker Compose stack:
- API (FastAPI + Uvicorn)
- Worker (Celery with Redis broker/result)
- Postgres (pgvector)
- Redis
- MinIO (S3-compatible object storage)
- Web (Next.js dev server)

## Dev quickstart
Requirements: Docker + Docker Compose.

1) Start services
```
docker compose -f infra/docker/compose.yml up -d --build
```

2) Verify health
```
curl http://localhost:8000/health
```

3) Open the web UI
```
http://localhost:3000
```

4) Login and roles
- Use Swagger `POST /auth/register` to create a user with role `admin` or `tutor`.
- Or via curl:
  ```bash
  curl -X POST -H 'Content-Type: application/json' \
    -d '{"email":"admin@example.com","password":"Secret123!","role":"admin"}' \
    http://localhost:8000/auth/register
  ```
- Then login from the web at `/login` and navigate to `/admin` (admin) or `/forms` (tutor/admin).

Notes:
- First access to `/videos` requires MinIO to be up. If upload fails, ensure MinIO is running:
  - `docker compose -f infra/docker/compose.yml up -d minio`
  - check readiness: `curl -sS http://localhost:9000/minio/health/ready`
- If Next.js dev shows transient chunk errors, restart web: `docker compose -f infra/docker/compose.yml restart web`.

## Local development endpoints
- Forms
  - `POST /forms`
  - `GET /forms`
  - `GET /forms/{id}`
  - `PATCH /forms/{id}`
  - `DELETE /forms/{id}`
- Questions
  - `POST /questions`
  - `GET /questions?form_id=...`
  - `GET /questions/{id}`
  - `PATCH /questions/{id}`
  - `DELETE /questions/{id}`
- Realtime
  - `GET /realtime/hint` (SSE stream)
  - `WS /realtime/ws/hint` (WebSocket stream)
- Videos
  - `POST /videos` (multipart form-data `file`)
  - `POST /videos/{id}/index`
  - `GET /videos`

- Classrooms (tutor/admin only)
  - `POST /classrooms` — create classroom
  - `GET /classrooms` — list classrooms
  - `POST /classrooms/{id}/enroll` — enroll a student `{ user_id }`
  - `POST /classrooms/{id}/assign` — assign a form `{ form_id }`

## Project structure
```
repo/
  apps/
    api/
      app/
        routers/        # auth, forms, questions, realtime, video, admin
        services/        # assessment, hint, retrieval, video_rag (stubs)
        models/          # db engine + SQLAlchemy models
        schemas/         # Pydantic schemas
        main.py          # app factory + router wiring
    workers/             # Celery tasks: grading, videos.index (stubs)
    video-indexer/       # placeholder for ASR + indexing pipeline
    web/                 # Next.js app (TS, Tailwind)
  infra/
    docker/compose.yml   # Dev compose stack
```

## Environment variables
Defaults are dev-friendly; override via Docker Compose or environment.

API/Worker:
- `DATABASE_URL` (default: `postgresql+psycopg://postgres:postgres@db:5432/edurag`)
- `CELERY_BROKER_URL` (default: `redis://redis:6379/0`)
- `CELERY_RESULT_BACKEND` (default: `redis://redis:6379/1`)
- `MINIO_ENDPOINT` (default: `minio:9000` inside compose)
- `MINIO_ACCESS_KEY` (default: `minioadmin`)
- `MINIO_SECRET_KEY` (default: `minioadmin`)
- `MINIO_SECURE` (default: `false`)
- `MINIO_BUCKET` (default: `videos`)

Web:
- `NEXT_PUBLIC_API_URL` (optional). If unset, the web app auto-derives `http(s)://<host>:8000`.

Auth (API):
- `JWT_SECRET` (default: devsecret_change_me)
- `JWT_EXPIRE_MINUTES` (default: 60)

## Common commands
Build and start all:
```
docker compose -f infra/docker/compose.yml up -d --build
```

Tail logs (API/worker/web):
```
docker compose -f infra/docker/compose.yml logs -f api
docker compose -f infra/docker/compose.yml logs -f worker
docker compose -f infra/docker/compose.yml logs -f web
```

Restart a service:
```
docker compose -f infra/docker/compose.yml restart api
```

MinIO readiness:
```
curl -sS http://localhost:9000/minio/health/ready
```

## Tutor/Student next steps
This repository is prepared for role-based flows. Immediate work items:
- Add JWT auth (register/login) with role claims: tutor, student (API is in place)
- Guard API routes; add tutor-only endpoints (content mgmt, grading triggers) (in place for forms/questions/videos)
- Web: route guards by role on tutor/admin pages (in progress)
- Tutor dashboard: manage forms/questions/videos; view submissions
- Student exam page: join exam, answer with realtime hints; submit for grading

## Notes for future implementers
- Realtime streaming demos are in place (SSE/WS) and ready to be swapped with model-backed hint engines.
- Celery tasks are stubs; integrate ASR and retrieval pipelines as needed.
- Vector DB is pgvector for simplicity; can be replaced with Weaviate/Milvus.

