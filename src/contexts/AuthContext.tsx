import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, AuthUser, MeResponse, prefetchCsrf, SubscriptionPlan } from '../api/client';

interface AuthContextType {
  user: AuthUser | null;
  plan: SubscriptionPlan | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setMe: (data: MeResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const setMe = useCallback((data: MeResponse) => {
    setUser(data.user);
    setPlan(data.plan);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      await prefetchCsrf();
    } catch {
      /* retry on first POST */
    }
    try {
      const data = await api.me();
      setMe(data);
    } catch {
      setMe({ user: null, plan: null });
    }
  }, [setMe]);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setMe(data);
    await prefetchCsrf();
  };

  const register = async (email: string, password: string, name?: string) => {
    const data = await api.register(email, password, name);
    setMe(data);
    await prefetchCsrf();
  };

  const logout = async () => {
    await api.logout();
    await prefetchCsrf();
    const data = await api.me();
    setMe(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        plan,
        isLoggedIn: !!user,
        loading,
        login,
        register,
        logout,
        refreshMe,
        setMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
