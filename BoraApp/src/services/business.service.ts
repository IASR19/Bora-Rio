import { apiFetch } from '@/shared/api/client';
import type { BoraEvent, Venue } from '@/types/domain';

export type BusinessStatus = 'pending' | 'approved' | 'rejected' | null;

export interface BusinessMe {
  status: BusinessStatus;
  note: string | null;
  venue: Venue | null;
}

export interface BusinessDashboard {
  venue: Venue;
  totals: {
    events: number;
    upcomingEvents: number;
    interested: number;
    confirmed: number;
    checkins: number;
    giftRedemptions: number;
  };
  checkinsByDay: { date: string; count: number }[];
  events: {
    id: string;
    name: string;
    startsAt: string;
    status: string;
    interested: number;
    confirmed: number;
    checkins: number;
    giftRedemptions: number;
  }[];
}

export const businessService = {
  me: () => apiFetch<BusinessMe>('/business/me'),
  dashboard: (days: number) => apiFetch<BusinessDashboard>(`/business/dashboard?days=${days}`),
  events: () => apiFetch<BoraEvent[]>('/business/events'),
};
