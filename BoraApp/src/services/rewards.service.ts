import { apiFetch } from '@/shared/api/client';
import type { Reward } from '@/types/domain';

export interface RewardPayload {
  kind: Reward['kind'];
  title: string;
  description?: string | null;
  priceCents?: number | null;
  percentOff?: number | null;
  validFrom: string;
  validUntil: string;
  quantityTotal?: number | null;
}

export const rewardsService = {
  getByEvent: (eventId: string) => apiFetch<Reward[]>(`/rewards/event/${eventId}`),
  myRedemptions: (eventId: string) => apiFetch<string[]>(`/rewards/event/${eventId}/redemptions/mine`),
  redeem: (rewardId: string) => apiFetch(`/rewards/${rewardId}/redeem`, { method: 'POST' }),
  create: (eventId: string, payload: RewardPayload) =>
    apiFetch<Reward>(`/rewards/event/${eventId}`, { method: 'POST', body: payload }),
  update: (rewardId: string, payload: Partial<RewardPayload>) =>
    apiFetch<Reward>(`/rewards/${rewardId}`, { method: 'PATCH', body: payload }),
  remove: (rewardId: string) => apiFetch(`/rewards/${rewardId}`, { method: 'DELETE' }),
};
