import { useState, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { AppModal } from './components/AppModal';
import { CartPanel } from './components/CartPanel';
import { AccountPanel } from './components/AccountPanel';
import { Toast } from './components/Toast';
import { HomeView } from './views/HomeView';
import { GiftDetectiveView } from './views/GiftDetectiveView';
import { CalendarView } from './views/CalendarView';
import { GiftSetsView } from './views/GiftSetsView';
import { CrmView } from './views/CrmView';
import { NewOccasionView } from './views/NewOccasionView';
import { AppPanel, RecipientFilter, ViewState } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { TestDemoTools } from './components/TestDemoTools';

function AppContent() {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [panel, setPanel] = useState<AppPanel | null>(null);
  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const navigate = useCallback((view: ViewState) => {
    setCurrentView(view);
    setMobileNavOpen(false);
    setPanel(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const browseRecipient = useCallback((filter: RecipientFilter) => {
    setRecipientFilter(filter);
    setCurrentView('gift-sets');
    setMobileNavOpen(false);
    setPanel(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openPanel = useCallback((p: AppPanel) => {
    setPanel(p);
    setMobileNavOpen(false);
  }, []);

  const navValue = { currentView, navigate, browseRecipient, openPanel, showToast };

  return (
    <NavigationProvider value={navValue}>
      <div className="min-h-screen bg-soft-cream font-sans text-on-surface selection:bg-tertiary-fixed isolate">
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
        <main className="relative z-10 md:ml-64 pt-24 min-h-screen w-full md:max-w-[calc(100%-16rem)] pointer-events-auto">
          {currentView === 'home' && <HomeView />}
          {currentView === 'detective' && <GiftDetectiveView />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'gift-sets' && <GiftSetsView recipientFilter={recipientFilter} />}
          {currentView === 'crm' && <CrmView />}
          {currentView === 'new-occasion' && <NewOccasionView />}
        </main>

        {panel === 'account' && (
          <AppModal title={t('panel.account')} onClose={() => setPanel(null)}>
            <AccountPanel onClose={() => setPanel(null)} />
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
            <CartPanel onClose={() => setPanel(null)} />
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
            <button type="button" onClick={() => navigate('detective')} className="w-full py-3 border border-secondary text-secondary rounded-xl font-semibold cursor-pointer">
              {t('sidebar.detective')}
            </button>
          </AppModal>
        )}

        <TestDemoTools onNavigate={navigate} onOpenPanel={openPanel} />

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
