import { apiFetch } from '@/shared/api/client';
import type { BoraEvent, EventParticipants } from '@/types/domain';

import type { CreateVenuePayload } from './venues.service';

export interface CreateEventPayload {
  venueId?: string;
  newVenue?: CreateVenuePayload;
  name: string;
  description?: string;
  musicGenres: string[];
  startsAt: string;
  endsAt?: string;
  targetAge?: number;
  coverImageUrl?: string;
}

export const eventsService = {
  search: (
    params: {
      now?: boolean;
      city?: string;
      venueId?: string;
      category?: string;
      music?: string;
      q?: string;
      lat?: number;
      lng?: number;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.now) qs.set('now', 'true');
    if (params.city) qs.set('city', params.city);
    if (params.venueId) qs.set('venueId', params.venueId);
    if (params.category) qs.set('category', params.category);
    if (params.music) qs.set('music', params.music);
    if (params.q) qs.set('q', params.q);
    if (params.lat != null) qs.set('lat', String(params.lat));
    if (params.lng != null) qs.set('lng', String(params.lng));
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
  createdByMe: () => apiFetch<BoraEvent[]>('/events/created-by-me'),
  create: (payload: CreateEventPayload) => apiFetch<BoraEvent>('/events', { method: 'POST', body: payload }),
};
