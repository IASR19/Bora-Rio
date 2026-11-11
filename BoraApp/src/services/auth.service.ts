import { apiFetch } from '@/shared/api/client';
import type { User } from '@/types/domain';

export interface RegisterPayload {
  language?: 'pt' | 'es' | 'en';
  name: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  password: string;
  cpf: string;
}

export interface RegisterBusinessPayload {
  language?: 'pt' | 'es' | 'en';
  name: string;
  /** Cadastro pelo Google: vai no lugar de e-mail e senha. */
  googleIdToken?: string;
  email?: string;
  password?: string;
  phone: string;
  cnpj: string;
  contractFile: string;
  venue: {
    name: string;
    category: string;
    address: string;
    latitude: number;
    longitude: number;
    city?: string;
    description?: string;
    priceRange?: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: payload, auth: false }),

  registerBusiness: (payload: RegisterBusinessPayload) =>
    apiFetch<AuthResponse>('/auth/register/business', { method: 'POST', body: payload, auth: false }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  /** `createAccount: false` não cria conta nova: a API responde GOOGLE_ACCOUNT_NOT_FOUND. */
  loginWithGoogle: (idToken: string, language: User['language'], createAccount?: boolean) =>
    apiFetch<AuthResponse>('/auth/google', {
      method: 'POST',
      body: { idToken, language, createAccount },
      auth: false,
    }),

  logout: () => apiFetch('/auth/logout', { method: 'POST', auth: false }),

  /** Encerra o acesso de suporte: a sessão volta a ser a do admin que o abriu. */
  stopImpersonation: () =>
    apiFetch<AuthResponse>('/auth/impersonation/stop', { method: 'POST', auth: false }),

  /** Troca o cookie httpOnly de refresh (até 10 dias) por um accessToken novo —
   * usado pra restaurar a sessão ao abrir o app sem pedir login de novo. */
  refresh: () => apiFetch<{ accessToken: string }>('/auth/refresh', { method: 'POST', auth: false }),

  /** Envia o código de 6 dígitos para o e-mail da conta logada. `sent: false` com
   * `retryInSeconds > 0` não é erro: já foi enviado um código há pouco. */
  requestEmailVerification: () =>
    apiFetch<{ sent: boolean; retryInSeconds: number; devCode?: string }>('/auth/verification/email/request', {
      method: 'POST',
    }),

  confirmEmailVerification: (code: string) =>
    apiFetch<{ verified: boolean }>('/auth/verification/email/confirm', {
      method: 'POST',
      body: { code },
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<{ success: boolean }>('/auth/password', { method: 'PATCH', body: { currentPassword, newPassword } }),
};
