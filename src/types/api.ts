/** Shapes returned by the v2 backend (see backend/docs/api.md). Dates are ISO strings. */

export type MemberRole = 'ADMIN' | 'AGENT';
export type MemberStatus = 'ACTIVE' | 'DEACTIVATED';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TicketType = 'ORDER_ISSUE' | 'DELIVERY' | 'PAYMENT' | 'RETURN_REFUND' | 'PRODUCT_INQUIRY' | 'COMPLAINT' | 'OTHER';
export type Channel = 'WHATSAPP' | 'INSTAGRAM' | 'TIKTOK' | 'PHONE' | 'EMAIL' | 'WEBSITE' | 'WALK_IN' | 'OTHER';
export type Visibility = 'PUBLIC' | 'INTERNAL';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** The signed-in account. Roles are NOT here: they belong to organization memberships. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

/** GET /organizations: one active membership of the signed-in user. */
export interface OrganizationMembership {
  id: string;
  name: string;
  logo: string | null;
  role: MemberRole;
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  logo: string | null;
  createdAt: string;
  role: MemberRole;
}

export interface Member {
  userId: string;
  tenantId: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  invitationId: number;
  tenantId: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  expiresAt: string;
  invitedBy: string;
  invitedByName: string;
  acceptedBy: string | null;
  acceptedAt: string | null;
  createdAt: string;
}

export interface Contact {
  contactId: number;
  tenantId: string;
  name: string;
  phone: string | null;
  email: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  ticketId: number;
  ticketNumber: number;
  tenantId: string;
  contactId: number;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: Priority;
  channel: Channel;
  orderRef: string | null;
  assigneeId: string | null;
  createdBy: string;
  requesterId: string | null;
  version: number;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  assigneeName: string | null;
  createdByName: string;
}

export interface Comment {
  commentId: number;
  ticketId: number;
  authorId: string | null;
  authorContactId: number | null;
  authorType: 'STAFF' | 'CONTACT';
  authorName: string;
  authorRole: 'ADMIN' | 'AGENT' | 'CUSTOMER';
  text: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  attachmentId: number;
  ticketId: number;
  commentId: number | null;
  fileName: string;
  fileType: string;
  visibility: Visibility;
  uploadedBy: string;
  createdAt: string;
  /** API path of the authorised download, relative to the API base URL. */
  url: string;
}

export interface TrackingLink {
  token: string;
  path: string;
  url: string | null;
  expiresAt: string;
}

export interface TrackingLinkStatus {
  active: boolean;
  expiresAt: string | null;
  createdAt: string | null;
}

export interface PublicTicket {
  ticket: Pick<Ticket, 'ticketNumber' | 'title' | 'description' | 'status' | 'type' | 'orderRef' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'closedAt'>;
  organization: { name: string; logo: string | null };
  contact: { name: string };
  comments: { commentId: number; text: string; authorType: 'STAFF' | 'CONTACT'; authorName: string; createdAt: string }[];
  attachments: { attachmentId: number; fileName: string; fileType: string; createdAt: string }[];
  canReply: boolean;
  linkExpiresAt: string;
}

export interface AuditEntry {
  auditId: number;
  tenantId: string;
  actorId: string | null;
  actorName: string | null;
  actorRole: MemberRole | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardOverview {
  totals: Record<TicketStatus, number> & { total: number };
  assigned: { mine: number; unassigned: number; byAssignee: { userId: string; name: string; open: number }[] };
  recentTickets: Ticket[];
}
