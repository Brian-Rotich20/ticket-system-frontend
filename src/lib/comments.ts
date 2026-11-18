import { api } from "@/lib/api";
import type { Page, TicketComment } from "@/lib/types";

export const COMMENT_MAX = 5000; // matches the backend limit
export const THREAD_PAGE_SIZE = 100; // the backend maximum page size

export const listComments = (ticketId: number, signal?: AbortSignal) =>
  api<Page<TicketComment>>(`/api/v1/tickets/${ticketId}/comments?page=1&pageSize=${THREAD_PAGE_SIZE}`, { signal });

export const addComment = (ticketId: number, text: string) =>
  api<TicketComment>(`/api/v1/tickets/${ticketId}/comments`, { method: "POST", json: { text } });