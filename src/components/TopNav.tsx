import { Search, Bell, Gift, ShoppingCart, User, Menu } from 'lucide-react';
import { ViewState, AppPanel, RecipientFilter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Language } from '../i18n/translations';

interface TopNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onBrowseRecipient: (filter: RecipientFilter) => void;
  onOpenPanel: (panel: AppPanel) => void;
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

export function TopNav({
  currentView,
  onNavigate,
  onBrowseRecipient,
  onOpenPanel,
  mobileNavOpen,
  onToggleMobileNav,
}: TopNavProps) {
  const { t, language, setLanguage } = useLanguage();
  const { count } = useCart();

  return (
    <header className="fixed top-0 w-full z-50 bg-soft-cream/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm pointer-events-auto">
      <div className="flex justify-between items-center px-6 md:px-20 py-4 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-4 md:gap-12">
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="md:hidden p-2 rounded-xl hover:bg-surface-container transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-primary" />
          </button>
          <span
            className="text-2xl font-serif italic text-primary cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('home')}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
            role="button"
            tabIndex={0}
          >
            Giftly
          </span>
          <div className="hidden lg:flex gap-8">
            <button
              type="button"
              onClick={() => onBrowseRecipient('mom')}
              className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              {t('nav.mom')}
            </button>
            <button
              type="button"
              onClick={() => onBrowseRecipient('partner')}
              className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              {t('nav.partner')}
            </button>
            <button
              type="button"
              onClick={() => onBrowseRecipient('colleague')}
              className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              {t('nav.colleague')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('gift-sets')}
              className={`text-sm font-semibold transition-colors ${currentView === 'gift-sets' ? 'text-primary border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-primary pb-1 border-b-2 border-transparent'}`}
            >
              {t('nav.giftSets')}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-transparent text-sm font-semibold text-primary outline-none cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="az">AZ</option>
            <option value="ru">RU</option>
          </select>
          <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/20 hover:border-primary/20 transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="text-on-surface-variant w-4 h-4 mr-2" />
            <input
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-48 text-on-surface placeholder:text-on-surface-variant/60"
              placeholder={t('nav.search')}
              type="text"
              onKeyDown={(e) => e.key === 'Enter' && onNavigate('gift-sets')}
            />
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-primary">
            <button
              type="button"
              onClick={() => onOpenPanel('notifications')}
              className="p-2 hover:bg-surface-container-high/50 rounded-full transition-colors active:scale-95 duration-150"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('detective')}
              className="p-2 hover:bg-surface-container-high/50 rounded-full transition-colors active:scale-95 duration-150"
            >
              <Gift className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onOpenPanel('cart')}
              className="p-2 hover:bg-surface-container-high/50 rounded-full transition-colors active:scale-95 duration-150 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-secondary text-on-secondary text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-soft-cream">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onOpenPanel('account')}
              className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/50 flex items-center justify-center bg-surface-container-highest hover:opacity-80 transition-opacity active:scale-95"
            >
              <User className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>
      {mobileNavOpen && (
        <div className="md:hidden border-t border-outline-variant/20 px-4 py-2 bg-soft-cream/95">
          <p className="text-xs text-on-surface-variant px-2 py-1">{t('nav.tapMenu')}</p>
        </div>
      )}
    </header>
  );
}
