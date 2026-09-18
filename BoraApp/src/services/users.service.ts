import { apiFetch } from '@/shared/api/client';
import type { User } from '@/types/domain';

export const usersService = {
  me: () => apiFetch<User>('/users/me'),
  updateMe: (data: Partial<Pick<User, 'name' | 'avatarUrl' | 'city' | 'showInWhoIsGoing'>>) =>
    apiFetch<User>('/users/me', { method: 'PATCH', body: data }),
};
