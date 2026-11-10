import { apiFetch } from "@/shared/api/client";
import type { BoraEvent, Venue } from "@/types/domain";

export type BusinessStatus = "pending" | "approved" | "rejected" | null;

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
    promoScans: number;
    promoSignups: number;
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

export interface PromoStats {
  rewardId: string;
  scans: number;
  newSignups: number;
  existingUsers: number;
  redeemed: number;
  delivered: number;
}

export interface PromoRedemption {
  publicCode: string | null;
  firstName: string;
  claimedAt: string;
  expiresAt: string | null;
  expired: boolean;
  deliveredAt: string | null;
}

export interface PromoDelivery {
  publicCode: string;
  firstName: string;
  deliveredAt: string;
}

export const businessService = {
  me: () => apiFetch<BusinessMe>("/business/me"),
  dashboard: (days: number) =>
    apiFetch<BusinessDashboard>(`/business/dashboard?days=${days}`),
  events: () => apiFetch<BoraEvent[]>("/business/events"),
  rewardQr: (rewardId: string) =>
    apiFetch<{ code: string; path: string }>(
      `/business/rewards/${rewardId}/qr`,
    ),
  promoStats: (eventId: string) =>
    apiFetch<PromoStats[]>(`/business/events/${eventId}/promotions/stats`),
  redemptions: (rewardId: string) =>
    apiFetch<PromoRedemption[]>(`/business/rewards/${rewardId}/redemptions`),
  deliver: (rewardId: string, publicCode: string) =>
    apiFetch<PromoDelivery>(`/business/rewards/${rewardId}/deliver`, {
      method: "POST",
      body: { publicCode },
    }),
};
