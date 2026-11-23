import type { Metadata } from 'next';
import { TicketWorkspace } from '@/features/tickets/components/ticket-workspace';

export const metadata: Metadata = { title: 'Ticket' };

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketWorkspace id={Number(id)} />;
}
