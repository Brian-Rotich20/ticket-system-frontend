import { api } from './api';
import type { Page, Priority, Ticket, TicketStatus, TicketType } from './types';

export const STATUS_ORDER: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const TYPE_ORDER: TicketType[] = ['INQUIRY', 'IT_REQUEST', 'INTERNAL_ISSUE'];
export const TYPE_LABEL: Record<TicketType, string> = {
  INQUIRY: 'Inquiry',
  IT_REQUEST: 'IT request',
  INTERNAL_ISSUE: 'Internal issue',
};
export const TYPE_HINT: Record<TicketType, string> = {
  INQUIRY: 'A question about an order, delivery, return or product.',
  IT_REQUEST: 'Access, equipment or software.',
  INTERNAL_ISSUE: 'A problem inside the business.',
};

export const PRIORITY_ORDER: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const isTicketStatus = (v: string | null): v is TicketStatus => v !== null && STATUS_ORDER.includes(v as TicketStatus);

export interface TicketFilters {
  status?: TicketStatus;
  type?: TicketType;
  priority?: Priority;
  page?: number;
  pageSize?: number;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  type: TicketType;
  priority: Priority;
}

/** Customers are scoped to their own tickets by the backend. */
export function listTickets(filters: TicketFilters, signal?: AbortSignal) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  }
  const query = qs.toString();
  return api<Page<Ticket>>(`/api/v1/tickets${query ? `?${query}` : ''}`, { signal });
}

export const getTicket = (id: number, signal?: AbortSignal) => api<Ticket>(`/api/v1/tickets/${id}`, { signal });

export const createTicket = (input: CreateTicketInput) => api<Ticket>('/api/v1/tickets', { method: 'POST', json: input });