import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { authService, type RegisterPayload } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { setAccessToken } from '@/shared/api/client';
import type { User } from '@/types/domain';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedUser, accessToken } = await authService.login(email, password);
    setAccessToken(accessToken);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (payload: RegisterPayload) => {
    const { user: newUser, accessToken } = await authService.register(payload);
    setAccessToken(accessToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await authService.logout().catch(() => undefined);
    setAccessToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const current = await usersService.me();
    setUser(current);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
