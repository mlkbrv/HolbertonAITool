import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, UploadCloud, Link as LinkIcon, Brain } from 'lucide-react';
import { Footer } from '../components/Footer';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { api, Dashboard } from '../api/client';

interface HomeViewProps {
  onNavigate: (view: ViewState) => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    api.dashboard().then(setDashboard).catch(() => setDashboard(null));
  }, []);

  const occasions = dashboard?.upcoming_occasions ?? [];
  const curated = dashboard?.curated_gift_sets ?? [];
  const offer = dashboard?.corporate_offers?.[0];

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-6 pb-16">
        {/* Hero: AI Detective */}
        <section className="mt-8 mb-16 rounded-[32px] overflow-hidden hero-gradient border border-outline-variant/10 relative">
          <div className="grid grid-cols-12 items-center">
            <div className="col-span-12 lg:col-span-7 p-12 lg:p-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4 fill-current text-ai-glow" />
                {t('home.aiActive')}
              </div>
              <h2 className="text-5xl font-serif font-bold mb-6 text-primary leading-tight">
                {t('home.heroTitle1')} <br />{t('home.heroTitle2')}
              </h2>
              <p className="text-lg text-on-surface-variant mb-10 max-w-lg">
                {t('home.heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => onNavigate('detective')}
                  className="px-8 py-4 bg-accent text-on-accent rounded-full font-semibold flex items-center gap-3 hover:scale-105 transition-transform"
                >
                  <UploadCloud className="w-5 h-5" />
                  {t('home.uploadSources')}
                </button>
                <button className="px-8 py-4 glass text-primary rounded-full font-semibold border-secondary flex items-center gap-3 hover:bg-white/90 transition-all">
                  <LinkIcon className="w-5 h-5" />
                  {t('home.pasteLink')}
                </button>
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-5 relative h-[400px]">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{backgroundImage: 'url("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000&auto=format&fit=crop")'}}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#e1e0ff] via-transparent to-transparent"></div>
              </div>
              
              <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-8 glass p-6 rounded-2xl shadow-2xl max-w-[280px] border-white/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-ai-glow/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-ai-glow" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{t('home.personalityAnalysis')}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">{t('home.inProgress')}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-ai-glow w-3/4 rounded-full animate-pulse-soft"></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 text-xs font-semibold">
                    <span className="px-2 py-1 bg-primary/5 rounded-full text-primary">{t('home.minimalist')}</span>
                    <span className="px-2 py-1 bg-primary/5 rounded-full text-primary">{t('home.coffee')}</span>
                    <span className="px-2 py-1 bg-primary/5 rounded-full text-primary">{t('home.wanderlust')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gifting Calendar & CRM */}
        <section className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-3xl font-serif font-bold text-primary mb-2">{t('home.giftingCalendar')}</h3>
                <p className="text-base text-on-surface-variant">{t('home.neverMiss')}</p>
              </div>
              <button 
                onClick={() => onNavigate('calendar')}
                className="text-sm font-semibold text-secondary border-b border-secondary/30 hover:border-secondary transition-all"
              >
                {t('home.viewFullYear')}
              </button>
            </div>
            
            <div className="space-y-4">
              {occasions.map((occ) => (
                <div
                  key={occ.id}
                  onClick={() => onNavigate('calendar')}
                  className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${occ.status === 'gift_ready' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'}`}>
                    <span className="text-xs font-semibold uppercase">{occ.month_label}</span>
                    <span className="text-2xl font-serif font-bold leading-none">{occ.day_label}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-serif font-semibold text-primary mb-1">{occ.title}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                        {t('home.inDays').replace('{days}', String(occ.days_until))}
                      </span>
                      <div className="flex-1 max-w-[200px] h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: `${occ.progress_percent}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-secondary">
                        {occ.status === 'gift_ready' ? t('home.giftReady') : t('home.analysisReq')}
                      </span>
                    </div>
                  </div>
                  <button className="p-4 rounded-full border border-outline-variant/30 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    {occ.status === 'gift_ready' ? <ArrowRight className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-primary-container text-white p-8 rounded-[32px] h-full relative overflow-hidden flex flex-col">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-ai-glow/20 blur-[80px] rounded-full"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 text-on-primary-container mb-6">
                    <span className="text-xs font-semibold tracking-widest uppercase">{t('home.businessElite')}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4">{t('home.corpConcierge')}</h3>
                  <p className="text-base text-on-primary-container mb-8 leading-relaxed">
                      {t('home.corpDesc')}
                  </p>
               </div>
               <div className="mt-auto space-y-4 relative z-10">
                  {offer && (
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                      <p className="text-xs font-semibold text-ai-glow mb-1">{offer.is_new ? t('home.newOffer') : t('home.businessElite')}</p>
                      <h5 className="text-sm font-bold">{offer.title}</h5>
                    </div>
                  )}
                  <button className="w-full py-4 bg-white text-primary rounded-xl font-semibold hover:scale-[1.02] transition-transform">
                      {t('home.openDashboard')}
                  </button>
               </div>
            </div>
          </div>
        </section>

        {/* Curated For You */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-serif font-bold text-primary">{t('home.curated')}</h3>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
              <button className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto scroll-hide pb-8 -mx-6 px-6">
            {curated.map((gift) => (
              <div
                key={gift.id}
                className="min-w-[320px] bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex-shrink-0 cursor-pointer"
                onClick={() => onNavigate('gift-sets')}
              >
                <div className="h-64 relative overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={gift.image_url} alt={gift.title} />
                  <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border-white/60">
                    <Sparkles className="w-4 h-4 text-ai-glow fill-current" />
                    <span className="text-xs font-bold text-primary">{gift.match_percent}% {t('home.match')}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-serif font-semibold text-primary mb-1">{gift.title}</h4>
                  <div className="flex items-center gap-2 mb-4">
                    {gift.edition_label && (
                      <span className="px-2 py-0.5 bg-secondary-container/30 text-secondary text-[10px] font-bold rounded uppercase tracking-wider">{gift.edition_label}</span>
                    )}
                    <span className="text-xs text-on-surface-variant font-semibold">${gift.price}</span>
                  </div>
                  <button className="w-full py-3 border border-secondary text-secondary font-semibold rounded-xl hover:bg-secondary hover:text-white transition-all">
                    {t('home.viewSet')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
