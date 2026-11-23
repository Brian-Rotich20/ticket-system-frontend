import { api, request } from '@/lib/api/client';
import { setToken } from '@/lib/session';
import type { OrganizationMembership, SessionUser } from '@/types/api';

/** Better Auth returns the bearer token in the `set-auth-token` response header. */
function keepToken(res: Response): void {
  const token = res.headers.get('set-auth-token');
  if (!token) throw new Error('Could not start a session. Please try again.');
  setToken(token);
}

export async function signIn(email: string, password: string): Promise<void> {
  keepToken(await request('/api/auth/sign-in/email', { method: 'POST', json: { email, password }, scope: 'public' }));
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

/** Business owner registration: account + organization + ADMIN membership, signed in. */
export async function registerBusiness(input: RegisterInput): Promise<OrganizationMembership> {
  const res = await request('/api/auth/register', { method: 'POST', json: input, scope: 'public' });
  keepToken(res);
  const body = (await res.json()) as { organization: Omit<OrganizationMembership, 'joinedAt'> & { createdAt: string } };
  return { ...body.organization, joinedAt: body.organization.createdAt };
}

export const signOut = () => api('/api/auth/sign-out', { method: 'POST', json: {}, scope: 'user' });

/** The signed-in account, or null when the token is missing, expired or revoked. */
export async function fetchSession(): Promise<SessionUser | null> {
  const data = await api<{ user?: { id: string; name: string; email: string } } | null>('/api/auth/get-session', { scope: 'user' });
  const u = data?.user;
  return u ? { id: u.id, name: u.name, email: u.email } : null;
}
