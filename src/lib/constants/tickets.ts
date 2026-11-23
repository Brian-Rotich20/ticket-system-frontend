import type { Channel, Priority, TicketStatus, TicketType, Visibility } from '@/types/api';

/** Badge tones map to design tokens (see components/ui/badge.tsx). */
export type Tone = 'neutral' | 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'note';

export const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'];
export const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  WAITING_ON_CUSTOMER: 'Waiting on customer',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};
export const STATUS_TONE: Record<TicketStatus, Tone> = {
  OPEN: 'info',
  IN_PROGRESS: 'primary',
  WAITING_ON_CUSTOMER: 'warning',
  RESOLVED: 'secondary',
  CLOSED: 'neutral',
};
/** Customer-facing wording for the tracking page. */
export const STATUS_CUSTOMER_TEXT: Record<TicketStatus, string> = {
  OPEN: 'We have received your request and will pick it up shortly.',
  IN_PROGRESS: 'Our team is working on your request.',
  WAITING_ON_CUSTOMER: 'We are waiting for a reply from you.',
  RESOLVED: 'We believe your request is resolved. Reply below if anything is still wrong.',
  CLOSED: 'This request is closed.',
};

/** Mirrors the backend's ALLOWED_TRANSITIONS (backend/src/model/enums.ts). The backend has the final say. */
export const ALLOWED_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED'],
  IN_PROGRESS: ['WAITING_ON_CUSTOMER', 'RESOLVED'],
  WAITING_ON_CUSTOMER: ['IN_PROGRESS', 'RESOLVED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};
/** Someone must own a ticket in these statuses. */
export const NEEDS_ASSIGNEE: readonly TicketStatus[] = ['IN_PROGRESS', 'WAITING_ON_CUSTOMER'];

export const transitionLabel = (from: TicketStatus, to: TicketStatus) =>
  from === 'RESOLVED' && to === 'IN_PROGRESS' ? 'Reopen (in progress)' : STATUS_LABEL[to];

export const PRIORITIES: Priority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
export const PRIORITY_LABEL: Record<Priority, string> = { LOW: 'Low', NORMAL: 'Normal', HIGH: 'High', URGENT: 'Urgent' };
export const PRIORITY_TONE: Record<Priority, Tone> = { LOW: 'neutral', NORMAL: 'info', HIGH: 'warning', URGENT: 'danger' };

export const TYPES: TicketType[] = ['ORDER_ISSUE', 'DELIVERY', 'PAYMENT', 'RETURN_REFUND', 'PRODUCT_INQUIRY', 'COMPLAINT', 'OTHER'];
export const TYPE_LABEL: Record<TicketType, string> = {
  ORDER_ISSUE: 'Order issue',
  DELIVERY: 'Delivery',
  PAYMENT: 'Payment',
  RETURN_REFUND: 'Return / refund',
  PRODUCT_INQUIRY: 'Product inquiry',
  COMPLAINT: 'Complaint',
  OTHER: 'Other',
};

export const CHANNELS: Channel[] = ['WHATSAPP', 'INSTAGRAM', 'TIKTOK', 'PHONE', 'EMAIL', 'WEBSITE', 'WALK_IN', 'OTHER'];
export const CHANNEL_LABEL: Record<Channel, string> = {
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  PHONE: 'Phone call',
  EMAIL: 'Email',
  WEBSITE: 'Website',
  WALK_IN: 'Walk-in',
  OTHER: 'Other',
};

export const VISIBILITY_LABEL: Record<Visibility, string> = { PUBLIC: 'Public', INTERNAL: 'Internal' };

/** Backend limits, kept in sync with backend/src (DTOs and env defaults). */
export const LIMITS = { title: 200, description: 10_000, comment: 5_000, orderRef: 100, contactName: 120 } as const;
