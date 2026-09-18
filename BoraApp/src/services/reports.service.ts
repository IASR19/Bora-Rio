import { apiFetch } from '@/shared/api/client';
import type { ReportCategory, ReportTargetType } from '@/types/domain';

export const reportsService = {
  create: (payload: { targetType: ReportTargetType; targetId: string; category: ReportCategory; message?: string }) =>
    apiFetch('/reports', { method: 'POST', body: payload }),
};
