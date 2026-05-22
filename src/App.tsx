import { useState } from 'react';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { AppModal } from './components/AppModal';
import { HomeView } from './views/HomeView';
import { GiftDetectiveView } from './views/GiftDetectiveView';
import { CalendarView } from './views/CalendarView';
import { GiftSetsView } from './views/GiftSetsView';
import { CrmView } from './views/CrmView';
import { NewOccasionView } from './views/NewOccasionView';
import { AppPanel, RecipientFilter, ViewState } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [panel, setPanel] = useState<AppPanel | null>(null);
  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigate = (view: ViewState) => {
    setCurrentView(view);
    setMobileNavOpen(false);
    setPanel(null);
  };

  const browseRecipient = (filter: RecipientFilter) => {
    setRecipientFilter(filter);
    navigate('gift-sets');
  };

  const openPanel = (p: AppPanel) => {
    setPanel(p);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-soft-cream font-sans text-on-surface selection:bg-tertiary-fixed">
      <TopNav
        currentView={currentView}
        onNavigate={navigate}
        onBrowseRecipient={browseRecipient}
        onOpenPanel={openPanel}
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen((v) => !v)}
      />
      <Sidebar
        currentView={currentView}
        onNavigate={navigate}
        onOpenPanel={openPanel}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <main className="md:ml-64 pt-24 min-h-screen relative w-full md:w-[calc(100%-16rem)] z-0">
        {currentView === 'home' && <HomeView onNavigate={navigate} />}
        {currentView === 'detective' && <GiftDetectiveView />}
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'gift-sets' && <GiftSetsView recipientFilter={recipientFilter} />}
        {currentView === 'crm' && <CrmView />}
        {currentView === 'new-occasion' && <NewOccasionView />}
      </main>

      {panel === 'account' && (
        <AppModal title={t('panel.account')} onClose={() => setPanel(null)}>
          <p className="text-sm text-on-surface-variant mb-4">{t('panel.accountDesc')}</p>
          <div className="flex items-center gap-3 p-4 bg-surface-container rounded-2xl mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center font-bold text-primary">G</div>
            <div>
              <p className="font-semibold text-primary">Guest User</p>
              <p className="text-xs text-on-surface-variant">guest@giftly.app</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('crm')}
            className="w-full py-3 bg-secondary text-on-secondary rounded-xl font-semibold"
          >
            {t('home.openDashboard')}
          </button>
        </AppModal>
      )}

      {panel === 'notifications' && (
        <AppModal title={t('panel.notifications')} onClose={() => setPanel(null)}>
          <ul className="space-y-3 text-sm">
            <li className="p-3 bg-surface-container rounded-xl">{t('panel.notif1')}</li>
            <li className="p-3 bg-surface-container rounded-xl">{t('panel.notif2')}</li>
          </ul>
        </AppModal>
      )}

      {panel === 'cart' && (
        <AppModal title={t('panel.cart')} onClose={() => setPanel(null)}>
          <p className="text-sm text-on-surface-variant">{t('panel.cartEmpty')}</p>
          <button
            type="button"
            onClick={() => navigate('gift-sets')}
            className="mt-4 w-full py-3 bg-accent text-on-accent rounded-xl font-semibold"
          >
            {t('nav.giftSets')}
          </button>
        </AppModal>
      )}

      {panel === 'settings' && (
        <AppModal title={t('sidebar.settings')} onClose={() => setPanel(null)}>
          <p className="text-sm text-on-surface-variant">{t('panel.settingsDesc')}</p>
        </AppModal>
      )}

      {panel === 'help' && (
        <AppModal title={t('sidebar.helpCenter')} onClose={() => setPanel(null)}>
          <p className="text-sm text-on-surface-variant mb-4">{t('panel.helpDesc')}</p>
          <button
            type="button"
            onClick={() => navigate('detective')}
            className="w-full py-3 border border-secondary text-secondary rounded-xl font-semibold"
          >
            {t('sidebar.detective')}
          </button>
        </AppModal>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
