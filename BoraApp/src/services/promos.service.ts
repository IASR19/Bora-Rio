import { apiFetch } from '@/shared/api/client';

export type PromoKind = 'gift' | 'fixed_price' | 'percent_off';

export interface PromoPublic {
  code: string;
  kind: PromoKind;
  title: string;
  description: string | null;
  priceCents: number | null;
  percentOff: number | null;
  validFrom: string;
  validUntil: string;
  event: { id: string; title: string; startsAt: string; endsAt: string };
  venue: { id: string; name: string };
  availableNow: boolean;
  soldOut: boolean;
}

export type PromoClaim =
  | { kind: Exclude<PromoKind, 'gift'>; status: 'info' }
  | {
      kind: 'gift';
      status: 'active' | 'expired' | 'delivered';
      title: string;
      publicCode: string;
      claimedAt: string;
      expiresAt: string | null;
      deliveredAt: string | null;
    };

export const promosService = {
  // Rota pública: manda o token se existir (auth: true só anexa o header, não exige login).
  get: (code: string) => apiFetch<PromoPublic>(`/promos/${encodeURIComponent(code)}`),
  recordScan: (code: string, deviceId: string) =>
    apiFetch<{ recorded: boolean }>(`/promos/${encodeURIComponent(code)}/scans`, { method: 'POST', body: { deviceId } }),
  claim: (code: string) => apiFetch<PromoClaim>(`/promos/${encodeURIComponent(code)}/claim`, { method: 'POST' }),
  signup: (code: string) =>
    apiFetch<{ attributed: boolean }>(`/promos/${encodeURIComponent(code)}/signup`, { method: 'POST' }),
};
