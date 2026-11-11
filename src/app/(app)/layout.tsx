import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';

/** Everything under (app) needs a signed-in user. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}