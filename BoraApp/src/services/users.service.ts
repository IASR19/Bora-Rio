import { apiFetch } from '@/shared/api/client';
import type { User } from '@/types/domain';

export const usersService = {
  me: () => apiFetch<User>('/users/me'),
  updateMe: (
    data: Partial<
      Pick<
        User,
        'name' | 'avatarUrl' | 'city' | 'latitude' | 'longitude' | 'phone' | 'birthDate' | 'showInWhoIsGoing'
      >
    >,
  ) => apiFetch<User>('/users/me', { method: 'PATCH', body: data }),
  deleteMe: () => apiFetch<{ success: boolean }>('/users/me', { method: 'DELETE' }),
  submitIdentity: (cpf: string, selfieUrl: string) =>
    apiFetch<User>('/users/me/identity', { method: 'PATCH', body: { cpf, selfieUrl } }),
  /** Contrato social como data URL base64 (PDF ou imagem, até 3 MB). */
  submitBusinessVerification: (cnpj: string, contractFile: string) =>
    apiFetch<User>('/users/me/business-verification', { method: 'POST', body: { cnpj, contractFile } }),
};
