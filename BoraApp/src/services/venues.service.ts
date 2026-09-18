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
}

function toQueryString(query: VenueQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const venuesService = {
  search: (query: VenueQuery = {}) => apiFetch<Venue[]>(`/venues${toQueryString(query)}`),
  getById: (id: string) => apiFetch<Venue>(`/venues/${id}`),
};
