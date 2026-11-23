import { api, query } from '@/lib/api/client';
import type { Channel, Contact, Page, Priority, Ticket, TicketStatus, TicketType } from '@/types/api';

export interface TicketListParams {
  q?: string;
  status?: TicketStatus;
  priority?: Priority;
  type?: TicketType;
  channel?: Channel;
  assigneeId?: string;
  unassigned?: boolean;
  contactId?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/** GET /tickets, or /tickets/search when there is a search term. */
export function listTickets(p: TicketListParams, signal?: AbortSignal) {
  const { q, unassigned, ...rest } = p;
  const qs = query({ ...rest, unassigned: unassigned ? 'true' : undefined, q: q || undefined });
  return api<Page<Ticket>>(`/api/v1/tickets${q ? '/search' : ''}${qs}`, { signal });
}

export const getTicket = (id: number, signal?: AbortSignal) => api<Ticket>(`/api/v1/tickets/${id}`, { signal });

export type NewContactInput = { name: string; phone: string; email?: string | null };

/** Either an existing contact (contactId) or a new one (contact): exactly one of the two. */
export type CreateTicketInput = {
  title: string;
  description: string;
  type: TicketType;
  priority: Priority;
  channel: Channel;
  orderRef?: string;
  assigneeId?: string;
} & ({ contactId: number; contact?: never } | { contact: NewContactInput; contactId?: never });

export const createTicket = (input: CreateTicketInput) => api<Ticket>('/api/v1/tickets', { method: 'POST', json: input });

export type TicketPatch = Partial<Pick<Ticket, 'status' | 'priority' | 'type' | 'channel' | 'title' | 'description'>> & {
  assigneeId?: string | null;
  orderRef?: string | null;
  /** The version you last read. A mismatch is rejected with 409 VERSION_CONFLICT. */
  version?: number;
};

export const updateTicket = (id: number, patch: TicketPatch) => api<Ticket>(`/api/v1/tickets/${id}`, { method: 'PATCH', json: patch });

export type { Contact };
