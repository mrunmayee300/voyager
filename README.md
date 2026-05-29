# Voyager — AI-Powered International Travel Planner

A production-grade full-stack platform for international travel planning: visas, budgets, timelines, center locators, currency tools, and an AI assistant.

## Architecture

```mermaid
flowchart TB
  subgraph client [Frontend - Next.js 15]
    Web[Voyager Web App]
  end

  subgraph api [Backend - Express API]
    REST[REST API v1]
    Auth[JWT Auth]
    Planner[Travel Planner Engine]
    Visa[Visa Requirement Engine]
    AI[RAG AI Assistant]
    Cache[Redis Cache]
  end

  subgraph data [Data Layer]
    PG[(PostgreSQL)]
    Prisma[Prisma ORM]
  end

  Web --> REST
  REST --> Auth
  REST --> Planner
  REST --> Visa
  REST --> AI
  REST --> Cache
  Planner --> Prisma
  Visa --> Prisma
  AI --> Prisma
  Prisma --> PG
  Cache --> Redis[(Redis)]
```

## Monorepo structure

```
travel-support/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # Express REST API
├── packages/
│   └── database/     # Prisma schema & seeds
├── docker-compose.yml
└── README.md
```

## Tech stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion, TanStack Query, Zustand, React Hook Form, Zod, Radix/shadcn-style UI |
| Backend | Node.js, Express 5, Prisma, PostgreSQL, Redis, JWT, Zod validation |
| AI | OpenAI, RAG via knowledge chunks |

## Quick start

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL & Redis)
- npm

### 1. Clone and install

```bash
cd travel-support
npm install
```

### 2. Environment

```bash
cp .env.example .env
cp .env.example packages/database/.env
```

Edit `.env` with your values. Minimum required:

```
DATABASE_URL="postgresql://voyager:voyager_dev@localhost:5432/voyager?schema=public"
JWT_SECRET="your-long-random-secret"
```

### 3. Start databases

```bash
docker compose up -d
```

### 4. Database setup

```bash
npm run db:generate
cd packages/database && npx prisma migrate dev --name init
npm run db:seed
```

### 5. Run development servers

```bash
# Terminal 1 - API
npm run dev:api

# Terminal 2 - Web
npm run dev:web
```

- **Frontend:** http://localhost:3000
- **API:** http://localhost:4000
- **Health:** http://localhost:4000/health

## API overview

Base URL: `http://localhost:4000/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Sign in |
| GET | `/auth/me` | Current user (auth) |
| GET | `/countries` | List countries |
| GET | `/visa/requirements?origin=IND&destination=FRA` | Visa rules |
| POST | `/planner/generate` | Generate travel plan |
| GET/POST | `/trips` | List/create trips (auth) |
| GET | `/currency/rates` | Exchange rates |
| GET | `/currency/convert?amount=100&from=USD&to=EUR` | Convert |
| GET | `/centers/nearby?city=Mumbai` | Nearby offices |
| POST | `/ai/chat` | AI assistant (auth) |

See [docs/API_SAMPLES.md](docs/API_SAMPLES.md) for sample responses.

## Features

- **Smart travel planner** — Progressive form → checklist, timeline, budget, visa summary
- **Visa engine** — Country matrix, documents, steps, processing times, confidence scores
- **Center locator** — Passport offices, visa centers, embassies with distance sorting
- **Currency assistant** — Rates, conversion, spending tips
- **AI assistant** — RAG + OpenAI with fallback mode
- **Saved trips** — Dashboard, sharing via token, collaborative schema ready
- **Premium UI** — Editorial travel design (warm neutrals, calm typography, no generic AI aesthetic)

## Deployment

Full step-by-step guide: **[docs/DEPLOY.md](docs/DEPLOY.md)**

**Quick path:**

1. Push repo to GitHub
2. **Render** → New Blueprint → `render.yaml` (API + Postgres)
3. **Vercel** → Import repo → Root Directory: `apps/web`
4. Set `NEXT_PUBLIC_API_URL` on Vercel and `CORS_ORIGIN` on Render
5. Seed production DB: `DATABASE_URL=... npm run db:seed`

```bash
npm run build:web   # verify frontend build
npm run build:api   # verify API build (stop local API first on Windows)
```

## Optional integrations

- `OPENAI_API_KEY` — Full AI chat responses
- `MAPBOX_ACCESS_TOKEN` / `NEXT_PUBLIC_MAPBOX_TOKEN` — Interactive maps
- Live forex APIs — Replace seed rates in production

## Design philosophy

Grounded, editorial, travel-centric UI inspired by premium travel brands — not generic AI SaaS templates. Restrained motion, warm neutrals, realistic card hierarchy.

## License

MIT
