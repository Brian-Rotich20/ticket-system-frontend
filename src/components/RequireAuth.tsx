'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import type { Role } from '@/lib/types';
import { Card } from './ui/card';
import { FullPageSpinner } from './ui/spinner';

/** Client-side route guard. The backend enforces the real permissions; this shapes the UI. */
export function RequireAuth({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  if (status !== 'authenticated' || !user) return <FullPageSpinner />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-md py-24">
        <Card>
          <h1 className="text-lg font-semibold">Not allowed</h1>
          <p className="mt-2 text-sm text-slate-600">Your role ({user.role}) cannot open this page.</p>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
}