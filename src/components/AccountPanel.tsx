import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { api, OrderRow, prefetchCsrf, SubscriptionPlan } from '../api/client';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../constants/demo';

interface AccountPanelProps {
  onClose: () => void;
}

export function AccountPanel({ onClose }: AccountPanelProps) {
  const { t } = useLanguage();
  const { user, plan, isLoggedIn, login, register, logout, setMe, refreshMe } = useAuth();
  const { showToast } = useNavigation();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    api.getPlans().then(setPlans).catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      api.getOrders().then(setOrders).catch(() => setOrders([]));
    }
  }, [isLoggedIn, plan?.slug]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      await refreshMe();
      showToast(t('auth.welcome'));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Auth failed');
    }
  };

  const handleSubscribe = async (slug: string) => {
    if (!isLoggedIn) {
      showToast(t('checkout.loginRequired'));
      return;
    }
    if (plan?.slug === slug) return;
    setSubscribing(slug);
    try {
      await prefetchCsrf();
      const res = await api.checkoutSubscription(slug);
      setMe(res.me);
      showToast(t('plans.subscribed'));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubscribing(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast(t('auth.loggedOut'));
  };

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant">{t('panel.accountDesc')}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-xl text-sm font-semibold cursor-pointer ${authMode === 'login' ? 'bg-secondary text-on-secondary' : 'border border-outline-variant/40'}`}>
            {t('auth.login')}
          </button>
          <button type="button" onClick={() => setAuthMode('register')} className={`flex-1 py-2 rounded-xl text-sm font-semibold cursor-pointer ${authMode === 'register' ? 'bg-secondary text-on-secondary' : 'border border-outline-variant/40'}`}>
            {t('auth.register')}
          </button>
        </div>
        <form onSubmit={handleAuth} className="space-y-3">
          {authMode === 'register' && (
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.name')} className="w-full px-4 py-2 border border-outline-variant/40 rounded-xl text-sm" />
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} required className="w-full px-4 py-2 border border-outline-variant/40 rounded-xl text-sm" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password')} required className="w-full px-4 py-2 border border-outline-variant/40 rounded-xl text-sm" />
          <button type="submit" className="w-full py-3 bg-secondary text-on-secondary rounded-xl font-semibold cursor-pointer">
            {authMode === 'login' ? t('auth.login') : t('auth.register')}
          </button>
        </form>
        <p className="text-xs text-center text-on-surface-variant">{t('auth.demo')}: {DEMO_EMAIL} / {DEMO_PASSWORD}</p>
        <button
          type="button"
          onClick={() => {
            setAuthMode('login');
            setEmail(DEMO_EMAIL);
            setPassword(DEMO_PASSWORD);
          }}
          className="w-full py-2 border border-dashed border-secondary/50 text-secondary rounded-xl text-xs font-semibold cursor-pointer"
        >
          {t('test.fillDemo')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 p-4 bg-surface-container rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center font-bold text-primary">
          {(user?.first_name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-primary">{user?.first_name || user?.email}</p>
          <p className="text-xs text-on-surface-variant">{user?.email}</p>
          <p className="text-xs font-bold text-secondary mt-1">{plan?.name} — ${plan?.price_monthly}/mo</p>
        </div>
      </div>

      <button type="button" onClick={() => setShowOrders(!showOrders)} className="text-sm font-semibold text-secondary hover:underline cursor-pointer">
        {t('orders.title')} ({orders.length})
      </button>
      {showOrders && (
        <ul className="space-y-2 text-sm">
          {orders.length === 0 && <li className="text-on-surface-variant">{t('orders.empty')}</li>}
          {orders.map((o) => (
            <li key={o.id} className="p-3 bg-surface-container rounded-xl">
              <span className="font-semibold">#{o.id}</span> — {o.order_type} — ${o.total} — {o.status}
            </li>
          ))}
        </ul>
      )}

      <h3 className="text-lg font-serif font-bold text-primary">{t('plans.title')}</h3>
      <div className="space-y-3">
        {plans.map((p) => {
          const isCurrent = plan?.slug === p.slug;
          return (
            <div key={p.slug} className={`p-4 rounded-2xl border ${isCurrent ? 'border-secondary bg-secondary/5' : 'border-outline-variant/30'}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-primary">{p.name}</h4>
                <span className="font-serif font-bold">${p.price_monthly}<span className="text-xs font-sans">/mo</span></span>
              </div>
              <p className="text-xs text-on-surface-variant mb-3">{p.description}</p>
              <ul className="text-xs space-y-1 mb-3">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1"><Check className="w-3 h-3 text-secondary" />{f}</li>
                ))}
              </ul>
              <button
                type="button"
                disabled={isCurrent || subscribing === p.slug}
                onClick={() => handleSubscribe(p.slug)}
                className="w-full py-2 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50 bg-accent text-on-accent disabled:bg-surface-container disabled:text-on-surface-variant"
              >
                {isCurrent ? t('plans.current') : subscribing === p.slug ? '...' : t('plans.subscribe')}
              </button>
            </div>
          );
        })}
      </div>

      <button type="button" onClick={handleLogout} className="w-full py-2 border border-outline-variant/40 rounded-xl text-sm font-semibold cursor-pointer">
        {t('auth.logout')}
      </button>
    </div>
  );
}
