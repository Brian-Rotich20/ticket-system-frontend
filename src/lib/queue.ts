import { api } from "@/lib/api";
import { PRIORITY_ORDER, STATUS_ORDER, TYPE_ORDER } from "@/lib/tickets";
import type { Page, Priority, StaffUser, TicketListItem, TicketStatus, TicketType } from "@/lib/types";

export const QUEUE_PAGE_SIZE = 20;

export type QueueSort = "newest" | "oldest" | "updated" | "priority";
export const SORT_ORDER: QueueSort[] = ["newest", "oldest", "updated", "priority"];
export const SORT_LABEL: Record<QueueSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  updated: "Recently updated",
  priority: "Highest priority",
};

const SORT_API: Record<QueueSort, { sortBy: string; order: "asc" | "desc" }> = {
  newest: { sortBy: "createdAt", order: "desc" },
  oldest: { sortBy: "createdAt", order: "asc" },
  updated: { sortBy: "updatedAt", order: "desc" },
  priority: { sortBy: "priority", order: "desc" },
};

export type QueueFilters = {
  q: string;
  status?: TicketStatus;
  type?: TicketType;
  priority?: Priority;
  /** "any" | "me" | "unassigned" | a user id */
  assignee: string;
  sort: QueueSort;
  page: number;
};

function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export function parseQueueParams(params: URLSearchParams): QueueFilters {
  return {
    q: (params.get("q") ?? "").trim().slice(0, 200),
    status: oneOf(params.get("status"), STATUS_ORDER),
    type: oneOf(params.get("type"), TYPE_ORDER),
    priority: oneOf(params.get("priority"), PRIORITY_ORDER),
    assignee: params.get("assignee") || "any",
    sort: oneOf(params.get("sort"), SORT_ORDER) ?? "newest",
    page: Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1),
  };
}

/** Defaults are omitted so the URL stays short. */
export function toSearchParams(f: QueueFilters): URLSearchParams {
  const qs = new URLSearchParams();
  if (f.q) qs.set("q", f.q);
  if (f.status) qs.set("status", f.status);
  if (f.type) qs.set("type", f.type);
  if (f.priority) qs.set("priority", f.priority);
  if (f.assignee !== "any") qs.set("assignee", f.assignee);
  if (f.sort !== "newest") qs.set("sort", f.sort);
  if (f.page > 1) qs.set("page", String(f.page));
  return qs;
}

export const hasActiveFilters = (f: QueueFilters) =>
  Boolean(f.q || f.status || f.type || f.priority || f.assignee !== "any");

export function fetchQueue(f: QueueFilters, meId: string, signal?: AbortSignal) {
  const qs = new URLSearchParams();
  if (f.status) qs.set("status", f.status);
  if (f.type) qs.set("type", f.type);
  if (f.priority) qs.set("priority", f.priority);

  if (f.assignee === "me") qs.set("assigneeId", meId);
  else if (f.assignee === "unassigned") qs.set("unassigned", "true");
  else if (f.assignee !== "any") qs.set("assigneeId", f.assignee);

  const sort = SORT_API[f.sort];
  qs.set("sortBy", sort.sortBy);
  qs.set("order", sort.order);
  qs.set("page", String(f.page));
  qs.set("pageSize", String(QUEUE_PAGE_SIZE));

  if (f.q) qs.set("q", f.q);
  const path = f.q ? "/api/v1/tickets/search" : "/api/v1/tickets";
  return api<Page<TicketListItem>>(`${path}?${qs}`, { signal });
}

/** Agents the assignee filter can offer (staff-only endpoint). */
export const listAgents = (signal?: AbortSignal) =>
  api<Page<StaffUser>>("/api/v1/users?role=AGENT&pageSize=100", { signal }).then((p) => p.items);