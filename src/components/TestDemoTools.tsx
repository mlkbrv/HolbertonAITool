import { useState } from 'react';
import { FlaskConical, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '../contexts/NavigationContext';
import { api } from '../api/client';
import { DEMO_CHAT_MESSAGE, DEMO_EMAIL, DEMO_GIFT_SET_ID, DEMO_INSTAGRAM, DEMO_PASSWORD } from '../constants/demo';
import { ViewState } from '../types';

const SHOW_TEST =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_TEST_TOOLS === 'true';

interface TestDemoToolsProps {
  onNavigate: (view: ViewState) => void;
  onOpenPanel: (panel: 'account' | 'cart') => void;
}

export function TestDemoTools({ onNavigate, onOpenPanel }: TestDemoToolsProps) {
  const { t } = useLanguage();
  const { login, isLoggedIn, refreshMe } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useNavigation();
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  if (!SHOW_TEST) return null;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Test action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[80] max-w-xs pointer-events-auto">
      <div className="bg-primary text-on-primary rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-bold cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-ai-glow" />
            {t('test.title')}
          </span>
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {open && (
          <div className="px-3 pb-3 space-y-2 border-t border-white/10">
            <p className="text-[10px] text-on-primary/70 px-1 pt-2">{t('test.hint')}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await login(DEMO_EMAIL, DEMO_PASSWORD);
                  await refreshMe();
                  showToast(t('test.loggedIn'));
                })
              }
              className="w-full py-2 px-3 bg-ai-glow text-primary rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {t('test.loginDemo')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onOpenPanel('account')}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {t('test.openAccount')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                sessionStorage.setItem('giftly:instagram', DEMO_INSTAGRAM);
                onNavigate('detective');
                showToast(t('test.chatHint'));
              }}
              className="w-full py-2 px-3 bg-[#E1306C]/80 hover:bg-[#E1306C] rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {t('test.instagramDemo')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onNavigate('detective');
                showToast(t('test.chatHint'));
              }}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {t('test.openChat')}
            </button>
            <p className="text-[10px] text-on-primary/60 px-1 italic break-words">{DEMO_CHAT_MESSAGE}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await addItem(DEMO_GIFT_SET_ID);
                  showToast(t('cart.added'));
                })
              }
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {t('test.addGift')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onOpenPanel('cart')}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {t('test.openCart')}
            </button>
            <div className="grid grid-cols-2 gap-1">
              {(['home', 'gift-sets', 'calendar', 'crm'] as ViewState[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={busy}
                  onClick={() => onNavigate(v)}
                  className="py-1.5 px-2 bg-white/5 hover:bg-white/15 rounded-lg text-[10px] font-semibold cursor-pointer disabled:opacity-50 capitalize"
                >
                  {v.replace('-', ' ')}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const h = await api.health(true);
                  const groq =
                    h.groq_ok === true
                      ? 'Groq OK'
                      : h.groq_ok === false
                        ? `Groq fail: ${h.groq_error || '?'}`
                        : h.ai_enabled
                          ? 'Groq not tested'
                          : 'no key';
                  showToast(`API ok · ${groq} · user: ${isLoggedIn ? 'yes' : 'no'}`);
                })
              }
              className="w-full py-2 px-3 border border-white/20 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {t('test.checkApi')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
