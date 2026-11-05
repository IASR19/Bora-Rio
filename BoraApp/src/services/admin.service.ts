import { apiFetch } from '@/shared/api/client';
import type { BoraEvent, User } from '@/types/domain';

export type AdminUser = Pick<
  User,
  | 'id'
  | 'name'
  | 'email'
  | 'city'
  | 'role'
  | 'isActive'
  | 'language'
  | 'phoneVerified'
  | 'showInWhoIsGoing'
  | 'subscriptionStatus'
  | 'businessName'
  | 'businessVerificationStatus'
  | 'businessVerificationNote'
> & { createdAt: string };
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
export interface Breakdown {
  label: string;
  count: number;
}
export interface Dashboard {
  events: number;
  users: number;
  venues: number;
  checkins: number;
  statuses: Breakdown[];
  cities: Breakdown[];
  categories: Breakdown[];
  activity: Breakdown[];
}
export interface Audit {
  id: string;
  actorId: string;
  targetId: string;
  actorName: string;
  targetName: string;
  action: string;
  changes: Record<string, unknown>;
  createdAt: string;
}
export interface Options {
  regions: Record<string, string[]>;
  locations: { city: string | null; state: string | null }[];
  categories: string[];
}
export interface BusinessDocument {
  cnpj: string | null;
  name: string | null;
  note: string | null;
  document: string | null;
}
const query = (filters: Record<string, string>) => {
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) q.set(key, value);
  });
  return q.toString();
};
export const adminService = {
  options: () => apiFetch<Options>('/admin/options'),
  dashboard: (filters: Record<string, string>) => apiFetch<Dashboard>(`/admin/dashboard?${query(filters)}`),
  events: (filters: Record<string, string>) => apiFetch<Page<BoraEvent>>(`/admin/events?${query(filters)}`),
  users: (filters: Record<string, string>) => apiFetch<Page<AdminUser>>(`/admin/users?${query(filters)}`),
  audit: (page: number) => apiFetch<Page<Audit>>(`/admin/audit?page=${page}`),
  updateUser: (id: string, body: Pick<AdminUser, 'name' | 'role' | 'isActive' | 'language' | 'showInWhoIsGoing'>) =>
    apiFetch(`/admin/users/${id}`, { method: 'PATCH', body }),
  review: (kind: 'event' | 'business', id: string, decision: 'approved' | 'rejected', note: string) =>
    apiFetch(kind === 'event' ? `/admin/events/${id}/review` : `/admin/users/${id}/business-review`, {
      method: 'PATCH',
      body: { decision, note },
    }),
  document: (id: string) => apiFetch<BusinessDocument>(`/admin/users/${id}/business-document`),
};
