# Contributing to edu-rag

Thanks for contributing! This guide helps you set up locally and follow our conventions so the next developer can move fast.

## Prereqs
- Docker and Docker Compose
- Node.js 20 (only if running web app outside Docker)
- Python 3.11 (only if running API outside Docker)

## Quickstart (Docker)
1. Start services
```
docker compose -f infra/docker/compose.yml up -d --build
```
2. Web: http://localhost:3000  |  API: http://localhost:8000/docs  |  MinIO: http://localhost:9001

## Project Structure (monorepo)
```
apps/
  api/         # FastAPI app (routers, models, schemas)
  web/         # Next.js 14 App Router (TS, Tailwind)
  workers/     # Celery tasks (video indexing, grading)
infra/
  docker/      # Docker Compose
```

## Development Workflow
- Branch naming: `feat/<area>-<short-desc>`, `fix/<area>-<issue>`, `docs/<area>-<note>`
- Commit messages (conventional): `feat(api): add /submissions/detail`, `fix(web): handle token expiry`, `docs: update README`
- PR checklist:
  - Code builds locally (Docker or host)
  - Lint passes (no new warnings in CI/editor)
  - README/Docs updated for user-facing changes
  - Screenshots for UI changes (optional but helpful)

## API Guidelines
- Add routers in `apps/api/app/routers/` and wire in `main.py`
- Schemas go in `apps/api/app/schemas/` using Pydantic v2
- DB models live in `apps/api/app/models/entities.py`
- Auth: protect tutor/admin endpoints with `get_current_tutor_user` / `get_current_admin_user`
- Return clear errors: `HTTPException(status_code, detail="...")`

### Running API outside Docker (optional)
```
cd apps/api
uvicorn apps.api.app.main:app --reload --host 0.0.0.0 --port 8000
```

## Web (Next.js) Guidelines
- Pages under `apps/web/src/app/*` (App Router)
- Shared components in `apps/web/src/components`
- Auth helpers: `getToken()`, `getRole()`, `getEmail()` from `src/lib/auth.ts`
- API base: `getApiBase()` reads `NEXT_PUBLIC_API_URL`
- Always send `Authorization: Bearer <token>` for tutor/admin calls

### Running web outside Docker (optional)
```
cd apps/web
npm i
npm run dev
```

## Environments
- API: JWT_SECRET and JWT_EXPIRE_MINUTES can be set via env/compose
- Web: `NEXT_PUBLIC_API_URL` (defaults to `http(s)://<host>:8000`)

## Seeding Admin (dev)
A dev admin is pre-seeded: `timtim@example.com` / `7410258!`

## Testing
- Manual: use Swagger at `/docs` and web flows (login, create forms, questions)
- Add unit tests under `apps/api/tests` and `apps/web` as we grow; wire into CI (TBD)

## Style & Lint
- TypeScript strict where possible; no implicit `any`
- Prefer explicit return types for exported functions
- Keep components small and focused; reuse common UI patterns

## Release Notes (MVP)
- Roles: student, tutor, admin; JWT auth
- Forms/Questions CRUD (tutor/admin)
- Realtime hints demo via SSE/WS
- Classrooms (enroll, assign forms)
- Submissions (start, answer, submit), Tutor monitoring
- Admin panel (create tutor, reset password, delete user)

## Roadmap Handoff
- Student exam UX polish (question navigation, autosave)
- Tutor analytics & grading pipeline integration
- Video-RAG indexing pipeline (ASR + embeddings)
- Observability (metrics, tracing)
