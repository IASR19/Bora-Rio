import { apiFetch } from '@/shared/api/client';
import type { Venue } from '@/types/domain';

export interface VenueQuery {
  category?: string;
  music?: string;
  priceRange?: string;
  lat?: number;
  lng?: number;
  maxDistanceKm?: number;
  city?: string;
  q?: string;
}

function toQueryString(query: VenueQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export interface CreateVenuePayload {
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  description?: string;
  priceRange?: string;
}

export const venuesService = {
  search: (query: VenueQuery = {}) => apiFetch<Venue[]>(`/venues${toQueryString(query)}`),
  getById: (id: string) => apiFetch<Venue>(`/venues/${id}`),
  create: (payload: CreateVenuePayload) => apiFetch<Venue>('/venues', { method: 'POST', body: payload }),
  verifyWithCnpj: (venueId: string, cnpj: string) =>
    apiFetch<Venue>(`/venues/${venueId}/cnpj`, { method: 'POST', body: { cnpj } }),
};
