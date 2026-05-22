# GiftAI — Gifting Platform

React frontend + Django REST API for occasions, gift sets, AI detective chat, and corporate CRM.

## Local setup

### Backend (Django)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_mock_data
python manage.py runserver
```

API: http://127.0.0.1:8000/api/  
Health: http://127.0.0.1:8000/api/health/

### Frontend (Vite)

```bash
npm install
npm run dev
```

App: http://localhost:3000 (proxies `/api` → Django)

**Production (Render):** open **`https://giftai-frontend.onrender.com`** (UI) → API **`https://giftai-api.onrender.com`**.  
Configured in `render.yaml` (`giftai-frontend` static + `giftai-api` Django).

## Mock data

```bash
cd backend
python manage.py seed_mock_data
```

Clears and repopulates recipients, gift sets, occasions, saved gifts, detective chat, and dashboard insights.

## API endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/dashboard/` | Home: occasions, curated sets, offers, insights |
| `GET /api/occasions/?upcoming=true` | Upcoming occasions |
| `GET /api/gift-sets/` | All gift sets |
| `GET /api/saved-gifts/` | Saved gifts for calendar |
| `GET /api/detective/sessions/active/` | Active chat session |
| `POST /api/detective/sessions/{id}/messages/` | Send chat message |
| `POST /api/occasions/` | Create occasion |

## Deploy on Render (free tier)

Push repo → **Blueprint** → `render.yaml`.

| Service | Role |
|---------|------|
| `giftai-frontend` | Static React (`VITE_API_ORIGIN` → API) |
| `giftai-api` | Django API (`FRONTEND_URL` for CORS + cookies) |
| `giftai-db` | Postgres |

**Open the app:** `https://giftai-frontend.onrender.com`

**API health:** `https://giftai-api.onrender.com/api/health/` → `"status":"ok","app":"giftly-django"` (not `All good`).

On `giftai-api`: set `GROQ_API_KEY`, `FRONTEND_URL=https://giftai-frontend.onrender.com`.  
Do not set `CORS_ALLOWED_ORIGINS=*`.

Reseed DB: Shell → `python manage.py seed_mock_data --force`

## Environment

Copy `backend/.env.example` to `backend/.env` for local overrides.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Local: `/api` (Vite proxy). Production static: use `VITE_API_ORIGIN` |
| `VITE_API_ORIGIN` | No | Render frontend build: `https://giftai-api.onrender.com` |
| `FRONTEND_URL` | No | Render API: `https://giftai-frontend.onrender.com` (CORS + CSRF cookies) |
| `GROQ_API_KEY` | No | [Groq](https://console.groq.com/keys) API key — real Gift Detective replies |
| `GROQ_MODEL` | No | Default `openai/gpt-oss-120b` |
| `GROQ_REASONING_EFFORT` | No | Default `medium` (for reasoning models) |

**Local AI:** add to project root `.env` or `backend/.env`:

```
GROQ_API_KEY=gsk_...
```

**Render:** Dashboard → service **`giftai-api`** → **Environment** → Add `GROQ_API_KEY` → Save → Redeploy both services.

Without `GROQ_API_KEY`, Gift Detective uses demo replies.  
Check: `GET /api/health/` → `"ai_enabled": true` when the key is set.
