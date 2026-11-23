import { api, query } from '@/lib/api/client';
import type { AuditEntry, Page } from '@/types/api';

export const AUDIT_PAGE_SIZE = 25;

export const ENTITY_TYPES = ['TICKET', 'USER', 'CONTACT', 'INVITATION', 'ORGANIZATION'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];
export const ENTITY_LABEL: Record<EntityType, string> = {
  TICKET: 'Tickets',
  USER: 'Team members',
  CONTACT: 'Contacts',
  INVITATION: 'Invitations',
  ORGANIZATION: 'Business settings',
};

export interface AuditFilters {
  entityType?: EntityType;
  /** Ticket id (only with entityType TICKET). */
  entityId?: string;
  actorId?: string;
  page: number;
  pageSize?: number;
}

/** Admin only. */
export const fetchAudit = (f: AuditFilters, signal?: AbortSignal) =>
  api<Page<AuditEntry>>(
    `/api/v1/audit-logs${query({ entityType: f.entityType, entityId: f.entityType === 'TICKET' ? f.entityId : undefined, actorId: f.actorId, page: f.page, pageSize: f.pageSize ?? AUDIT_PAGE_SIZE })}`,
    { signal },
  );
