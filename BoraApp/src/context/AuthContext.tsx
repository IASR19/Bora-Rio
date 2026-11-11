import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { adminService } from '@/services/admin.service';
import { authService, type RegisterBusinessPayload, type RegisterPayload } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { setAccessToken } from '@/shared/api/client';
import { promosService } from '@/services/promos.service';
import { takePromoOrigin } from '@/utils/promoOrigin';
import { readLocalStorage, writeLocalStorage } from '@/utils/storage';
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
  /** Admin: entra na conta de outra pessoa (acesso de suporte). */
  impersonate: (userId: string) => Promise<User>;
  /** Sai do acesso de suporte e volta para a conta do admin. */
  stopImpersonation: () => Promise<User>;
  refreshUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Marca, neste navegador, que há uma sessão de admin guardada por trás de um acesso de suporte. */
const SUPPORT_ACCESS_KEY = 'bora_support_access';
const hasSupportAccess = () => readLocalStorage(SUPPORT_ACCESS_KEY) === '1';
const markSupportAccess = (active: boolean) => writeLocalStorage(SUPPORT_ACCESS_KEY, active ? '1' : '');

/** Atribui o cadastro ao QR de promoção lido antes de criar a conta. Nunca bloqueia o fluxo. */
function attributeSignup() {
  const code = takePromoOrigin();
  if (code) void promosService.signup(code).catch(() => undefined);
}

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
      .catch(async () => {
        setAccessToken(null);
        // O acesso de suporte venceu, mas a sessão do admin continua guardada no navegador:
        // volta para ela em vez de mostrar a tela de login com um admin ainda logado por trás.
        if (!hasSupportAccess()) return;
        markSupportAccess(false);
        const restored = await authService.stopImpersonation().catch(() => null);
        if (!restored) return;
        setAccessToken(restored.accessToken);
        setUser(restored.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedUser, accessToken } = await authService.login(email, password);
    markSupportAccess(false);
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
    attributeSignup();
    return loggedUser;
  };

  const register = async (payload: RegisterPayload) => {
    const { user: newUser, accessToken } = await authService.register({ ...payload, language: getLanguage() });
    setAccessToken(accessToken);
    queryClient.clear();
    setUser(newUser);
    attributeSignup();
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
    markSupportAccess(false);
    setAccessToken(null);
    queryClient.clear();
    setUser(null);
  };

  const impersonate = async (userId: string) => {
    const { user: target, accessToken } = await adminService.impersonate(userId);
    markSupportAccess(true);
    setAccessToken(accessToken);
    queryClient.clear();
    setUser(target);
    return target;
  };

  const stopImpersonation = async () => {
    markSupportAccess(false);
    try {
      const { user: admin, accessToken } = await authService.stopImpersonation();
      setAccessToken(accessToken);
      queryClient.clear();
      setUser(admin);
      return admin;
    } catch (err) {
      // A sessão do admin não existe mais: não sobra sessão nenhuma, o app pede login.
      setAccessToken(null);
      queryClient.clear();
      setUser(null);
      throw err;
    }
  };

  const refreshUser = async () => {
    const current = await usersService.me();
    setUser(current);
    return current;
  };

  // As ações só usam setters de estado e o queryClient, que são estáveis entre renders:
  // recriar o value só quando user/loading mudam evita re-renderizar todo o app à toa.
  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      loginWithGoogle,
      register,
      registerBusiness,
      logout,
      impersonate,
      stopImpersonation,
      refreshUser,
    }),
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
