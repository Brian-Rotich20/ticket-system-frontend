// my tickets (list + status filter + pagination)
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TicketList } from '@/components/tickets/ticket-list';

export const metadata: Metadata = { title: 'My tickets · Support Desk' };

export default function TicketsPage() {
  return (
    <Suspense>
      <TicketList />
    </Suspense>
  );
}