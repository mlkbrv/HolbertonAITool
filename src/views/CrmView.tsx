import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Briefcase, Users, TrendingUp } from 'lucide-react';

export function CrmView() {
  const { t } = useLanguage();
  const { navigate, showToast } = useNavigation();

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-6 pb-16 pt-8">
        <header className="mb-10 text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <Briefcase className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">{t('sidebar.businessCrm')}</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Manage your corporate gifting, team milestones, and client relations effortlessly.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <button type="button" onClick={() => navigate('calendar')} className="p-6 bg-white border border-outline-variant/20 rounded-3xl shadow-sm text-center hover:shadow-md transition-all cursor-pointer">
            <Users className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold text-primary mb-2">Team Sync</h3>
            <p className="text-sm text-on-surface-variant">Import your team's birthdays and work anniversaries.</p>
          </button>
          <button type="button" onClick={() => showToast('Client Relations')} className="p-6 bg-white border border-outline-variant/20 rounded-3xl shadow-sm text-center hover:shadow-md transition-all cursor-pointer">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold text-primary mb-2">Client Relations</h3>
            <p className="text-sm text-on-surface-variant">Track VIP gifts and automated follow-ups.</p>
          </button>
          <button type="button" onClick={() => navigate('gift-sets')} className="p-6 bg-white border border-outline-variant/20 rounded-3xl shadow-sm text-center hover:shadow-md transition-all cursor-pointer">
            <div className="w-8 h-8 mx-auto mb-3 bg-secondary rounded-full flex items-center justify-center text-on-secondary font-bold">%</div>
            <h3 className="text-xl font-bold text-primary mb-2">Bulk Orders</h3>
            <p className="text-sm text-on-surface-variant">Get access to corporate discounts and bulk shipping.</p>
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
