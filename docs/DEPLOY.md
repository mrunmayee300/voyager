# Deploy Voyager

Production stack:

| Component | Platform | Cost (starter) |
|-----------|----------|----------------|
| Frontend | [Vercel](https://vercel.com) | Free |
| API | [Render](https://render.com) | Free tier |
| PostgreSQL | Render Postgres or [Supabase](https://supabase.com) | Free tier |

---

## 1. Push code to GitHub

```bash
git init
git add .
git commit -m "Prepare Voyager for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USER/travel-support.git
git push -u origin main
```

---

## 2. Database (choose one)

### Option A — Render Postgres (easiest with `render.yaml`)

When you deploy the Blueprint, Render creates `voyager-db` and can wire `DATABASE_URL` automatically.

After deploy, seed once (Render Shell or local):

```bash
DATABASE_URL="your-render-postgres-url" npm run db:seed
```

### Option B — Supabase

1. Create project at [supabase.com](https://supabase.com)
2. **Settings → Database → Connection string** (URI, port 5432)
3. Use as `DATABASE_URL` on the API service

Run migrations locally:

```bash
DATABASE_URL="postgresql://..." npm run db:migrate:deploy
DATABASE_URL="postgresql://..." npm run db:seed
```

---

## 3. Deploy API (Render)

### Using Blueprint (recommended)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render reads `render.yaml` and creates `voyager-api`
4. Environment variables (Blueprint links DB automatically):

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Auto-linked from `voyager-db` via `render.yaml` |
| `CORS_ORIGIN` | `https://YOUR-VERCEL-APP.vercel.app` |
| `OPENAI_API_KEY` | (optional) |

**If you see `Environment variable not found: DATABASE_URL`:**

1. Render Dashboard → **voyager-api** → **Environment**
2. Add `DATABASE_URL` = **Internal Connection String** from your Postgres (`voyager-db` → Connect)
3. Save → **Manual Deploy**

5. Deploy → copy API URL, e.g. `https://voyager-api.onrender.com`

### Using Docker

```bash
docker build -f apps/api/Dockerfile -t voyager-api .
docker run -p 4000:4000 -e DATABASE_URL=... -e JWT_SECRET=... voyager-api
```

---

## 4. Deploy frontend (Vercel)

1. [vercel.com/new](https://vercel.com/new) → Import GitHub repo
2. **Root Directory:** `apps/web`
3. Framework: **Next.js** (auto-detected)
4. **Environment variables:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://voyager-api.onrender.com/api/v1` |

5. Deploy

6. Go back to Render → set `CORS_ORIGIN` to your Vercel URL → **Manual Deploy**

---

## 5. Verify production

```bash
curl https://voyager-api.onrender.com/health
curl https://voyager-api.onrender.com/api/v1/countries
```

Open your Vercel URL → plan a trip → sign up → test assistant.

---

## Environment checklist

### API (Render)

```
DATABASE_URL=
JWT_SECRET=          # long random string
CORS_ORIGIN=         # https://your-app.vercel.app
NODE_ENV=production
OPENAI_API_KEY=      # optional
REDIS_URL=           # optional
OSM_USER_AGENT=VoyagerTravelApp/1.0 (your@email.com)
```

### Web (Vercel)

```
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api/v1
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API 502 on Render free tier | Service sleeps — first request takes ~30s |
| CORS errors | `CORS_ORIGIN` must exactly match Vercel URL (no trailing slash) |
| Prisma errors on start | Check `DATABASE_URL`, run `migrate:deploy` |
| Empty countries | Run `db:seed` against production DB |
| Build fails on Vercel | Root dir = `apps/web`, install from repo root |

---

## Custom domain (optional)

- **Vercel:** Project → Settings → Domains  
- **Render:** Service → Settings → Custom Domain  
- Update `CORS_ORIGIN` and `NEXT_PUBLIC_API_URL` to match
