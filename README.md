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

**Production (Render):** one URL `https://giftai.onrender.com` — Django serves API + React app together.

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

Push repo → **New Blueprint** → `render.yaml`.

**One service `giftai`** — frontend + API on the same domain (no CORS, no broken assets).

| Step | What |
|------|------|
| Build | `npm build` → copy to Django → `collectstatic` |
| Start | `migrate` → `seed` → gunicorn |

Open: `https://giftai.onrender.com`

Delete old separate `giftai-frontend` / `giftai-api` services if you had them before.

Reseed DB: Shell → `python manage.py seed_mock_data --force`

## Environment

Copy `backend/.env.example` to `backend/.env` for local overrides.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Frontend API path (default `/api`) |
| `GROQ_API_KEY` | No | [Groq](https://console.groq.com/keys) API key — real Gift Detective replies |
| `GROQ_MODEL` | No | Default `openai/gpt-oss-120b` |
| `GROQ_REASONING_EFFORT` | No | Default `medium` (for reasoning models) |

**Local AI:** add to project root `.env` or `backend/.env`:

```
GROQ_API_KEY=gsk_...
```

**Render:** Dashboard → service `giftai` → **Environment** → Add `GROQ_API_KEY` → Save → Redeploy.  
Blueprint already declares the variable (`sync: false`); you only paste the value in the UI.

Without `GROQ_API_KEY`, Gift Detective uses demo replies.  
Check: `GET /api/health/` → `"ai_enabled": true` when the key is set.
