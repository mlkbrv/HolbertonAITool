export const UNIFIED_APP_URL = 'https://giftai.onrender.com';

export const LEGACY_APP_HOSTS = new Set([
  'giftai-frontend.onrender.com',
  'giftai-api.onrender.com',
]);

export function redirectLegacyHostIfNeeded(): void {
  if (typeof window === 'undefined') return;
  if (!LEGACY_APP_HOSTS.has(window.location.hostname)) return;
  const target = new URL(UNIFIED_APP_URL);
  target.pathname = window.location.pathname;
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target.toString());
}
