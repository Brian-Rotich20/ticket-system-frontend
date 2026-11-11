'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler } from '@/lib/api';
import { fetchSession, signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp, type SignUpInput } from '@/lib/auth';
import { clearToken, getToken } from '@/lib/token';
import type { SessionUser } from '@/lib/types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: SessionUser | null;
  status: Status;
  signIn(email: string, password: string): Promise<void>;
  signUp(input: SignUpInput): Promise<void>;
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
      if (!u) clearToken(); // token no longer maps to a session
      setUser(u);
      setStatus(u ? 'authenticated' : 'unauthenticated');
      return u;
    } catch {
      // 401 is handled globally in api(); other failures keep the token so a reload can recover
      setUser(null);
      setStatus('unauthenticated');
      return null;
    }
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

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      async signIn(email, password) {
        await apiSignIn(email, password);
        if (!(await loadSession())) throw new Error('Could not start a session. Please try again.');
      },
      async signUp(input) {
        await apiSignUp(input);
        if (!(await loadSession())) throw new Error('Could not start a session. Please try again.');
      },
      async signOut() {
        try {
          await apiSignOut(); // revokes the session on the server
        } catch {
          /* local sign-out must still happen */
        } finally {
          clearToken();
          setUser(null);
          setStatus('unauthenticated');
        }
      },
    }),
    [user, status, loadSession],
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