// Ticket details (view + edit + delete)
import type { Metadata } from 'next';
import { TicketDetail } from '@/components/tickets/ticket-detail';

export const metadata: Metadata = { title: 'Ticket · Support Desk' };

export default function TicketPage() {
  return <TicketDetail />;
}