import { useEffect, useState } from 'react';
import { SlidersHorizontal, Sparkles, Heart } from 'lucide-react';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { api, GiftSet, unwrapList } from '../api/client';

export function GiftSetsView() {
  const { t } = useLanguage();
  const [sensitivity, setSensitivity] = useState(50);
  const [gifts, setGifts] = useState<GiftSet[]>([]);

  useEffect(() => {
    api.giftSets().then((data) => setGifts(unwrapList(data))).catch(() => setGifts([]));
  }, []);

  return (
    <>
      <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-8 pb-16">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant mb-4">
            <span className="cursor-pointer hover:text-primary">{t('sidebar.home')}</span>
            <span>&gt;</span>
            <span className="cursor-pointer hover:text-primary">{t('sidebar.detective')}</span>
            <span>&gt;</span>
            <span className="text-primary font-bold">{t('home.curated')}</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-serif font-bold text-primary mb-2">{t('sets.title')}</h1>
              <p className="text-lg text-on-surface-variant">{t('sets.subtitle')}</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-outline-variant/60 rounded-full text-sm font-semibold hover:bg-surface transition-all">
              <SlidersHorizontal className="w-4 h-4" />
              {t('sets.filter')}
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-72 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              
              <div>
                <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">{t('sets.recipient')}</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline text-secondary focus:ring-secondary/20 bg-surface-container" />
                    <span className="text-base text-on-surface-variant group-hover:text-primary transition-colors">{t('nav.mom')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded border-outline text-secondary focus:ring-secondary/20 bg-surface-container" />
                    <span className="text-base text-on-surface-variant group-hover:text-primary transition-colors">{t('nav.partner')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded border-outline text-secondary focus:ring-secondary/20 bg-surface-container" />
                    <span className="text-base text-on-surface-variant group-hover:text-primary transition-colors">{t('nav.colleague')}</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">{t('sets.category')}</h3>
                <div className="space-y-2">
                  <div className="p-2 -mx-2 bg-tertiary-fixed/30 rounded-lg">
                    <button className="w-full text-left text-base font-semibold text-primary">{t('sets.luxury')}</button>
                  </div>
                  <button className="w-full text-left text-base text-on-surface-variant hover:text-primary p-2 -mx-2 transition-colors">{t('sets.wellness')}</button>
                  <button className="w-full text-left text-base text-on-surface-variant hover:text-primary p-2 -mx-2 transition-colors">{t('sets.experience')}</button>
                  <button className="w-full text-left text-base text-on-surface-variant hover:text-primary p-2 -mx-2 transition-colors">{t('sets.gourmet')}</button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">{t('sets.price')}</h3>
                <div className="space-y-4">
                  <div className="h-1 bg-surface-container-highest rounded-full relative">
                    <div className="absolute left-1/4 right-1/4 h-1 bg-secondary rounded-full"></div>
                    <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-secondary rounded-full shadow-sm"></div>
                    <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-secondary rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                    <span className="px-3 py-1 bg-white border border-outline-variant/60 rounded">$50</span>
                    <span>to</span>
                    <span className="px-3 py-1 bg-white border border-outline-variant/60 rounded">$250</span>
                  </div>
                </div>
              </div>
              
              <div className="p-5 rounded-2xl glassmorphism border-ai-glow/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-ai-glow/5 to-transparent"></div>
                <div className="relative">
                  <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-ai-glow" />
                    {t('sets.sensitivity')}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">{t('sets.sensitivityDesc')}</p>
                  
                  <input 
                    type="range" 
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Number(e.target.value))}
                    className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-ai-glow cursor-pointer" 
                  />
                  <div className="flex justify-between mt-3 text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">
                    <span>{t('sets.conservative')}</span>
                    <span>{t('sets.experimental')}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map((gift) =>
                gift.is_featured ? (
                  <div key={gift.id} className="group bg-primary-container rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant/20 flex flex-col h-full lg:col-span-2 relative cursor-pointer">
                    <div className="absolute inset-0">
                      <img src={gift.image_url} className="w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" alt={gift.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
                    </div>
                    <div className="relative h-full flex flex-col p-8 md:p-10 z-10 text-white min-h-[320px]">
                      <div className="mt-auto">
                        <span className="inline-block bg-ai-glow text-white px-3 py-1 rounded-full text-xs font-bold mb-4">{t('sets.recommended')}</span>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">{gift.title}</h2>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                          <div>
                            <p className="text-base text-white/80 mb-2">{gift.description}</p>
                            <p className="text-2xl font-serif font-bold">${gift.price}</p>
                          </div>
                          <button className="px-8 py-3 bg-white text-primary rounded-full text-sm font-bold hover:bg-white/90 transition-all flex items-center gap-2 w-max">
                            <Sparkles className="w-4 h-4 fill-current text-primary" />
                            {t('sets.viewFull')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={gift.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant/20 flex flex-col h-full cursor-pointer">
                    <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
                      <img src={gift.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={gift.title} />
                      <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Sparkles className="w-3 h-3 text-ai-glow fill-current" />
                        <span className="text-xs font-bold text-primary">{gift.match_percent}% {t('home.match')}</span>
                      </div>
                      <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      {gift.recipient_label && (
                        <p className="text-xs font-semibold text-secondary uppercase tracking-[0.2em] mb-2">{gift.recipient_label}</p>
                      )}
                      <h3 className="text-xl font-serif font-bold text-primary mb-2 leading-tight">{gift.title}</h3>
                      <p className="text-sm text-on-surface-variant line-clamp-2 mb-6">{gift.description}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-2xl font-serif font-bold text-primary">${gift.price}</span>
                        <button className="px-4 py-2 bg-accent text-on-accent rounded-full text-sm font-bold hover:bg-accent/90 transition-colors">{t('sets.addToBag')}</button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
