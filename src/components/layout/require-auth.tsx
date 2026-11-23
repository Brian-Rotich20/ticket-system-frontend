'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { FullPageSpinner } from '@/components/ui/spinner';
import { useAuth } from '@/context/auth-context';
import { useOrganization } from '@/context/organization-context';
import type { MemberRole } from '@/types/api';

/** Client-side route guard. The backend enforces the real permissions; this shapes the UI. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, retry } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold">We can&apos;t reach the server</h1>
          <p className="mt-2 text-sm text-muted">You are still signed in. The service may be waking up; try again in a moment.</p>
          <Button className="mt-5" onClick={retry}>
            Try again
          </Button>
        </div>
      </div>
    );
  }
  if (status !== 'authenticated') return <FullPageSpinner />;
  return <>{children}</>;
}

/** Page-level role check within the current organization. */
export function RequireRole({ roles, children }: { roles: MemberRole[]; children: ReactNode }) {
  const { role, current } = useOrganization();
  if (!roles.includes(role)) {
    return (
      <div className="mx-auto max-w-md rounded-card border border-line bg-surface p-8 text-center">
        <h1 className="text-lg font-semibold">Not available</h1>
        <p className="mt-2 text-sm text-muted">This page is for {roles.join(' / ').toLowerCase()}s. Your role in {current.name} is {role.toLowerCase()}.</p>
      </div>
    );
  }
  return <>{children}</>;
}
