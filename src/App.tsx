import { useState } from 'react';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { GiftDetectiveView } from './views/GiftDetectiveView';
import { CalendarView } from './views/CalendarView';
import { GiftSetsView } from './views/GiftSetsView';
import { CrmView } from './views/CrmView';
import { NewOccasionView } from './views/NewOccasionView';
import { ViewState } from './types';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-soft-cream font-sans text-on-surface selection:bg-tertiary-fixed">
        <TopNav currentView={currentView} onNavigate={setCurrentView} />
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />
        <main className="md:ml-64 pt-24 min-h-screen relative w-full lg:w-[calc(100%-16rem)]">
          {currentView === 'home' && <HomeView onNavigate={setCurrentView} />}
          {currentView === 'detective' && <GiftDetectiveView />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'gift-sets' && <GiftSetsView />}
          {currentView === 'crm' && <CrmView />}
          {currentView === 'new-occasion' && <NewOccasionView />}
        </main>
      </div>
    </LanguageProvider>
  );
}
