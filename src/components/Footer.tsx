import { Globe, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';

export function Footer() {
  const { t } = useLanguage();
  const { navigate, showToast, openPanel } = useNavigation();

  return (
    <footer className="w-full border-t border-outline-variant/40 bg-surface-container-lowest py-16 mt-16">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 mb-8 lg:mb-0">
          <button type="button" onClick={() => navigate('home')} className="text-2xl font-serif text-primary block mb-4 cursor-pointer hover:opacity-80">
            Giftly AI
          </button>
          <p className="text-base text-on-surface-variant leading-relaxed max-w-sm">{t('footer.desc')}</p>
          <div className="flex gap-4 mt-8">
            <button type="button" onClick={() => showToast(t('footer.story'))} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-secondary/10 transition-colors cursor-pointer">
              <Globe className="w-5 h-5 text-primary" />
            </button>
            <button type="button" onClick={() => navigate('gift-sets')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-secondary/10 transition-colors cursor-pointer">
              <Heart className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
        <div className="col-span-6 lg:col-span-2">
          <h5 className="text-sm font-bold mb-6 text-primary uppercase tracking-wider">{t('footer.company')}</h5>
          <ul className="space-y-4">
            <li><button type="button" onClick={() => openPanel('help')} className="text-sm text-on-surface-variant hover:text-primary transition-all hover:underline cursor-pointer">{t('footer.story')}</button></li>
            <li><button type="button" onClick={() => navigate('gift-sets')} className="text-sm text-on-surface-variant hover:text-primary transition-all hover:underline cursor-pointer">{t('footer.sustainability')}</button></li>
            <li><button type="button" onClick={() => navigate('calendar')} className="text-sm text-on-surface-variant hover:text-primary transition-all hover:underline cursor-pointer">{t('footer.shipping')}</button></li>
          </ul>
        </div>
        <div className="col-span-6 lg:col-span-2">
          <h5 className="text-sm font-bold mb-6 text-primary uppercase tracking-wider">{t('footer.legal')}</h5>
          <ul className="space-y-4">
            <li><button type="button" onClick={() => openPanel('settings')} className="text-sm text-on-surface-variant hover:text-primary transition-all hover:underline cursor-pointer">{t('footer.privacy')}</button></li>
            <li><button type="button" onClick={() => openPanel('settings')} className="text-sm text-on-surface-variant hover:text-primary transition-all hover:underline cursor-pointer">{t('footer.terms')}</button></li>
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:text-right mt-8 lg:mt-0 flex flex-col lg:items-end justify-between">
          <div>
            <h5 className="text-sm font-bold mb-4 text-primary uppercase tracking-wider">{t('footer.stayInspired')}</h5>
            <p className="text-sm text-on-surface-variant mb-4">{t('footer.receive')}</p>
            <form className="flex gap-2 max-w-sm lg:ml-auto" onSubmit={(e) => { e.preventDefault(); showToast(t('footer.join')); }}>
              <input className="flex-1 bg-white border border-outline-variant rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder={t('footer.emailPlaceholder')} type="email" />
              <button type="submit" className="bg-accent text-on-accent px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer">{t('footer.join')}</button>
            </form>
          </div>
        </div>
        <div className="col-span-12 pt-8 mt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-on-surface-variant">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
