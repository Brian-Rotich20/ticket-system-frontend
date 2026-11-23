import { api } from '@/lib/api/client';
import type { DashboardOverview } from '@/types/api';

export const getOverview = (signal?: AbortSignal) => api<DashboardOverview>('/api/v1/dashboard/overview', { signal });
