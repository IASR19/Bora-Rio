import { apiFetch } from '@/shared/api/client';

export const favoritesService = {
  mine: () => apiFetch<string[]>('/favorites'),
  add: (venueId: string) => apiFetch(`/favorites/${venueId}`, { method: 'POST' }),
  remove: (venueId: string) => apiFetch(`/favorites/${venueId}`, { method: 'DELETE' }),
};
