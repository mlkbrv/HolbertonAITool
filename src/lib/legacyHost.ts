export const FRONTEND_APP_URL = 'https://giftai-frontend.onrender.com';

export const API_ORIGIN_DEFAULT = 'https://giftai-api.onrender.com';

export const STUB_HOSTS = new Set(['giftai.onrender.com']);

export function redirectStubHostIfNeeded(): void {
  if (typeof window === 'undefined') return;
  if (!STUB_HOSTS.has(window.location.hostname)) return;
  const target = new URL(FRONTEND_APP_URL);
  target.pathname = window.location.pathname;
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target.toString());
}
