import { api } from '@/lib/api/client';
import type { Organization, OrganizationMembership } from '@/types/api';

/** The organizations the signed-in user is an active member of (no organization header needed). */
export const listMyOrganizations = (signal?: AbortSignal) => api<OrganizationMembership[]>('/api/v1/organizations', { signal, scope: 'user' });

export const getCurrentOrganization = (signal?: AbortSignal) => api<Organization>('/api/v1/organizations/current', { signal });

export const updateOrganization = (input: { name?: string; logo?: string | null }) =>
  api<Organization>('/api/v1/organizations/current', { method: 'PATCH', json: input });

/** Public business branding (support portal). */
export const getPublicBusiness = (slug: string, signal?: AbortSignal) =>
  api<{ id: string; name: string; logo: string | null }>(`/api/v1/public/tenants/${encodeURIComponent(slug)}`, { signal, scope: 'public' });
