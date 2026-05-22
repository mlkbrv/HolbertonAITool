#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

cd "$(dirname "$0")/.."

if [ "${API_ONLY:-false}" = "true" ]; then
  echo "==> API-only build (frontend served separately)"
  python manage.py collectstatic --noinput
  exit 0
fi

ROOT="$(cd .. && pwd)"
echo "==> Building bundled frontend from $ROOT"
cd "$ROOT"
npm install
VITE_API_URL=/api VITE_SHOW_TEST_TOOLS=true npm run build

rm -rf backend/frontend_dist
mkdir -p backend/frontend_dist
cp -r dist/* backend/frontend_dist/

cd backend
python manage.py collectstatic --noinput