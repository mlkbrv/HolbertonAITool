import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '../contexts/NavigationContext';

interface CartPanelProps {
  onClose: () => void;
}

export function CartPanel({ onClose }: CartPanelProps) {
  const { t } = useLanguage();
  const { isLoggedIn, login, register } = useAuth();
  const { items, total, updateQty, removeItem, checkout } = useCart();
  const { showToast } = useNavigation();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!isLoggedIn) return;
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      await checkout();
      showToast(t('checkout.success'));
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      showToast(t('auth.welcome'));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Auth failed');
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
      {items.length === 0 ? (
        <p className="text-sm text-on-surface-variant">{t('panel.cartEmpty')}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 p-3 bg-surface-container rounded-2xl">
              <img src={item.gift_set.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary truncate">{item.gift_set.title}</p>
                <p className="text-xs text-on-surface-variant">${item.gift_set.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button type="button" onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1 rounded-lg border border-outline-variant/40 cursor-pointer">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                  <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1 rounded-lg border border-outline-variant/40 cursor-pointer">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => removeItem(item.id)} className="ml-auto p-1 text-on-surface-variant hover:text-primary cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="border-t border-outline-variant/20 pt-4">
          <div className="flex justify-between text-lg font-bold text-primary mb-4">
            <span>{t('cart.total')}</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {!isLoggedIn ? (
            <form onSubmit={handleAuth} className="space-y-3">
              <p className="text-sm text-on-surface-variant">{t('checkout.loginRequired')}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-xl text-sm font-semibold cursor-pointer ${authMode === 'login' ? 'bg-secondary text-on-secondary' : 'border border-outline-variant/40'}`}>
                  {t('auth.login')}
                </button>
                <button type="button" onClick={() => setAuthMode('register')} className={`flex-1 py-2 rounded-xl text-sm font-semibold cursor-pointer ${authMode === 'register' ? 'bg-secondary text-on-secondary' : 'border border-outline-variant/40'}`}>
                  {t('auth.register')}
                </button>
              </div>
              {authMode === 'register' && (
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.name')} className="w-full px-4 py-2 border border-outline-variant/40 rounded-xl text-sm" />
              )}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} required className="w-full px-4 py-2 border border-outline-variant/40 rounded-xl text-sm" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password')} required className="w-full px-4 py-2 border border-outline-variant/40 rounded-xl text-sm" />
              <button type="submit" className="w-full py-3 bg-secondary text-on-secondary rounded-xl font-semibold cursor-pointer">
                {authMode === 'login' ? t('auth.login') : t('auth.register')}
              </button>
              <p className="text-xs text-center text-on-surface-variant">
                {t('auth.demo')}: demo@giftly.app / demo1234
              </p>
            </form>
          ) : (
            <button type="button" onClick={handleCheckout} disabled={checkingOut} className="w-full py-3 bg-accent text-on-accent rounded-xl font-semibold cursor-pointer disabled:opacity-50">
              {checkingOut ? '...' : t('checkout.pay')}
            </button>
          )}
        </div>
      )}

      {items.length === 0 && (
        <button type="button" onClick={() => { onClose(); }} className="w-full py-3 border border-secondary text-secondary rounded-xl font-semibold cursor-pointer">
          {t('nav.giftSets')}
        </button>
      )}
    </div>
  );
}
