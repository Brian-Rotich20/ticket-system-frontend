'use client';

import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { RequireAuth } from '@/components/layout/require-auth';
import { ErrorState } from '@/components/shared/states';
import { Button, LinkButton } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { FullPageSpinner } from '@/components/ui/spinner';
import { useAuth } from '@/context/auth-context';
import { OrganizationProvider } from '@/context/organization-context';

function NoOrganization({ retry }: { retry: () => void }) {
  const { user, signOut } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <Logo className="justify-center" />
        <h1 className="mt-8 text-xl font-semibold">You are not part of a business yet</h1>
        <p className="mt-2 text-sm text-muted">
          {user?.email} is not an active member of any organization. Ask an admin for an invitation, or register your own business.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={retry}>
            Check again
          </Button>
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
        <p className="mt-6 text-sm">
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register a business
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Everything under /app needs a signed-in user AND an active organization membership. */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <OrganizationProvider>
        {(state) => {
          if (state.status === 'loading') return <FullPageSpinner label="Loading your workspace" />;
          if (state.status === 'error')
            return (
              <div className="mx-auto max-w-md px-4 py-24">
                <ErrorState error={state.error} onRetry={state.retry} />
                <div className="mt-4 text-center">
                  <LinkButton href="/" variant="ghost">
                    Home
                  </LinkButton>
                </div>
              </div>
            );
          if (state.status === 'none') return <NoOrganization retry={state.retry} />;
          // keyed by organization: switching remounts the workspace, so no data leaks between organizations
          return (
            <Fragment key={state.value.current.id}>
              <AppShell>{children}</AppShell>
            </Fragment>
          );
        }}
      </OrganizationProvider>
    </RequireAuth>
  );
}
