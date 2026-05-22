#!/usr/bin/env bash
set -o errexit

echo "==> Applying migrations..."
python manage.py migrate --noinput

echo "==> Seeding mock data (if empty)..."
python manage.py seed_mock_data

echo "==> Starting gunicorn..."
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers 2 \
  --threads 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
