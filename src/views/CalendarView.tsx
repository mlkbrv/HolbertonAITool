import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Bookmark, ArrowRight, Sparkles } from 'lucide-react';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { api, Dashboard, SavedGift, unwrapList } from '../api/client';

export function CalendarView() {
  const { t } = useLanguage();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const [saved, setSaved] = useState<SavedGift[]>([]);
  const [insight, setInsight] = useState<Dashboard['calendar_insight']>(null);

  useEffect(() => {
    api.savedGifts().then((d) => setSaved(unwrapList(d))).catch(() => setSaved([]));
    api.dashboard().then((d) => setInsight(d.calendar_insight)).catch(() => setInsight(null));
  }, []);

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-6 pb-16">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">{t('calendar.title')}</h1>
            <p className="text-lg text-on-surface-variant">{t('calendar.subtitle')}</p>
          </div>
          <div className="flex items-center gap-4 glass-effect p-2 rounded-2xl w-full md:w-auto overflow-x-auto">
            <button className="p-2 hover:bg-surface-container-high rounded-xl transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-sm font-bold px-4 whitespace-nowrap">{t('calendar.month')}</span>
            <button className="p-2 hover:bg-surface-container-high rounded-xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Calendar Grid */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-outline-variant/10">
              <div className="calendar-grid mb-4">
                {['mon', 'tue', 'wed', 'thu', 'fri'].map(day => (
                  <div key={day} className="text-xs font-semibold text-on-surface-variant uppercase tracking-tighter text-center pb-2">{t(`calendar.${day}`)}</div>
                ))}
                {['sat', 'sun'].map(day => (
                  <div key={day} className="text-xs font-bold text-secondary uppercase tracking-tighter text-center pb-2">{t(`calendar.${day}`)}</div>
                ))}
              </div>
              
              <div className="calendar-grid gap-3">
                {/* Empty starting day */}
                <div className="h-28 bg-surface-container-lowest/50 rounded-2xl border border-dashed border-outline-variant/30"></div>
                
                {/* Active Day - Event 1 */}
                <div className="h-28 p-2 bg-soft-cream border border-secondary/20 rounded-2xl relative group hover:shadow-md transition-all cursor-pointer">
                  <span className="text-sm font-bold text-on-surface/40">01</span>
                  <div className="mt-1 bg-primary-container p-1.5 rounded-lg text-white text-[10px] leading-tight">
                    <p className="font-bold truncate">{t('calendar.event1')}</p>
                    <div className="flex items-center gap-1 mt-1 opacity-80">
                      <CheckCircle2 className="w-3 h-3 fill-current" />
                      <span>{t('calendar.shipped')}</span>
                    </div>
                  </div>
                </div>

                <div className="h-28 p-2 bg-white border border-outline-variant/20 rounded-2xl group hover:border-primary/30 transition-all cursor-pointer"><span className="text-sm text-on-surface/40">02</span></div>
                <div className="h-28 p-2 bg-white border border-outline-variant/20 rounded-2xl group hover:border-primary/30 transition-all cursor-pointer"><span className="text-sm text-on-surface/40">03</span></div>

                {/* Planned Occasion */}
                <div className="h-28 p-2 bg-white border-2 border-ai-glow/30 rounded-2xl relative group hover:shadow-md transition-all cursor-pointer">
                  <span className="text-sm font-bold text-on-surface/40">04</span>
                  <div className="mt-1 bg-ai-glow/10 border border-ai-glow/20 p-1.5 rounded-lg text-primary text-[10px] leading-tight">
                    <p className="font-bold truncate">{t('calendar.event2')}</p>
                    <div className="flex items-center gap-1 mt-1 text-ai-glow font-bold">
                      <Sparkles className="w-3 h-3" />
                      <span>{t('calendar.planned')}</span>
                    </div>
                  </div>
                </div>

                <div className="h-28 p-2 bg-white border border-outline-variant/20 rounded-2xl group hover:border-primary/30 transition-all cursor-pointer"><span className="text-sm text-on-surface/40">05</span></div>
                <div className="h-28 p-2 bg-white border border-outline-variant/20 rounded-2xl group hover:border-primary/30 transition-all cursor-pointer"><span className="text-sm text-on-surface/40">06</span></div>
                <div className="h-28 p-2 bg-white border border-outline-variant/20 rounded-2xl group hover:border-primary/30 transition-all cursor-pointer"><span className="text-sm text-on-surface/40">07</span></div>
                <div className="h-28 p-2 bg-white border border-outline-variant/20 rounded-2xl group hover:border-primary/30 transition-all cursor-pointer"><span className="text-sm text-on-surface/40">08</span></div>

                {/* Ready */}
                <div className="h-28 p-2 bg-secondary-fixed/10 border border-secondary/20 rounded-2xl relative group hover:shadow-md transition-all cursor-pointer">
                  <span className="text-sm font-bold text-on-surface/40">09</span>
                  <div className="mt-1 bg-secondary-container p-1.5 rounded-lg text-secondary border border-secondary/10 text-[10px] leading-tight">
                    <p className="font-bold truncate">{t('calendar.event3')}</p>
                    <div className="flex items-center gap-1 mt-1">
                       <CheckCircle2 className="w-3 h-3 text-secondary fill-current opacity-20" />
                       <span className="font-bold text-secondary">{t('calendar.ready')}</span>
                    </div>
                  </div>
                </div>

                {/* Fill rest */}
                {days.slice(9).map((d) => (
                    <div key={d} className="h-28 p-2 bg-white border border-outline-variant/20 rounded-2xl group hover:border-primary/30 transition-all cursor-pointer">
                        <span className="text-sm text-on-surface/40">{d.toString().padStart(2, '0')}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-surface-container rounded-[32px] p-6 md:p-8 border border-outline-variant/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif font-bold text-primary">{t('calendar.saved')}</h3>
                <Bookmark className="w-6 h-6 text-primary" />
              </div>
              
              <div className="space-y-4">
                {saved.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/10 hover:-translate-y-1 transition-transform cursor-pointer group">
                    <div className="flex gap-4">
                      <img src={item.gift_set.image_url} className="w-20 h-20 object-cover rounded-xl shrink-0" alt={item.gift_set.title} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-secondary uppercase">{item.recipient.name}</span>
                          <span className="text-xs text-on-surface-variant">
                            {new Date(item.occasion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-primary mt-1">{item.gift_set.title}</h4>
                        <p className="text-xs text-on-surface-variant">AI {t('home.match')}: {item.match_percent}%</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold">${item.gift_set.price}</span>
                          <button className="text-ai-glow hover:underline text-xs font-bold flex items-center gap-1 group-hover:text-primary transition-colors">
                            {t('calendar.finalize')} <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-2 border-dashed border-outline-variant/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-surface-container-low/50">
                  <div className="w-10 h-10 rounded-full bg-ai-glow/10 flex items-center justify-center text-ai-glow">
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-primary">{t('calendar.needIdeas')}</p>
                     <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{t('calendar.scan')}</p>
                  </div>
                  <button className="text-xs font-bold bg-white text-primary px-4 py-2 rounded-full border border-outline-variant/30 hover:bg-surface-container transition-all shadow-sm">
                    {t('calendar.ask')}
                  </button>
                </div>
              </div>
            </div>

            {/* Pulse Insights */}
            <div className="glass-effect rounded-[32px] p-6 md:p-8 border border-white/40 shadow-xl relative overflow-hidden bg-white/40">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-ai-glow/20 blur-[60px] rounded-full point-events-none"></div>
              <h3 className="text-2xl font-serif font-bold text-primary mb-4 relative z-10">{t('calendar.insights')}</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">{t('calendar.readiness')}</span>
                  <span className="font-bold text-primary">{insight?.readiness_percent ?? 72}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${insight?.readiness_percent ?? 72}%` }}></div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed italic bg-white/50 p-4 rounded-xl border border-white">
                  {insight?.quote || t('calendar.insightQuote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
