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
};
