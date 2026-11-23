import { ALLOWED_TRANSITIONS, NEEDS_ASSIGNEE } from '@/lib/constants/tickets';
import type { MemberRole, Ticket, TicketStatus } from '@/types/api';

/**
 * UI hints mirroring backend/src/service/policy.ts. They only decide what to show; the backend decides what
 * is allowed and its error is shown when the two disagree.
 */
type Actor = { id: string; role: MemberRole };
type Subject = Pick<Ticket, 'status' | 'assigneeId'>;

/** Status, priority, type and details: admins, the assignee, or anyone while the ticket is unassigned. */
export const canWork = (a: Actor, t: Subject) => t.status !== 'CLOSED' && (a.role === 'ADMIN' || t.assigneeId === null || t.assigneeId === a.id);

/** Agents assign unassigned tickets and hand over their own; reassigning someone else's ticket is admin-only. */
export const canAssign = canWork;

export const nextStatuses = (status: TicketStatus) => ALLOWED_TRANSITIONS[status];

/** An agent moving an unassigned ticket into a worked status takes it; an admin must assign someone first. */
export function assigneeHint(a: Actor, t: Subject, to: TicketStatus): string | null {
  if (t.assigneeId || !NEEDS_ASSIGNEE.includes(to)) return null;
  return a.role === 'AGENT' ? 'This assigns the ticket to you.' : 'Assign someone first: a ticket in this status needs an owner.';
}
