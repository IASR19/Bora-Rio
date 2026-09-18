import { apiFetch } from '@/shared/api/client';
import type { User } from '@/types/domain';

export interface RegisterPayload {
  name: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: payload, auth: false }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  loginWithGoogle: (idToken: string) =>
    apiFetch<AuthResponse>('/auth/google', { method: 'POST', body: { idToken }, auth: false }),

  logout: () => apiFetch('/auth/logout', { method: 'POST', auth: false }),

  requestVerification: (phone: string) =>
    apiFetch<{ sent: boolean; devCode?: string }>('/auth/verification/request', {
      method: 'POST',
      body: { phone },
      auth: false,
    }),

  confirmVerification: (phone: string, code: string) =>
    apiFetch<{ verified: boolean }>('/auth/verification/confirm', {
      method: 'POST',
      body: { phone, code },
      auth: false,
    }),
};
