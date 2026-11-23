import type { Metadata } from 'next';
import { Suspense } from 'react';
import { QueueView } from '@/features/tickets/components/queue-view';

export const metadata: Metadata = { title: 'Tickets' };

export default function TicketsPage() {
  return (
    <Suspense>
      <QueueView />
    </Suspense>
  );
}
