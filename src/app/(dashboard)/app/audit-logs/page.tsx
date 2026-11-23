import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RequireRole } from '@/components/layout/require-auth';
import { AuditView } from '@/features/audit/audit-view';

export const metadata: Metadata = { title: 'Audit log' };

export default function AuditLogsPage() {
  return (
    <RequireRole roles={['ADMIN']}>
      <Suspense>
        <AuditView />
      </Suspense>
    </RequireRole>
  );
}
