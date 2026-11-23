'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState, ErrorState, LoadingRows } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Pagination } from '@/components/ui/pagination';
import { SelectField } from '@/components/ui/select-field';
import { listAllMembers } from '@/features/team/api';
import { useQuery } from '@/hooks/use-query';
import { ROLE_LABEL, ROLE_TONE } from '@/lib/constants/roles';
import { cx, formatDate, plural } from '@/lib/utils';
import type { AuditEntry } from '@/types/api';
import { ENTITY_LABEL, ENTITY_TYPES, fetchAudit, type AuditFilters, type EntityType } from './api';
import { describeAction } from './describe';

function parse(params: URLSearchParams): AuditFilters {
  const type = ENTITY_TYPES.find((t) => t === params.get('entityType'));
  const id = params.get('entityId') ?? '';
  return {
    entityType: type,
    entityId: type === 'TICKET' && /^\d{1,12}$/.test(id) ? id : undefined,
    actorId: params.get('actorId')?.slice(0, 64) || undefined,
    page: Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1),
  };
}
function toQuery(f: AuditFilters): string {
  const qs = new URLSearchParams();
  if (f.entityType) qs.set('entityType', f.entityType);
  if (f.entityType === 'TICKET' && f.entityId) qs.set('entityId', f.entityId);
  if (f.actorId) qs.set('actorId', f.actorId);
  if (f.page > 1) qs.set('page', String(f.page));
  return qs.toString();
}

function Subject({ e }: { e: AuditEntry }) {
  switch (e.entityType) {
    case 'TICKET':
      return (
        <Link href={`/app/tickets/${e.entityId}`} className="font-medium text-primary hover:underline">
          Open ticket
        </Link>
      );
    case 'CONTACT':
      return (
        <Link href={`/app/contacts/${e.entityId}`} className="font-medium text-primary hover:underline">
          Open contact
        </Link>
      );
    default:
      return <span className="text-muted">{ENTITY_LABEL[e.entityType as EntityType] ?? e.entityType}</span>;
  }
}

export function AuditView() {
  const router = useRouter();
  const params = useSearchParams();
  const filters = useMemo(() => parse(new URLSearchParams(params.toString())), [params]);
  const key = toQuery(filters);
  const audit = useQuery((signal) => fetchAudit(filters, signal), [key]);
  const members = useQuery((signal) => listAllMembers({}, signal), []);
  const names = useMemo(() => new Map((members.data ?? []).map((m) => [m.userId, m.name])), [members.data]);

  function update(patch: Partial<AuditFilters>) {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    if (next.entityType !== 'TICKET') next.entityId = undefined;
    const qs = toQuery(next);
    router.replace(qs ? `/app/audit-logs?${qs}` : '/app/audit-logs', { scroll: false });
  }
  const filtered = Boolean(filters.entityType || filters.actorId);
  const data = audit.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description={<span aria-live="polite">{data ? `${plural(data.total, 'event')} · who did what, and when` : 'Loading events'}</span>}
        actions={
          <Button variant="outline" onClick={audit.refetch} loading={audit.loading && Boolean(data)}>
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 rounded-card border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[220px_220px_220px_auto]">
        <SelectField label="Show" name="entityType" value={filters.entityType ?? ''} onChange={(e) => update({ entityType: (e.target.value || undefined) as EntityType | undefined })}>
          <option value="">Everything</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {ENTITY_LABEL[t]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Staff member" name="actorId" value={filters.actorId ?? ''} onChange={(e) => update({ actorId: e.target.value || undefined })}>
          <option value="">Anyone</option>
          {(members.data ?? []).map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.name}
            </option>
          ))}
        </SelectField>
        {filters.entityType === 'TICKET' && filters.entityId ? (
          <Field label="Ticket" name="ticket" value={`Ticket id ${filters.entityId}`} readOnly disabled />
        ) : null}
        {filtered ? (
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => router.replace('/app/audit-logs', { scroll: false })}>
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>

      {audit.error ? <ErrorState error={audit.error} onRetry={audit.refetch} /> : null}
      {audit.loading && !data ? <LoadingRows rows={6} /> : null}
      {data && data.items.length === 0 ? <EmptyState title={filtered ? 'No events match these filters' : 'No activity yet'} /> : null}

      {data && data.items.length > 0 ? (
        <>
          <div className={cx('overflow-x-auto rounded-card border border-line bg-surface', audit.loading && 'opacity-60')}>
            <table className="min-w-full divide-y divide-line text-left text-sm">
              <caption className="sr-only">Audit log</caption>
              <thead className="bg-canvas text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  {['When', 'Who', 'What', 'On'].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((e) => (
                  <tr key={e.auditId} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(e.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-medium text-ink">{e.actorName ?? (e.metadata?.via === 'TRACKING_LINK' ? 'Customer' : 'System')}</span>
                      {e.actorRole ? (
                        <span className="ml-2">
                          <Badge tone={ROLE_TONE[e.actorRole]}>{ROLE_LABEL[e.actorRole]}</Badge>
                        </span>
                      ) : null}
                    </td>
                    <td className="min-w-[16rem] px-4 py-3 text-ink">{describeAction(e, (id) => names.get(id))}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Subject e={e} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPage={(page) => update({ page })} />
        </>
      ) : null}
    </div>
  );
}
