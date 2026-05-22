#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
echo "==> Building frontend from $ROOT"
cd "$ROOT"
npm install
VITE_API_URL=/api npm run build

rm -rf backend/frontend_dist
mkdir -p backend/frontend_dist
cp -r dist/* backend/frontend_dist/

cd backend
python manage.py collectstatic --noinput
