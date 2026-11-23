import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NewTicketForm } from '@/features/tickets/components/new-ticket-form';

export const metadata: Metadata = { title: 'New ticket' };

export default function NewTicketPage() {
  return (
    <Suspense>
      <NewTicketForm />
    </Suspense>
  );
}
