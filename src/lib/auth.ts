import { api } from './api';
import type { SessionUser, StoreInfo } from './types';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  tenantId: string;
}

/** Returns the signed-in user, or null when there is no valid session. */
export async function fetchSession(): Promise<SessionUser | null> {
  const data = await api<{ user?: Record<string, any> } | null>('/api/auth/get-session');
  const u = data?.user;
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, tenantId: u.tenantId, role: u.role };
}

export const signIn = (email: string, password: string) =>
  api('/api/auth/sign-in/email', { method: 'POST', json: { email, password } });

export const signUp = (input: SignUpInput) => api('/api/auth/sign-up/email', { method: 'POST', json: input });

export const signOut = () => api('/api/auth/sign-out', { method: 'POST', json: {} });

/** Public: resolves a store slug to its name (used on the sign-up page). */
export const lookupStore = (slug: string, signal?: AbortSignal) =>
  api<StoreInfo>(`/api/v1/public/tenants/${encodeURIComponent(slug.trim().toLowerCase())}`, { signal });