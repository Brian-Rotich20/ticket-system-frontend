'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchSession, signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp, type SignUpInput } from '@/lib/auth';
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

  const refresh = useCallback(async (): Promise<SessionUser | null> => {
    try {
      const u = await fetchSession();
      setUser(u);
      setStatus(u ? 'authenticated' : 'unauthenticated');
      return u;
    } catch {
      setUser(null);
      setStatus('unauthenticated');
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** After sign-in/up, confirm the browser actually kept the session cookie. */
  const establish = useCallback(async () => {
    const u = await refresh();
    if (!u) throw new Error('Signed in, but no session was created. Check the API proxy (API_URL) and TRUSTED_ORIGINS on the backend.');
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      async signIn(email, password) {
        await apiSignIn(email, password);
        await establish();
      },
      async signUp(input) {
        await apiSignUp(input);
        await establish();
      },
      async signOut() {
        try {
          await apiSignOut();
        } finally {
          setUser(null);
          setStatus('unauthenticated');
        }
      },
    }),
    [user, status, establish],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}