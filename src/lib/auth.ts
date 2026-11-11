import { api, request } from './api';
import { setToken } from './token';
import type { SessionUser, StoreInfo } from './types';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  tenantId: string;
}

/** Better Auth returns the bearer token in the `set-auth-token` response header. */
async function authenticate(path: string, json: unknown): Promise<void> {
  const res = await request(path, { method: 'POST', json, auth: false });
  const token = res.headers.get('set-auth-token');
  if (!token) throw new Error('Could not start a session. Please try again.');
  setToken(token);
}

export const signIn = (email: string, password: string) => authenticate('/api/auth/sign-in/email', { email, password });

export const signUp = (input: SignUpInput) => authenticate('/api/auth/sign-up/email', input);

export const signOut = () => api('/api/auth/sign-out', { method: 'POST', json: {} });

/** The signed-in user, or null when the token is missing, expired or revoked. */
export async function fetchSession(): Promise<SessionUser | null> {
  const data = await api<{ user?: Record<string, any> } | null>('/api/auth/get-session');
  const u = data?.user;
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, tenantId: u.tenantId, role: u.role };
}

/** Public: resolves a store slug to its name (sign-up page). */
export const lookupStore = (slug: string, signal?: AbortSignal) =>
  api<StoreInfo>(`/api/v1/public/tenants/${encodeURIComponent(slug.trim().toLowerCase())}`, { signal, auth: false });