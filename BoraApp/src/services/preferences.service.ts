import { apiFetch } from '@/shared/api/client';
import type { UserPreferences } from '@/types/domain';

export const preferencesService = {
  getMine: () => apiFetch<UserPreferences>('/preferences/me'),
  updateMine: (data: Partial<UserPreferences>) =>
    apiFetch<UserPreferences>('/preferences/me', { method: 'PUT', body: data }),
};
