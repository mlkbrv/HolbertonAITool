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

## Deploy on Render

Uses [`render.yaml`](render.yaml):

1. PostgreSQL database `giftai-db`
2. Web service `giftai-api` (Django + gunicorn)
3. Static site `giftai-frontend` (Vite build)

After deploy, set in Render dashboard:

- **giftai-api** → `ALLOWED_HOSTS` = your API hostname
- **giftai-api** → `CORS_ALLOWED_ORIGINS` = frontend URL
- **giftai-frontend** → `VITE_API_URL` = `https://your-api.onrender.com/api`

`postDeployCommand` runs `seed_mock_data` automatically.

## Environment

Copy `backend/.env.example` to `backend/.env` for local overrides.

Frontend: `VITE_API_URL=/api` (default, uses Vite proxy).
