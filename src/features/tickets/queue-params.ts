import { CHANNELS, PRIORITIES, STATUSES, TYPES } from '@/lib/constants/tickets';
import type { Channel, Priority, TicketStatus, TicketType } from '@/types/api';
import type { TicketListParams } from './api';

export const QUEUE_PAGE_SIZE = 20;

export type QueueSort = 'newest' | 'oldest' | 'updated' | 'priority';
export const SORT_ORDER: QueueSort[] = ['newest', 'oldest', 'updated', 'priority'];
export const SORT_LABEL: Record<QueueSort, string> = { newest: 'Newest first', oldest: 'Oldest first', updated: 'Recently updated', priority: 'Highest priority' };
const SORT_API: Record<QueueSort, Pick<TicketListParams, 'sortBy' | 'order'>> = {
  newest: { sortBy: 'createdAt', order: 'desc' },
  oldest: { sortBy: 'createdAt', order: 'asc' },
  updated: { sortBy: 'updatedAt', order: 'desc' },
  priority: { sortBy: 'priority', order: 'desc' },
};

export type QueueFilters = {
  q: string;
  status?: TicketStatus;
  type?: TicketType;
  priority?: Priority;
  channel?: Channel;
  /** "any" | "me" | "unassigned" | a user id */
  assignee: string;
  sort: QueueSort;
  page: number;
};

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]) => (allowed.includes(value as T) ? (value as T) : undefined);

/** The URL is the single source of truth for every filter. */
export function parseQueueParams(params: URLSearchParams): QueueFilters {
  return {
    q: (params.get('q') ?? '').trim().slice(0, 200),
    status: oneOf(params.get('status'), STATUSES),
    type: oneOf(params.get('type'), TYPES),
    priority: oneOf(params.get('priority'), PRIORITIES),
    channel: oneOf(params.get('channel'), CHANNELS),
    assignee: (params.get('assignee') || 'any').slice(0, 64),
    sort: oneOf(params.get('sort'), SORT_ORDER) ?? 'newest',
    page: Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1),
  };
}

/** Defaults are omitted so the URL stays short. */
export function toSearchParams(f: QueueFilters): URLSearchParams {
  const qs = new URLSearchParams();
  if (f.q) qs.set('q', f.q);
  if (f.status) qs.set('status', f.status);
  if (f.type) qs.set('type', f.type);
  if (f.priority) qs.set('priority', f.priority);
  if (f.channel) qs.set('channel', f.channel);
  if (f.assignee !== 'any') qs.set('assignee', f.assignee);
  if (f.sort !== 'newest') qs.set('sort', f.sort);
  if (f.page > 1) qs.set('page', String(f.page));
  return qs;
}

export const hasActiveFilters = (f: QueueFilters) => Boolean(f.q || f.status || f.type || f.priority || f.channel || f.assignee !== 'any');

export function toApiParams(f: QueueFilters, meId: string): TicketListParams {
  return {
    q: f.q || undefined,
    status: f.status,
    type: f.type,
    priority: f.priority,
    channel: f.channel,
    assigneeId: f.assignee === 'me' ? meId : f.assignee === 'any' || f.assignee === 'unassigned' ? undefined : f.assignee,
    unassigned: f.assignee === 'unassigned' || undefined,
    ...SORT_API[f.sort],
    page: f.page,
    pageSize: QUEUE_PAGE_SIZE,
  };
}
