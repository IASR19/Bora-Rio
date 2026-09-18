import { apiFetch } from '@/shared/api/client';
import type { BoraEvent, EventParticipants } from '@/types/domain';

export const eventsService = {
  search: (params: { now?: boolean; city?: string; venueId?: string; category?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.now) qs.set('now', 'true');
    if (params.city) qs.set('city', params.city);
    if (params.venueId) qs.set('venueId', params.venueId);
    if (params.category) qs.set('category', params.category);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<BoraEvent[]>(`/events${suffix}`);
  },
  getById: (id: string) => apiFetch<BoraEvent>(`/events/${id}`),
  getParticipants: (id: string) => apiFetch<EventParticipants>(`/events/${id}/participants`),
  markViewed: (id: string) => apiFetch(`/events/${id}/view`, { method: 'POST' }),
  markInterested: (id: string) => apiFetch(`/events/${id}/interested`, { method: 'POST' }),
  markConfirmed: (id: string) => apiFetch(`/events/${id}/confirmed`, { method: 'POST' }),
  mine: () =>
    apiFetch<{ interested: BoraEvent[]; confirmed: BoraEvent[]; past: BoraEvent[] }>('/events/mine'),
};
