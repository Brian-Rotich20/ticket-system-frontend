import { api, request } from '@/lib/api/client';
import type { PublicTicket, TrackingLink, TrackingLinkStatus } from '@/types/api';

// ---- staff (organization-scoped)
/** The token is returned once, here. Creating a link replaces the previous one. */
export const createTrackingLink = (ticketId: number) => api<TrackingLink>(`/api/v1/tickets/${ticketId}/tracking-link`, { method: 'POST' });
export const getTrackingLinkStatus = (ticketId: number, signal?: AbortSignal) => api<TrackingLinkStatus>(`/api/v1/tickets/${ticketId}/tracking-link`, { signal });
export const revokeTrackingLink = (ticketId: number) => api(`/api/v1/tickets/${ticketId}/tracking-link/revoke`, { method: 'POST' });

// ---- customer (public: the token is the only credential, nothing else is sent)
const base = (token: string) => `/api/v1/public/tickets/${encodeURIComponent(token)}`;
export const getPublicTicket = (token: string, signal?: AbortSignal) => api<PublicTicket>(base(token), { signal, scope: 'public' });
export const postPublicReply = (token: string, text: string) =>
  api<PublicTicket['comments'][number]>(`${base(token)}/comments`, { method: 'POST', json: { text }, scope: 'public' });
export async function downloadPublicAttachment(token: string, attachmentId: number): Promise<Blob> {
  return (await request(`${base(token)}/attachments/${attachmentId}`, { scope: 'public' })).blob();
}

/**
 * Accepts a full tracking link or a bare token (the support portal's "track a request" box).
 * Tokens are 43 URL-safe base64 characters.
 */
export function extractTrackingToken(input: string): string | null {
  const value = input.trim();
  const match = /(?:\/track\/)?([A-Za-z0-9_-]{43})(?:[/?#].*)?$/.exec(value);
  return match ? match[1]! : null;
}
