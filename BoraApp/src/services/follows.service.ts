import { apiFetch } from '@/shared/api/client';

export const followsService = {
  mine: () => apiFetch<string[]>('/follows'),
  follow: (userId: string) => apiFetch(`/follows/${userId}`, { method: 'POST' }),
  unfollow: (userId: string) => apiFetch(`/follows/${userId}`, { method: 'DELETE' }),
};
