import { createContext, useContext, ReactNode } from 'react';
import { AppPanel, RecipientFilter, ViewState } from '../types';

interface NavigationContextType {
  currentView: ViewState;
  navigate: (view: ViewState) => void;
  browseRecipient: (filter: RecipientFilter) => void;
  openPanel: (panel: AppPanel) => void;
  showToast: (message: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: NavigationContextType;
}) {
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
