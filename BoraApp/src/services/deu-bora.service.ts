import { apiFetch } from '@/shared/api/client';
import type { DeuBoraMatch, DeuBoraResult } from '@/types/domain';

export const deuBoraService = {
  submitInterest: (eventId: string, toUserId: string) =>
    apiFetch<DeuBoraResult>(`/deu-bora/${eventId}/interest`, { method: 'POST', body: { toUserId } }),
  myInterests: (eventId: string) => apiFetch<string[]>(`/deu-bora/${eventId}/mine`),
  myMatches: () => apiFetch<DeuBoraMatch[]>('/deu-bora/matches'),
};
