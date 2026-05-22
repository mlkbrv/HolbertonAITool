import { useEffect, useState } from 'react';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { api, Dashboard, Occasion, Recipient, unwrapList } from '../api/client';
import { Briefcase, Users, TrendingUp, Lock, ArrowRight, Sparkles } from 'lucide-react';

const DEMO_RECIPIENTS: Recipient[] = [
  { id: 1, name: 'Sarah', relationship: 'friend', avatar_url: '' },
  { id: 2, name: 'Michael', relationship: 'friend', avatar_url: '' },
  { id: 3, name: 'Mom', relationship: 'mom', avatar_url: '' },
];

const DEMO_OFFERS = [
  { id: 1, title: 'Q4 Enterprise Gifting', description: 'Volume pricing for teams of 50+ with white-glove delivery.', is_new: true },
];

export function CrmView() {
  const { t } = useLanguage();
  const { navigate, showToast, openPanel } = useNavigation();
  const { plan } = useAuth();
  const hasBusiness = plan?.slug === 'business';
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [offers, setOffers] = useState<Dashboard['corporate_offers']>([]);
  const [insight, setInsight] = useState<Dashboard['calendar_insight']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.recipients().then((d) => setRecipients(unwrapList(d))).catch(() => setRecipients(DEMO_RECIPIENTS)),
      api.occasionsUpcoming().then((d) => setOccasions(unwrapList(d))).catch(() => setOccasions([])),
      api.dashboard().then((d) => {
        setOffers(d.corporate_offers?.length ? d.corporate_offers : DEMO_OFFERS);
        setInsight(d.calendar_insight);
      }).catch(() => {
        setOffers(DEMO_OFFERS);
        setInsight(null);
      }),
    ]).finally(() => setLoading(false));
  }, []);

  const team = recipients.length ? recipients : DEMO_RECIPIENTS;
  const displayOffers = offers.length ? offers : DEMO_OFFERS;

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-6 pb-16 pt-8">
        <header className="mb-10 text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">{t('sidebar.businessCrm')}</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">{t('crm.subtitle')}</p>
        </header>

        {!hasBusiness && (
          <div className="mb-8 p-6 bg-primary-container/10 border border-secondary/30 rounded-3xl flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3 text-left">
              <Lock className="w-6 h-6 text-secondary shrink-0" />
              <div>
                <p className="font-bold text-primary">{t('crm.lockedTitle')}</p>
                <p className="text-sm text-on-surface-variant">{t('crm.lockedDesc')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openPanel('account')}
              className="px-6 py-3 bg-secondary text-on-secondary rounded-xl font-semibold whitespace-nowrap cursor-pointer"
            >
              {t('crm.upgrade')}
            </button>
          </div>
        )}

        {insight && (
          <div className="mb-8 p-6 bg-white border border-outline-variant/20 rounded-3xl shadow-sm">
            <p className="text-xs font-semibold uppercase text-secondary mb-2">{t('crm.readiness')}</p>
            <div className="flex items-end gap-4 mb-3">
              <span className="text-4xl font-serif font-bold text-primary">{insight.readiness_percent}%</span>
              <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden mb-2">
                <div className="h-full bg-secondary rounded-full" style={{ width: `${insight.readiness_percent}%` }} />
              </div>
            </div>
            <p className="text-sm text-on-surface-variant italic">{insight.quote}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <button
            type="button"
            onClick={() => navigate('calendar')}
            className="p-6 bg-white border border-outline-variant/20 rounded-3xl shadow-sm text-left hover:shadow-md transition-all cursor-pointer"
          >
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-xl font-bold text-primary mb-2">{t('crm.teamSync')}</h3>
            <p className="text-sm text-on-surface-variant">{t('crm.teamSyncDesc')}</p>
            <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-secondary">
              {occasions.length} {t('crm.events')} <ArrowRight className="w-4 h-4" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => hasBusiness ? navigate('gift-sets') : openPanel('account')}
            className="p-6 bg-white border border-outline-variant/20 rounded-3xl shadow-sm text-left hover:shadow-md transition-all cursor-pointer"
          >
            <TrendingUp className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-xl font-bold text-primary mb-2">{t('crm.clientRelations')}</h3>
            <p className="text-sm text-on-surface-variant">{t('crm.clientRelationsDesc')}</p>
          </button>
          <button
            type="button"
            onClick={() => navigate('gift-sets')}
            className="p-6 bg-white border border-outline-variant/20 rounded-3xl shadow-sm text-left hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-8 h-8 mb-3 bg-secondary rounded-full flex items-center justify-center text-on-secondary font-bold">%</div>
            <h3 className="text-xl font-bold text-primary mb-2">{t('crm.bulkOrders')}</h3>
            <p className="text-sm text-on-surface-variant">{t('crm.bulkOrdersDesc')}</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-primary mb-4">{t('crm.contacts')}</h2>
            {loading ? (
              <p className="text-sm text-on-surface-variant">...</p>
            ) : (
              <ul className="space-y-3">
                {team.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold shrink-0">
                      {r.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary truncate">{r.name}</p>
                      <p className="text-xs text-on-surface-variant capitalize">{r.relationship}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('detective');
                        showToast(`${r.name}`);
                      }}
                      className="p-2 rounded-xl border border-outline-variant/30 hover:border-secondary cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-secondary" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-primary mb-4">{t('crm.offers')}</h2>
            <ul className="space-y-4">
              {displayOffers.map((o) => (
                <li key={o.id} className="p-4 rounded-2xl border border-outline-variant/20 bg-soft-cream">
                  {o.is_new && (
                    <span className="text-xs font-bold text-ai-glow uppercase tracking-wide">{t('home.newOffer')}</span>
                  )}
                  <h3 className="font-bold text-primary mt-1">{o.title}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">{o.description}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (hasBusiness) {
                        navigate('gift-sets');
                        showToast(o.title);
                      } else {
                        openPanel('account');
                      }
                    }}
                    className="mt-3 text-sm font-semibold text-secondary hover:underline cursor-pointer"
                  >
                    {hasBusiness ? t('crm.viewOffer') : t('crm.upgrade')}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {occasions.length > 0 && (
          <section className="mt-8 bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-primary mb-4">{t('crm.upcoming')}</h2>
            <ul className="space-y-3">
              {occasions.slice(0, 5).map((occ) => (
                <li key={occ.id} className="flex items-center justify-between p-3 rounded-2xl bg-surface-container">
                  <div>
                    <p className="font-semibold text-primary">{occ.title}</p>
                    <p className="text-xs text-on-surface-variant">
                      {occ.month_label} {occ.day_label} · {t('home.inDays').replace('{days}', String(occ.days_until))}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-secondary capitalize">{occ.status.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
