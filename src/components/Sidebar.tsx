import { Home, Sparkles, Calendar, Briefcase, Layers, Plus, HelpCircle, Settings } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'home' as ViewState, icon: Home, label: t('sidebar.home') },
    { id: 'detective' as ViewState, icon: Sparkles, label: t('sidebar.detective') },
    { id: 'calendar' as ViewState, icon: Calendar, label: t('sidebar.calendar') },
    { id: 'gift-sets' as ViewState, icon: Layers, label: t('sidebar.collections') },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 pt-24 pb-8 bg-surface border-r border-outline-variant/20 flex-col gap-4 z-40 hidden md:flex">
      <div className="px-8 mb-6 flex items-center gap-3">
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
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map(item => {
          const isActive = currentView === item.id || (currentView === 'gift-sets' && item.id === 'gift-sets');
          return (
            <button
              key={item.id}
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
          onClick={() => onNavigate('crm')}
          className={`flex items-center gap-3 py-3 px-4 mx-4 rounded-xl font-semibold transition-all ${
            currentView === 'crm' 
              ? 'bg-secondary/20 text-on-surface shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}>
            <Briefcase className="w-5 h-5" />
            <span className="text-sm">{t('sidebar.businessCrm')}</span>
        </button>
      </div>
      
      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-outline-variant/10">
        <button 
          onClick={() => onNavigate('new-occasion')}
          className="mx-4 mb-4 py-3 bg-accent text-on-accent rounded-xl text-sm font-semibold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          {t('sidebar.newOccasion')}
        </button>
        <button className="flex items-center gap-3 py-2 px-4 text-on-surface-variant hover:bg-surface-container-low mx-4 rounded-xl text-sm transition-all">
          <HelpCircle className="w-5 h-5" />
          {t('sidebar.helpCenter')}
        </button>
        <button className="flex items-center gap-3 py-2 px-4 text-on-surface-variant hover:bg-surface-container-low mx-4 rounded-xl text-sm transition-all">
          <Settings className="w-5 h-5" />
          {t('sidebar.settings')}
        </button>
      </div>
    </nav>
  );
}
