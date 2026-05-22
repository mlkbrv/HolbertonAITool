import { Globe, Heart, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-outline-variant/40 bg-surface-container-lowest py-16 mt-16">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 mb-8 lg:mb-0">
          <span className="text-2xl font-serif text-primary block mb-4">Giftly AI</span>
          <p className="text-base text-on-surface-variant leading-relaxed max-w-sm">
            {t('footer.desc')}
          </p>
          <div className="flex gap-4 mt-8">
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-secondary/10 transition-colors">
              <Globe className="w-5 h-5 text-primary" />
            </button>
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-secondary/10 transition-colors">
              <Heart className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
        <div className="col-span-6 lg:col-span-2">
          <h5 className="text-sm font-bold mb-6 text-primary uppercase tracking-wider">{t('footer.company')}</h5>
          <ul className="space-y-4">
            <li><a className="text-sm text-on-surface-variant hover:text-primary transition-all hover:underline" href="#">{t('footer.story')}</a></li>
            <li><a className="text-sm text-on-surface-variant hover:text-primary transition-all hover:underline" href="#">{t('footer.sustainability')}</a></li>
            <li><a className="text-sm text-on-surface-variant hover:text-primary transition-all hover:underline" href="#">{t('footer.shipping')}</a></li>
          </ul>
        </div>
        <div className="col-span-6 lg:col-span-2">
          <h5 className="text-sm font-bold mb-6 text-primary uppercase tracking-wider">{t('footer.legal')}</h5>
          <ul className="space-y-4">
            <li><a className="text-sm text-on-surface-variant hover:text-primary transition-all hover:underline" href="#">{t('footer.privacy')}</a></li>
            <li><a className="text-sm text-on-surface-variant hover:text-primary transition-all hover:underline" href="#">{t('footer.terms')}</a></li>
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:text-right mt-8 lg:mt-0 flex flex-col lg:items-end justify-between">
          <div>
            <h5 className="text-sm font-bold mb-4 text-primary uppercase tracking-wider">{t('footer.stayInspired')}</h5>
            <p className="text-sm text-on-surface-variant mb-4">{t('footer.receive')}</p>
            <form className="flex gap-2 max-w-sm ml-auto" onSubmit={(e) => e.preventDefault()}>
              <input className="flex-1 bg-white border border-outline-variant rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder={t('footer.emailPlaceholder')} type="email" />
              <button className="bg-accent text-on-accent px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">{t('footer.join')}</button>
            </form>
          </div>
        </div>
        <div className="col-span-12 pt-8 mt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-on-surface-variant text-center md:text-left">{t('footer.copyright')}</p>
            <div className="flex gap-8">
              <Share2 className="text-primary w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
            </div>
        </div>
      </div>
    </footer>
  );
}
