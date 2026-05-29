# Voyager — AI-Powered International Travel Planner

A full-stack platform for international travel planning: purpose-aware visa guidance, budgets, timelines, embassy/visa center discovery, currency tools, and an AI travel assistant.

**Designed & built by Mrunmayee**

---

## Overview

![Demo](travel-support\docs\1.png)

Voyager helps travelers plan trips from home country to destination with:

- Step-by-step **trip planner** (route, dates, budget, travel purpose)
- **Visa engine** tailored by purpose (tourism, study, business, family, transit)
- **Center locator** via OpenStreetMap (no Mapbox key required)
- **Currency** conversion and budget estimates
- **AI assistant** with formatted Markdown replies and source citations
- **Saved trips** dashboard with share links

---

## Tech stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion, TanStack Query, Zustand, React Hook Form, Zod, Radix UI, Leaflet, react-markdown |
| Backend | Node.js, Express 5, Prisma, PostgreSQL, Redis (optional), JWT, Zod |
| Maps / geo | Nominatim + Overpass (OpenStreetMap) |
| AI | OpenAI GPT-4o-mini + RAG knowledge chunks (graceful fallback without API key) |

---

## Project structure

```
travel-support/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   └── api/              # Express REST API (port 4000)
├── packages/
│   └── database/         # Prisma schema, migrations, seed
├── docs/
│   ├── DEPLOY.md         # Production deployment guide
│   ├── ARCHITECTURE.md   # System design
│   └── API_SAMPLES.md    # Example API responses
├── docker-compose.yml    # Local Postgres + Redis
├── render.yaml           # Render Blueprint (API deploy)
└── .env.example
```

---

## Architecture

```mermaid
flowchart TB
  subgraph client [Frontend - Next.js 15]
    Web[Voyager Web App]
  end

  subgraph api [Backend - Express API]
    REST[REST API v1]
    Auth[JWT Auth]
    Planner[Travel Planner]
    Visa[Visa Engine]
    OSM[OpenStreetMap Services]
    AI[RAG AI Assistant]
  end

  subgraph data [Data Layer]
    PG[(PostgreSQL)]
    Redis[(Redis - optional)]
  end

  Web --> REST
  REST --> Auth
  REST --> Planner
  REST --> Visa
  REST --> OSM
  REST --> AI
  Planner --> PG
  Visa --> PG
  AI --> PG
  REST --> Redis
```

---

## Quick start (local)

### Prerequisites

- **Node.js** 20+
- **Docker Desktop** (Postgres + Redis)
- **npm**

### 1. Install dependencies

```bash
cd travel-support
npm install
```

### 2. Environment files

Copy env to all locations the apps read from:

```bash
cp .env.example .env
cp .env.example packages/database/.env
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
```

**Minimum variables:**

```env
DATABASE_URL="postgresql://voyager:voyager_dev@localhost:5433/voyager?schema=public"
JWT_SECRET="your-long-random-secret-here"
CORS_ORIGIN="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

> **Note:** Docker Postgres uses port **5433** (not 5432) to avoid conflicts if you already have PostgreSQL installed on Windows.


### 3. Start databases

```bash
docker compose up -d
```

### 4. Database migrate & seed

```bash
npm run db:generate
cd packages/database && npx prisma migrate dev --name init && cd ../..
npm run db:seed
```

### 5. Run dev servers

```bash
# Terminal 1 — API
npm run dev:api

# Terminal 2 — Web
npm run dev:web
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| Health check | http://localhost:4000/health |

---

## NPM scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + web concurrently |
| `npm run dev:api` | Express API only |
| `npm run dev:web` | Next.js frontend only |
| `npm run build:web` | Production frontend build |
| `npm run build:api` | Production API build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Dev migrations |
| `npm run db:migrate:deploy` | Production migrations |
| `npm run db:seed` | Seed countries, visa rules, rates |
| `npm run db:studio` | Prisma Studio GUI |

---

## Features

### Trip planner (`/planner`)

4-step flow: route → dates & purpose → budget & passport → review. Generates checklist, timeline, budget tiers, and visa summary.

### Visa engine (`/visa`)

Country-pair lookup with **travel purpose** (tourism, business, study, family, transit, other). Returns documents, steps, processing time, interview tips, and confidence score.

### Center locator (`/centers`)

Search by **city + country**. Live data from OpenStreetMap (embassies, consulates, VFS-style centers) with interactive Leaflet map.

### Currency (`/currency`)

Live rates (USD base), conversion, and spending guidance.

### AI assistant (`/assistant`)

Markdown-formatted answers, citations, suggested follow-ups. Requires login. Works in fallback mode without OpenAI.

### Saved trips (`/dashboard`)

Register, save plans, view details, share via token.

---

## API reference

Base URL: `http://localhost:4000/api/v1`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Sign in |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/countries` | — | List countries |
| GET | `/visa/requirements?origin=IND&destination=FRA&purpose=STUDY` | — | Visa rules by purpose |
| POST | `/planner/generate` | — | Generate travel plan |
| GET | `/trips` | ✓ | List saved trips |
| POST | `/trips` | ✓ | Create & save trip |
| GET | `/trips/shared/:token` | — | Public shared trip |
| GET | `/currency/rates` | — | Exchange rates |
| GET | `/currency/convert?amount=100&from=USD&to=EUR` | — | Convert currency |
| GET | `/centers/nearby?city=London&country=United Kingdom` | — | Nearby visa/passport centers |
| POST | `/ai/chat` | ✓ | AI assistant message |

Sample responses: [docs/API_SAMPLES.md](docs/API_SAMPLES.md)

---

## Deployment

Production: **Vercel** (frontend) + **Render** (API + Postgres).

**Full guide:** [docs/DEPLOY.md](docs/DEPLOY.md)

| Step | Action |
|------|--------|
| 1 | Push repo to GitHub |
| 2 | Render → **New Blueprint** → uses `render.yaml` |
| 3 | Run `db:migrate:deploy` + `db:seed` on production DB |
| 4 | Vercel → import repo → **Root Directory:** `apps/web` |
| 5 | Set `NEXT_PUBLIC_API_URL` on Vercel |
| 6 | Set `CORS_ORIGIN` on Render to your Vercel URL |

```bash
npm run build:web   # verify before deploy
npm run build:api   # stop local API first on Windows (Prisma file lock)
```

---

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/DEPLOY.md](docs/DEPLOY.md) | Vercel + Render deployment |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Data model, flows, caching |
| [docs/API_SAMPLES.md](docs/API_SAMPLES.md) | JSON response examples |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Prisma `EPERM` on Windows | Stop `npm run dev:api`, then run `db:generate` |
| DB auth failed on port 5432 | Use port **5433** in `DATABASE_URL` (see `docker-compose.yml`) |
| Planner / visa empty data | Run `docker compose up -d` and `npm run db:seed` |
| Centers show wrong city | Enter **city + country**, click Find centers again |
| CORS errors in production | `CORS_ORIGIN` must match Vercel URL exactly |
| AI plain / short replies | Add `OPENAI_API_KEY` to `apps/api/.env` |



---

**Voyager** · International travel planning with clarity · Built by **Mrunmayee**
