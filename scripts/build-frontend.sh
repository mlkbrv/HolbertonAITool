#!/usr/bin/env bash
set -o errexit

npm install
VITE_API_ORIGIN="${VITE_API_ORIGIN:-https://giftai-api.onrender.com}" \
VITE_SHOW_TEST_TOOLS="${VITE_SHOW_TEST_TOOLS:-true}" \
npm run build
