export type Role = 'CUSTOMER' | 'AGENT' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: Role;
}

export interface StoreInfo {
  id: string;
  name: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketType = 'INQUIRY' | 'IT_REQUEST' | 'INTERNAL_ISSUE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Ticket {
  ticketId: number;
  tenantId: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: Priority;
  requesterId: string;
  assigneeId: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}