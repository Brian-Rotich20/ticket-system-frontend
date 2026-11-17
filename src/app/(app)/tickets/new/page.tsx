// Create a ticket (form + validation + submit)
import type { Metadata } from 'next';
import { NewTicketForm } from '@/components/tickets/new-ticket-form';

export const metadata: Metadata = { title: 'New ticket · Support Desk' };

export default function NewTicketPage() {
  return <NewTicketForm />;
}