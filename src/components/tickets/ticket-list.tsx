'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Button, LinkButton, Skeleton, cx } from '@/components/ui/alert';
import {  Button, LinkButton, Skeleton, cx } from '@/components/ui/button';
import { Alert, Button, LinkButton, Skeleton, cx } from '@/components/ui/';
import { Alert, Button, LinkButton, Skeleton, cx } from '@/components/ui';

import { errorMessage } from '@/lib/api';
import { STATUS_LABEL, STATUS_ORDER, TYPE_LABEL, isTicketStatus, listTickets } from '@/lib/tickets';
import type { TicketStatus } from '@/lib/types';
import { useQuery } from '@/lib/use-query';
import { formatDate } from '@/lib/utils';
import { PriorityBadge, StatusBadge } from './badges';

const PAGE_SIZE = 10;
const FILTERS: (TicketStatus | undefined)[] = [undefined, ...STATUS_ORDER];

export function TicketList() {
  const router = useRouter();
  const params = useSearchParams();

  const statusParam = params.get('status');
  const status = isTicketStatus(statusParam) ? statusParam : undefined;
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);

  const { data, error, loading, refetch } = useQuery(
    (signal) => listTickets({ status, page, pageSize: PAGE_SIZE }, signal),
    [status, page],
  );

  function navigate(nextStatus: TicketStatus | undefined, nextPage: number) {
    const qs = new URLSearchParams();
    if (nextStatus) qs.set('status', nextStatus);
    if (nextPage > 1) qs.set('page', String(nextPage));
    const query = qs.toString();
    router.replace(query ? `/tickets?${query}` : '/tickets', { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">My tickets</h1>
        <LinkButton href="/tickets/new">New ticket</LinkButton>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((s) => {
          const active = s === status;
          return (
            <button
              key={s ?? 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => navigate(s, 1)}
              className={cx(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50',
              )}
            >
              {s ? STATUS_LABEL[s] : 'All'}
            </button>
          );
        })}
      </div>

      {error ? (
        <Alert>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{errorMessage(error)}</span>
            <Button variant="secondary" onClick={refetch}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      {loading && !data ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[72px] w-full" />
          ))}
        </div>
      ) : null}

      {data && data.items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="font-medium text-slate-900">
            {status ? `No ${STATUS_LABEL[status].toLowerCase()} tickets` : page > 1 ? 'No tickets on this page' : 'No tickets yet'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {status || page > 1 ? 'Try a different filter.' : 'Create a ticket when you need help and it will show up here.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {status || page > 1 ? (
              <Button variant="secondary" onClick={() => navigate(undefined, 1)}>
                Show all tickets
              </Button>
            ) : (
              <LinkButton href="/tickets/new">Create a ticket</LinkButton>
            )}
          </div>
        </div>
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <ul
            className={cx(
              'divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-opacity',
              loading && 'opacity-60',
            )}
          >
            {data.items.map((t) => (
              <li key={t.ticketId}>
                <Link href={`/tickets/${t.ticketId}`} className="block px-5 py-4 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{t.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        #{t.ticketId} · {TYPE_LABEL[t.type]} · {formatDate(t.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <span>
              {data.total} {data.total === 1 ? 'ticket' : 'tickets'}
              {data.totalPages > 1 ? ` · Page ${data.page} of ${data.totalPages}` : ''}
            </span>
            {data.totalPages > 1 ? (
              <div className="flex gap-2">
                <Button variant="secondary" disabled={page <= 1} onClick={() => navigate(status, page - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" disabled={page >= data.totalPages} onClick={() => navigate(status, page + 1)}>
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}