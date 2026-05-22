import { useLanguage } from '../contexts/LanguageContext';

const UNIFIED_URL = 'https://giftai.onrender.com';
const LEGACY_HOSTS = new Set(['giftai-frontend.onrender.com', 'giftai-api.onrender.com']);

export function LegacyHostBanner() {
  const { t } = useLanguage();
  if (typeof window === 'undefined' || !LEGACY_HOSTS.has(window.location.hostname)) {
    return null;
  }
  return (
    <div className="fixed top-20 left-0 right-0 z-[60] px-4 pointer-events-auto">
      <div className="max-w-3xl mx-auto bg-accent text-on-accent text-sm font-semibold px-4 py-3 rounded-xl shadow-lg text-center">
        {t('legacy.banner')}{' '}
        <a href={UNIFIED_URL} className="underline font-bold">
          {UNIFIED_URL.replace('https://', '')}
        </a>
      </div>
    </div>
  );
}
