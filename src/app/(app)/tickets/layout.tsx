// # CUSTOMER-only guard for the whole section
import type { ReactNode } from 'react';
import { RequireAuth } from '@/components/RequireAuth';

export default function TicketsLayout({ children }: { children: ReactNode }) {
  return <RequireAuth roles={['CUSTOMER']}>{children}</RequireAuth>;
}