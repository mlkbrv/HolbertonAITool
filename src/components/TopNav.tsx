import { Search, Bell, Gift, ShoppingCart, User } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../i18n/translations';

interface TopNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export function TopNav({ currentView, onNavigate }: TopNavProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <header className="fixed top-0 w-full z-50 bg-soft-cream/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
      <div className="flex justify-between items-center px-6 md:px-20 py-4 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-12">
          <span 
            className="text-2xl font-serif italic text-primary cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('home')}
          >
            Giftly
          </span>
          <div className="hidden lg:flex gap-8">
            <button className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">{t('nav.mom')}</button>
            <button className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">{t('nav.partner')}</button>
            <button className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">{t('nav.colleague')}</button>
            <button 
              onClick={() => onNavigate('gift-sets')}
              className={`text-sm font-semibold transition-colors ${currentView === 'gift-sets' ? 'text-primary border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-primary pb-1 border-b-2 border-transparent'}`}
            >
              {t('nav.giftSets')}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6">
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
            <input className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-48 text-on-surface placeholder:text-on-surface-variant/60" placeholder={t('nav.search')} type="text" />
          </div>
          <div className="flex items-center gap-4 text-primary">
            <button className="p-2 hover:bg-surface-container-high/50 rounded-full transition-colors active:scale-95 duration-150"><Bell className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-surface-container-high/50 rounded-full transition-colors active:scale-95 duration-150"><Gift className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-surface-container-high/50 rounded-full transition-colors active:scale-95 duration-150 relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full border-2 border-soft-cream"></span>
            </button>
            <button className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/50 flex items-center justify-center bg-surface-container-highest hover:opacity-80 transition-opacity active:scale-95">
              <User className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
