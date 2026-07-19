# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (hot-reload via ts-node-dev)
npm run dev

# Build TypeScript to dist/
npm run build

# Run compiled output
npm start
```

There is no test suite configured. There is no linter configured.

## Environment Setup

Copy `.env.example` to `.env` and fill in the values:

```
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/ai_insights_dev
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
GROQ_API_KEY=your_groq_api_key_here
```

## Database

PostgreSQL with raw SQL via `pg` pool (no ORM). Run migrations manually in order:

```bash
psql $DATABASE_URL -f migrations/001_create_blogs.sql
psql $DATABASE_URL -f migrations/003_create_testimonials.sql
# Optional seed data:
psql $DATABASE_URL -f migrations/seed_blogs.sql
psql $DATABASE_URL -f migrations/seed_testimonials.sql
```

`category`, `tags`, and `author` on the `blogs` table are stored as JSONB columns, not foreign keys.

## Architecture

Express + TypeScript backend. All routes mount under `/api/v1` via `src/routes/api.ts`.

**Request flow:** `src/index.ts` → `src/routes/api.ts` → module routes → controller → service

**Module structure** (`src/modules/<name>/`):
- `*.types.ts` — TypeScript interfaces (DTOs, query params, response shapes)
- `*.service.ts` — direct `pg` pool queries, returns typed results
- `*.controller.ts` — Express handlers, calls service, wraps with `successResponse`/`errorResponse`
- `*.routes.ts` — Express Router, wires controller functions to HTTP methods
- `*.generate.ts` (blogs only) — Groq AI generation functions

**Shared lib** (`src/lib/`):
- `db.ts` — singleton `pg.Pool` exported as `pool`
- `groq.ts` — OpenAI-compatible client pointed at `https://api.groq.com/openai/v1`, model `openai/gpt-oss-120b`
- `response.ts` — `successResponse<T>` / `errorResponse` shape all JSON responses as `{ status, message, data, errors }`

## API Endpoints

**Blogs** (`/api/v1/blogs`):
- `GET /` — list with pagination (`page`, `limit`, `search`, `sort`, `featured`, `category`)
- `GET /generate?topic=` — AI-generate a full blog post via Groq
- `GET /ai-list?category=&count=` — AI-generate a list of blog previews
- `GET /:id` — get by UUID
- `POST /` — create (requires `title`, `slug`)
- `PUT /:id` — replace (requires `title`, `slug`)
- `DELETE /:id`

**Testimonials** (`/api/v1/testimonials`):
- `GET /` — list with pagination (`page`, `limit`, `rating`)
- `GET /:id`
- `POST /` — create (requires `author`, `role`, `company`, `avatar`, `content`)
- `PATCH /:id` — partial update
- `DELETE /:id`

**Authors** (`/api/v1/authors`):
- `GET /` — list with pagination (`page`, `limit`, `search`)
- `GET /:id`
- `PATCH /:id` — partial update
- `DELETE /:id`

`sort` values for blogs: `latest` | `oldest` | `most_liked` | `most_viewed` | `top_rated` | `trending`
