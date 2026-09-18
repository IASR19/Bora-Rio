import { apiFetch } from '@/shared/api/client';

export const checkinsService = {
  getQr: (eventId: string) => apiFetch<{ qrToken: string; expiresInSeconds: number }>(`/checkins/qr/${eventId}`),
  confirm: (eventId: string, qrToken: string, deviceId: string) =>
    apiFetch('/checkins', { method: 'POST', body: { eventId, qrToken, deviceId } }),
  myCount: () => apiFetch<number>('/checkins/mine/count'),
};
