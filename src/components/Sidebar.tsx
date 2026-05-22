import { Home, Sparkles, Calendar, Briefcase, Layers, Plus, HelpCircle, Settings, X } from 'lucide-react';
import { ViewState, AppPanel } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenPanel: (panel: AppPanel) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ currentView, onNavigate, onOpenPanel, mobileOpen, onCloseMobile }: SidebarProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'home' as ViewState, icon: Home, label: t('sidebar.home') },
    { id: 'detective' as ViewState, icon: Sparkles, label: t('sidebar.detective') },
    { id: 'calendar' as ViewState, icon: Calendar, label: t('sidebar.calendar') },
    { id: 'gift-sets' as ViewState, icon: Layers, label: t('sidebar.collections') },
  ];

  const content = (
    <>
      <div className="px-8 mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {currentView === 'detective' ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-on-secondary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-primary">Giftly AI</h1>
                <p className="text-xs font-sans text-on-surface-variant opacity-80">{t('sidebar.digitalConcierge')}</p>
              </div>
            </>
          ) : (
            <div>
              <h1 className="text-2xl font-serif text-primary">Giftly AI</h1>
              <p className="text-sm font-sans text-on-surface-variant opacity-60">{t('sidebar.yourDigitalConcierge')}</p>
            </div>
          )}
        </div>
        <button type="button" onClick={onCloseMobile} className="md:hidden p-2 rounded-lg hover:bg-surface-container">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 py-3 px-4 mx-4 rounded-xl font-semibold transition-all ${
                isActive
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onNavigate('crm')}
          className={`flex items-center gap-3 py-3 px-4 mx-4 rounded-xl font-semibold transition-all ${
            currentView === 'crm'
              ? 'bg-secondary/20 text-on-surface shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-sm">{t('sidebar.businessCrm')}</span>
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-outline-variant/10">
        <button
          type="button"
          onClick={() => onNavigate('new-occasion')}
          className="mx-4 mb-4 py-3 bg-accent text-on-accent rounded-xl text-sm font-semibold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('sidebar.newOccasion')}
        </button>
        <button
          type="button"
          onClick={() => onOpenPanel('help')}
          className="flex items-center gap-3 py-2 px-4 text-on-surface-variant hover:bg-surface-container-low mx-4 rounded-xl text-sm transition-all"
        >
          <HelpCircle className="w-5 h-5" />
          {t('sidebar.helpCenter')}
        </button>
        <button
          type="button"
          onClick={() => onOpenPanel('settings')}
          className="flex items-center gap-3 py-2 px-4 text-on-surface-variant hover:bg-surface-container-low mx-4 rounded-xl text-sm transition-all"
        >
          <Settings className="w-5 h-5" />
          {t('sidebar.settings')}
        </button>
      </div>
    </>
  );

  return (
    <>
      <nav className="fixed left-0 top-0 h-full w-64 pt-24 pb-8 bg-surface border-r border-outline-variant/20 flex-col gap-4 z-40 hidden md:flex pointer-events-auto">
        {content}
      </nav>
      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[45] bg-primary/20 md:hidden"
            onClick={onCloseMobile}
            aria-label="Close menu"
          />
          <nav className="fixed left-0 top-0 h-full w-64 pt-20 pb-8 bg-surface border-r border-outline-variant/20 flex flex-col gap-4 z-[46] md:hidden pointer-events-auto shadow-xl">
            {content}
          </nav>
        </>
      )}
    </>
  );
}
