import { apiFetch } from '@/shared/api/client';
import type { Reward } from '@/types/domain';

export const rewardsService = {
  getByEvent: (eventId: string) => apiFetch<Reward[]>(`/rewards/event/${eventId}`),
  redeem: (rewardId: string) => apiFetch(`/rewards/${rewardId}/redeem`, { method: 'POST' }),
};
