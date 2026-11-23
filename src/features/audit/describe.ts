import { CHANNEL_LABEL, PRIORITY_LABEL, STATUS_LABEL, TYPE_LABEL } from '@/lib/constants/tickets';
import { ROLE_LABEL } from '@/lib/constants/roles';
import type { AuditEntry, Channel, MemberRole, Priority, TicketStatus, TicketType } from '@/types/api';

const text = (v: unknown) => (typeof v === 'string' ? v : '');
const label = <K extends string>(map: Record<K, string>, v: unknown) => map[v as K] ?? text(v);
const status = (v: unknown) => label<TicketStatus>(STATUS_LABEL, v);
const priority = (v: unknown) => label<Priority>(PRIORITY_LABEL, v);
const type = (v: unknown) => label<TicketType>(TYPE_LABEL, v);
const role = (v: unknown) => label<MemberRole>(ROLE_LABEL, v).toLowerCase();

/**
 * A readable sentence for one audit row (the actor's name is shown separately). The backend records user ids
 * (e.g. assignments: { from, to }); `nameOf` resolves them from the organization's members.
 */
export function describeAction(e: AuditEntry, nameOf: (userId: string) => string | undefined = () => undefined): string {
  const m = e.metadata ?? {};
  const person = (v: unknown) => (typeof v === 'string' ? (nameOf(v) ?? 'a former member') : '');
  switch (e.action) {
    case 'TICKET_CREATED':
      return `recorded the ticket${m.channel ? ` from ${label<Channel>(CHANNEL_LABEL, m.channel)}` : ''} (${type(m.type)}, ${priority(m.priority).toLowerCase()} priority)`;
    case 'TICKET_ASSIGNED': {
      const from = person(m.from);
      const to = person(m.to);
      if (from && to) return `reassigned the ticket from ${from} to ${to}`;
      if (to) return `assigned the ticket to ${to}`;
      if (m.to === null) return `unassigned the ticket${from ? ` from ${from}` : ''}`;
      return 'changed the assignee';
    }
    case 'TICKET_STATUS_CHANGED':
      return m.reason === 'CUSTOMER_REPLY'
        ? `moved the ticket from ${status(m.from)} to ${status(m.to)} after a customer reply`
        : `changed the status from ${status(m.from)} to ${status(m.to)}`;
    case 'TICKET_PRIORITY_CHANGED':
      return `changed the priority from ${priority(m.from)} to ${priority(m.to)}`;
    case 'TICKET_TYPE_CHANGED':
      return `changed the type from ${type(m.from)} to ${type(m.to)}`;
    case 'TICKET_TYPE_MIGRATED':
      return `migrated the ticket type from ${text(m.from).toLowerCase().replace(/_/g, ' ')} to ${type(m.to)}`;
    case 'TICKET_UPDATED': {
      const fields = Object.keys(m).map((k) => (k === 'orderRef' ? 'order reference' : k === 'title' ? 'subject' : k));
      return `edited the ticket's ${fields.join(', ') || 'details'}`;
    }
    case 'COMMENT_ADDED':
      if (m.via === 'TRACKING_LINK') return 'replied through the tracking link';
      return m.visibility === 'INTERNAL' ? 'added an internal note' : 'replied to the customer';
    case 'COMMENT_DELETED':
      return 'deleted a comment';
    case 'ATTACHMENT_ADDED':
      return `attached ${text(m.fileName) || 'a file'}${m.visibility === 'PUBLIC' ? ' (shared with the customer)' : ''}`;
    case 'ATTACHMENT_DELETED':
      return 'removed an attachment';
    case 'TRACKING_LINK_CREATED':
      return m.replaced ? 'created a new tracking link (the old one stopped working)' : 'created a tracking link';
    case 'TRACKING_LINK_REVOKED':
      return 'revoked the tracking link';
    case 'CONTACT_CREATED':
      return `added the contact ${text(m.name)}`;
    case 'USER_CREATED':
      return `created ${role(m.role) || 'a'} account`;
    case 'MEMBER_ROLE_CHANGED': {
      const to = (m.to ?? {}) as { role?: unknown };
      return `changed a member's role to ${role(to.role)}`;
    }
    case 'MEMBER_DEACTIVATED':
      return 'deactivated a member';
    case 'MEMBER_REACTIVATED':
      return 'reactivated a member';
    case 'INVITATION_CREATED':
      return `invited ${text(m.email)} as ${role(m.role)}`;
    case 'INVITATION_REVOKED':
      return `revoked the invitation for ${text(m.email)}`;
    case 'INVITATION_ACCEPTED':
      return `joined the team as ${role(m.role)}`;
    case 'ORGANIZATION_CREATED':
      return `created the business ${text(m.name)}`;
    case 'ORGANIZATION_UPDATED':
      return 'updated the business settings';
    default:
      return e.action.toLowerCase().replace(/_/g, ' ');
  }
}
