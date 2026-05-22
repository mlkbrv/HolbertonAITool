import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { Briefcase, Users, TrendingUp } from 'lucide-react';

export function CrmView() {
  const { t } = useLanguage();

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
          <div className="p-6 bg-white border border-outline-variant/20 rounded-3xl shadow-sm text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold text-primary mb-2">Team Sync</h3>
            <p className="text-sm text-on-surface-variant">Import your team's birthdays and work anniversaries.</p>
          </div>
          <div className="p-6 bg-white border border-outline-variant/20 rounded-3xl shadow-sm text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold text-primary mb-2">Client Relations</h3>
            <p className="text-sm text-on-surface-variant">Track VIP gifts and automated follow-ups.</p>
          </div>
          <div className="p-6 bg-white border border-outline-variant/20 rounded-3xl shadow-sm text-center">
             <div className="w-8 h-8 mx-auto mb-3 bg-secondary rounded-full flex items-center justify-center text-on-secondary font-bold">%</div>
            <h3 className="text-xl font-bold text-primary mb-2">Bulk Orders</h3>
            <p className="text-sm text-on-surface-variant">Get access to corporate discounts and bulk shipping.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
