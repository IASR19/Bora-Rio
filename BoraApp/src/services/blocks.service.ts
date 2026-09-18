import { apiFetch } from '@/shared/api/client';

export const blocksService = {
  mine: () => apiFetch<string[]>('/blocks'),
  block: (userId: string) => apiFetch(`/blocks/${userId}`, { method: 'POST' }),
  unblock: (userId: string) => apiFetch(`/blocks/${userId}`, { method: 'DELETE' }),
};
