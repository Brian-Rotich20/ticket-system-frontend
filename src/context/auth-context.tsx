'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchSession, registerBusiness, signIn as apiSignIn, signOut as apiSignOut, type RegisterInput } from '@/features/auth/api';
import { isApiError, setUnauthorizedHandler } from '@/lib/api/client';
import { clearToken, getToken, setLastOrganization, setToken, TOKEN_KEY } from '@/lib/session';
import type { SessionUser } from '@/types/api';

/**
 * loading: restoring the session; error: the server could not be reached (the token is kept, the user can retry,
 * nobody is logged out because of a cold start or a flaky connection).
 */
type Status = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextValue {
  user: SessionUser | null;
  status: Status;
  retry(): void;
  signIn(email: string, password: string): Promise<void>;
  /** Registers the business; returns the new organization id. */
  register(input: RegisterInput): Promise<string>;
  /** Adopt a session token handed out elsewhere (invitation acceptance). */
  adoptToken(token: string): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const loadSession = useCallback(async (): Promise<SessionUser | null> => {
    if (!getToken()) {
      setUser(null);
      setStatus('unauthenticated');
      return null;
    }
    try {
      const u = await fetchSession();
      if (!u) clearToken(); // the token no longer maps to a session
      setUser(u);
      setStatus(u ? 'authenticated' : 'unauthenticated');
      return u;
    } catch (err) {
      if (isApiError(err, 401)) {
        setUser(null);
        setStatus('unauthenticated');
        return null;
      }
      setStatus('error'); // network / timeout / server error: keep the token
      return null;
    }
  }, []);

  const localSignOut = useCallback(() => {
    clearToken();
    setLastOrganization(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // session persistence: restore from the stored token on every page load
  useEffect(() => {
    void Promise.resolve().then(loadSession);
  }, [loadSession]);

  // an expired or revoked session anywhere in the app logs the user out
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // cross-tab: signing out (or in as someone else) in one tab updates the others
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== TOKEN_KEY) return;
      if (!e.newValue) {
        setUser(null);
        setStatus('unauthenticated');
      } else {
        void loadSession();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      retry: () => {
        setStatus('loading');
        void loadSession();
      },
      async signIn(email, password) {
        await apiSignIn(email, password);
        if (!(await loadSession())) throw new Error('Could not start a session. Please try again.');
      },
      async register(input) {
        const organization = await registerBusiness(input);
        setLastOrganization(organization.id);
        if (!(await loadSession())) throw new Error('Your business was created, but signing in failed. Please sign in.');
        return organization.id;
      },
      async adoptToken(token) {
        setToken(token);
        if (!(await loadSession())) throw new Error('Could not start a session. Please sign in.');
      },
      async signOut() {
        try {
          await apiSignOut(); // revokes the session on the server
        } catch {
          /* local sign-out must still happen */
        } finally {
          localSignOut();
        }
      },
    }),
    [user, status, loadSession, localSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** For components that only render on protected routes: the user is guaranteed by <RequireAuth>. */
export function useUser(): SessionUser {
  const { user } = useAuth();
  if (!user) throw new Error('useUser must be used inside a protected route');
  return user;
}
