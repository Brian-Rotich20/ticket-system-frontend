import { api, query } from '@/lib/api/client';
import type { Comment, Page, Visibility } from '@/types/api';

export const COMMENT_PAGE_SIZE = 50;

/** Oldest first. */
export const listComments = (ticketId: number, page: number, signal?: AbortSignal) =>
  api<Page<Comment>>(`/api/v1/tickets/${ticketId}/comments${query({ page, pageSize: COMMENT_PAGE_SIZE })}`, { signal });

export const addComment = (ticketId: number, text: string, visibility: Visibility) =>
  api<Comment>(`/api/v1/tickets/${ticketId}/comments`, { method: 'POST', json: { text, visibility } });
