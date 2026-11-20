import type { SessionUser, TicketListItem, TicketStatus } from "@/lib/types";

type Subject = Pick<TicketListItem, "status" | "assigneeId">;

const NEXT: Record<TicketStatus, TicketStatus | null> = {
  OPEN: "IN_PROGRESS",
  IN_PROGRESS: "RESOLVED",
  RESOLVED: "CLOSED",
  CLOSED: null,
};

export const nextStatus = (status: TicketStatus) => NEXT[status];

export const ACTION_LABEL: Partial<Record<TicketStatus, string>> = {
  IN_PROGRESS: "Start work",
  RESOLVED: "Mark as resolved",
  CLOSED: "Close ticket",
};

/** Admins always; agents only on tickets assigned to them. */
export const canWorkTicket = (user: SessionUser, t: Subject) =>
  t.status !== "CLOSED" && (user.role === "ADMIN" || (user.role === "AGENT" && t.assigneeId === user.id));

/** An agent may take an unassigned open ticket. Admins cannot be assignees, they assign agents. */
export const canPickUp = (user: SessionUser, t: Subject) =>
  user.role === "AGENT" && t.status === "OPEN" && !t.assigneeId;

export const canReassign = (user: SessionUser, t: Subject) => user.role === "ADMIN" && t.status !== "CLOSED";