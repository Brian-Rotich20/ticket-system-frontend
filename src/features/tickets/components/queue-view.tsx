'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState, ErrorState, LoadingRows } from '@/components/shared/states';
import { Button, LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { useUser } from '@/context/auth-context';
import { listAssignableMembers } from '@/features/team/api';
import { useQuery } from '@/hooks/use-query';
import { plural } from '@/lib/utils';
import { listTickets } from '../api';
import { hasActiveFilters, parseQueueParams, toApiParams, toSearchParams, type QueueFilters } from '../queue-params';
import { QueueFilterBar } from './queue-filters';
import { TicketList } from './ticket-list';

export function QueueView() {
  const user = useUser();
  const router = useRouter();
  const params = useSearchParams();

  const filters = useMemo(() => parseQueueParams(new URLSearchParams(params.toString())), [params]);
  const key = toSearchParams(filters).toString();
  const active = hasActiveFilters(filters);

  // the search box follows the URL (back / forward), but typing is not overwritten mid-word
  const [searchState, setSearchState] = useState({ query: filters.q, value: filters.q });
  if (searchState.query !== filters.q) {
    setSearchState({ query: filters.q, value: searchState.value.trim() === filters.q ? searchState.value : filters.q });
  }
  const search = searchState.value;

  const tickets = useQuery((signal) => listTickets(toApiParams(filters, user.id), signal), [key, user.id]);
  const members = useQuery((signal) => listAssignableMembers(signal), []);

  function update(patch: Partial<QueueFilters>) {
    const next = { ...filters, ...patch, page: patch.page ?? 1 }; // any filter change returns to page 1
    const qs = toSearchParams(next).toString();
    router.replace(qs ? `/app/tickets?${qs}` : '/app/tickets', { scroll: false });
  }

  // typing updates the URL after a short pause
  useEffect(() => {
    if (search.trim() === filters.q) return;
    const timer = setTimeout(() => update({ q: search.trim() }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function clearFilters() {
    setSearchState({ query: filters.q, value: '' });
    router.replace('/app/tickets', { scroll: false });
  }

  const data = tickets.data;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description={<span aria-live="polite">{data ? plural(data.total, 'ticket') : 'Loading tickets'}</span>}
        actions={
          <>
            <Button variant="outline" onClick={tickets.refetch} loading={tickets.loading && Boolean(data)}>
              Refresh
            </Button>
            <LinkButton href="/app/tickets/new">
              <Icon name="plus" className="h-4 w-4" /> New ticket
            </LinkButton>
          </>
        }
      />

      <QueueFilterBar
        filters={filters}
        search={search}
        onSearch={(value) => setSearchState({ query: filters.q, value })}
        onChange={update}
        onClear={clearFilters}
        hasActive={active}
        members={members.data ?? []}
        meId={user.id}
      />

      {tickets.error ? <ErrorState error={tickets.error} onRetry={tickets.refetch} /> : null}
      {tickets.loading && !data ? <LoadingRows rows={6} /> : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          title={active ? 'No tickets match your filters' : filters.page > 1 ? 'No tickets on this page' : 'No tickets yet'}
          description={active ? 'Try a different search or clear the filters.' : 'Record a customer issue and it will show up here.'}
          action={
            active || filters.page > 1 ? (
              <Button variant="outline" onClick={clearFilters}>
                {active ? 'Clear filters' : 'Back to the first page'}
              </Button>
            ) : (
              <LinkButton href="/app/tickets/new">Record a ticket</LinkButton>
            )
          }
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <TicketList items={data.items} loading={tickets.loading} />
          <Pagination page={data.page} totalPages={data.totalPages} onPage={(page) => update({ page })} />
        </>
      ) : null}
    </div>
  );
}
