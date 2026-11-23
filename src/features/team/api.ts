import { api, query, request } from '@/lib/api/client';
import type { Invitation, Member, MemberRole, MemberStatus, Page } from '@/types/api';

export const TEAM_PAGE_SIZE = 20;

export const listMembers = (f: { role?: MemberRole; status?: MemberStatus; page?: number; pageSize?: number }, signal?: AbortSignal) =>
  api<Page<Member>>(`/api/v1/users${query({ role: f.role, status: f.status, page: f.page ?? 1, pageSize: f.pageSize ?? TEAM_PAGE_SIZE })}`, { signal });

/** Every member matching the filter, page by page (assignee pickers, name lookups). */
export async function listAllMembers(f: { role?: MemberRole; status?: MemberStatus }, signal?: AbortSignal): Promise<Member[]> {
  const all: Member[] = [];
  for (let page = 1; ; page++) {
    const p = await listMembers({ ...f, page, pageSize: 100 }, signal);
    all.push(...p.items);
    if (page >= p.totalPages) return all;
  }
}

/** People a ticket can be assigned to: active agents and admins. */
export const listAssignableMembers = (signal?: AbortSignal) => listAllMembers({ status: 'ACTIVE' }, signal);

export const createMember = (input: { name: string; email: string; password: string; role: MemberRole }) =>
  api<Member>('/api/v1/users', { method: 'POST', json: input });

export const updateMember = (userId: string, patch: { role?: MemberRole; status?: MemberStatus }) =>
  api<Member>(`/api/v1/users/${encodeURIComponent(userId)}`, { method: 'PATCH', json: patch });

export const listInvitations = (page: number, signal?: AbortSignal) =>
  api<Page<Invitation>>(`/api/v1/invitations${query({ page, pageSize: TEAM_PAGE_SIZE })}`, { signal });

/** The acceptance token is returned once, here. */
export const createInvitation = (input: { email: string; role: MemberRole }) =>
  api<{ invitation: Invitation; token: string; path: string; url: string | null }>('/api/v1/invitations', { method: 'POST', json: input });

export const revokeInvitation = (id: number) => api(`/api/v1/invitations/${id}/revoke`, { method: 'POST' });

export interface PublicInvitation {
  organization: { name: string; logo: string | null };
  email: string;
  role: MemberRole;
  expiresAt: string;
  accountExists: boolean;
}

export const getPublicInvitation = (token: string, signal?: AbortSignal) =>
  api<PublicInvitation>(`/api/v1/public/invitations/${encodeURIComponent(token)}`, { signal, scope: 'public' });

/**
 * Accept. Signed in (`asSignedInUser`): joins with the current account. Otherwise creates an account with
 * name + password and returns its session token.
 */
export async function acceptInvitation(token: string, body: { name?: string; password?: string }, asSignedInUser: boolean) {
  const res = await request(`/api/v1/public/invitations/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
    json: body,
    scope: asSignedInUser ? 'user' : 'public',
  });
  const data = (await res.json()) as { organization: { id: string; name: string; logo: string | null; role: MemberRole } };
  return { organization: data.organization, sessionToken: res.headers.get('set-auth-token') };
}

/** An absolute link the admin can share, whether or not the backend knows the app URL. */
export const absoluteLink = (url: string | null, path: string) => url ?? (typeof window === 'undefined' ? path : `${window.location.origin}${path}`);
