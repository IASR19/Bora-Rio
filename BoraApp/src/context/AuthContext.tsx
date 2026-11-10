import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { authService, type RegisterBusinessPayload, type RegisterPayload } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { setAccessToken } from '@/shared/api/client';
import type { User } from '@/types/domain';
import { getLanguage, setLanguage } from '@/i18n';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (idToken: string, options?: { createAccount?: boolean }) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  registerBusiness: (payload: RegisterBusinessPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.language) setLanguage(user.language);
  }, [user?.id, user?.language]);

  useEffect(() => {
    // Restaura a sessão a partir do cookie httpOnly de refresh (até 10 dias) —
    // sem isso, todo reload de página derrubava o login porque o accessToken
    // só vive em memória.
    authService
      .refresh()
      .then(({ accessToken }) => {
        setAccessToken(accessToken);
        return usersService.me();
      })
      .then(setUser)
      .catch(() => setAccessToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedUser, accessToken } = await authService.login(email, password);
    setAccessToken(accessToken);
    queryClient.clear();
    setUser(loggedUser);
    return loggedUser;
  };

  const loginWithGoogle = async (idToken: string, options?: { createAccount?: boolean }) => {
    const { user: loggedUser, accessToken } = await authService.loginWithGoogle(
      idToken,
      getLanguage(),
      options?.createAccount,
    );
    setAccessToken(accessToken);
    queryClient.clear();
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (payload: RegisterPayload) => {
    const { user: newUser, accessToken } = await authService.register({ ...payload, language: getLanguage() });
    setAccessToken(accessToken);
    queryClient.clear();
    setUser(newUser);
    return newUser;
  };

  const registerBusiness = async (payload: RegisterBusinessPayload) => {
    const { user: newUser, accessToken } = await authService.registerBusiness({ ...payload, language: getLanguage() });
    setAccessToken(accessToken);
    queryClient.clear();
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await authService.logout().catch(() => undefined);
    setAccessToken(null);
    queryClient.clear();
    setUser(null);
  };

  const refreshUser = async () => {
    const current = await usersService.me();
    setUser(current);
    return current;
  };

  // As ações só usam setters de estado e o queryClient, que são estáveis entre renders:
  // recriar o value só quando user/loading mudam evita re-renderizar todo o app à toa.
  const value = useMemo(
    () => ({ user, loading, login, loginWithGoogle, register, registerBusiness, logout, refreshUser }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
