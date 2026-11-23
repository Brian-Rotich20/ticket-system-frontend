import { api, isApiError, query } from '@/lib/api/client';
import type { Contact, Page, Ticket } from '@/types/api';

export const CONTACT_PAGE_SIZE = 20;

export const listContacts = (q: string, page: number, signal?: AbortSignal, pageSize = CONTACT_PAGE_SIZE) =>
  api<Page<Contact>>(`/api/v1/contacts${query({ q: q.trim() || undefined, page, pageSize })}`, { signal });

export const getContact = (id: number, signal?: AbortSignal) => api<Contact>(`/api/v1/contacts/${id}`, { signal });

export const createContact = (input: { name: string; phone: string; email?: string | null }) => api<Contact>('/api/v1/contacts', { method: 'POST', json: input });

export const getContactTickets = (id: number, page: number, signal?: AbortSignal) =>
  api<Page<Ticket>>(`/api/v1/contacts/${id}/tickets${query({ page, pageSize: 10 })}`, { signal });

/** A 409 CONTACT_EXISTS carries the existing contact, so the UI can offer to use it instead. */
export function existingContactFrom(err: unknown): { contactId: number; name: string } | null {
  if (!isApiError(err, 409, 'CONTACT_EXISTS')) return null;
  const d = err.details as { contactId?: number; name?: string } | undefined;
  return d?.contactId ? { contactId: d.contactId, name: d.name ?? 'this contact' } : null;
}

/** Same normalisation as the backend (spaces, dashes, dots and brackets removed). */
export const normalizePhone = (raw: string) => raw.trim().replace(/[\s\-.()]/g, '');
export const isValidPhone = (raw: string) => /^\+?\d{7,15}$/.test(normalizePhone(raw));
