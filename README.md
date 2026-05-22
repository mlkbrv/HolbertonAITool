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

Push repo → Render Dashboard → **New Blueprint** → select `render.yaml`.

Everything is automatic:

| Step | When | What |
|------|------|------|
| Build | deploy | `pip install`, `collectstatic` |
| Start | every boot | `migrate` → `seed_mock_data` (only if DB empty) → gunicorn |
| CORS / hosts | auto | `*.onrender.com` + linked frontend URL |
| Frontend API URL | auto | `VITE_API_URL` from `giftai-api` service |

No manual env vars required for a standard Blueprint deploy.

Reseed DB: Render Shell → `python manage.py seed_mock_data --force`

## Environment

Copy `backend/.env.example` to `backend/.env` for local overrides.

Frontend: `VITE_API_URL=/api` (default, uses Vite proxy).
