import { api } from "@/lib/api";
import { PRIORITY_LABEL, STATUS_LABEL, TYPE_LABEL } from "@/lib/tickets";
import type { Page, Priority, Role, TicketStatus, TicketType } from "@/lib/types";

export type AuditEntry = {
  auditId: number;
  tenantId: string;
  actorId: string | null;
  actorName: string | null;
  actorRole: Role | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export const AUDIT_PAGE_SIZE = 25;
export const ENTITY_TYPES = ["TICKET", "USER"] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export type AuditFilters = {
  entityType?: EntityType;
  /** A ticket number. Only used together with entityType TICKET. */
  entityId: string;
  page: number;
};

export function parseAuditParams(params: URLSearchParams): AuditFilters {
  const type = params.get("entityType");
  const id = params.get("entityId") ?? "";
  return {
    entityType: ENTITY_TYPES.find((t) => t === type),
    entityId: /^\d{1,10}$/.test(id) ? id : "",
    page: Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1),
  };
}

export function toAuditSearchParams(f: AuditFilters): URLSearchParams {
  const qs = new URLSearchParams();
  if (f.entityType) qs.set("entityType", f.entityType);
  if (f.entityType === "TICKET" && f.entityId) qs.set("entityId", f.entityId);
  if (f.page > 1) qs.set("page", String(f.page));
  return qs;
}

export function fetchAudit(f: AuditFilters, signal?: AbortSignal) {
  const qs = toAuditSearchParams(f);
  qs.set("page", String(f.page));
  qs.set("pageSize", String(AUDIT_PAGE_SIZE));
  return api<Page<AuditEntry>>(`/api/v1/audit-logs?${qs}`, { signal });
}

const text = (v: unknown) => (typeof v === "string" ? v : "");
const status = (v: unknown) => STATUS_LABEL[v as TicketStatus] ?? text(v);
const priority = (v: unknown) => PRIORITY_LABEL[v as Priority] ?? text(v);
const type = (v: unknown) => TYPE_LABEL[v as TicketType] ?? text(v);

/** A readable sentence for one audit row (the actor's name is shown separately). */
export function describeAction(e: AuditEntry): string {
  const m = e.metadata ?? {};
  switch (e.action) {
    case "TICKET_CREATED":
      return `created the ticket (${type(m.type)}, ${priority(m.priority).toLowerCase()} priority)`;
    case "TICKET_ASSIGNED": {
      const from = text(m.fromName);
      const to = text(m.toName);
      if (from && to) return `reassigned the ticket from ${from} to ${to}`;
      if (to) return `assigned the ticket to ${to}`;
      if (m.to === null) return "unassigned the ticket";
      return "changed the assignee";
    }
    case "TICKET_STATUS_CHANGED":
      return `changed the status from ${status(m.from)} to ${status(m.to)}`;
    case "TICKET_PRIORITY_CHANGED":
      return `changed the priority from ${priority(m.from)} to ${priority(m.to)}`;
    case "TICKET_TYPE_CHANGED":
      return `changed the type from ${type(m.from)} to ${type(m.to)}`;
    case "COMMENT_ADDED":
      return "added a comment";
    case "COMMENT_DELETED":
      return "deleted a comment";
    case "ATTACHMENT_ADDED":
      return `attached ${text(m.fileName) || "a file"}`;
    case "ATTACHMENT_DELETED":
      return "removed an attachment";
    case "USER_CREATED":
      return `created ${text(m.role).toLowerCase() || "a user"} account`;
    default:
      return e.action.toLowerCase().replace(/_/g, " ");
  }
}