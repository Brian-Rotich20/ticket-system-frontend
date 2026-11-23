'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState, ErrorState, LoadingRows, NotFoundCard } from '@/components/shared/states';
import { Avatar } from '@/components/ui/avatar';
import { LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { TicketList } from '@/features/tickets/components/ticket-list';
import { useQuery } from '@/hooks/use-query';
import { isApiError } from '@/lib/api/client';
import { formatDay } from '@/lib/utils';
import { getContact, getContactTickets } from '../api';

export function ContactDetail({ id }: { id: number }) {
  const valid = Number.isInteger(id) && id > 0;
  const [page, setPage] = useState(1);
  const contact = useQuery((signal) => getContact(id, signal), [id], valid);
  const tickets = useQuery((signal) => getContactTickets(id, page, signal), [id, page], valid && Boolean(contact.data));

  if (!valid || isApiError(contact.error, 404)) {
    return <NotFoundCard title="Contact not found" description="It may belong to another organization." backHref="/app/contacts" backLabel="Back to contacts" />;
  }
  const c = contact.data;

  return (
    <div className="space-y-6">
      <Link href="/app/contacts" className="text-sm text-muted hover:text-ink">
        ← Contacts
      </Link>
      {contact.error ? <ErrorState error={contact.error} onRetry={contact.refetch} /> : null}
      {!c && contact.loading ? <LoadingRows rows={2} className="h-16" /> : null}

      {c ? (
        <>
          <PageHeader
            title={
              <span className="flex items-center gap-3">
                <Avatar name={c.name} tone="primary" /> {c.name}
              </span>
            }
            actions={
              <LinkButton href={`/app/tickets/new?contactId=${c.contactId}`}>
                <Icon name="plus" className="h-4 w-4" /> New ticket for {c.name.split(' ')[0]}
              </LinkButton>
            }
          />
          <Card>
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">Phone</dt>
                <dd className="font-medium">{c.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="font-medium break-all">{c.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted">Contact since</dt>
                <dd className="font-medium">{formatDay(c.createdAt)}</dd>
              </div>
            </dl>
          </Card>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">Ticket history</h2>
            {tickets.error ? <ErrorState error={tickets.error} onRetry={tickets.refetch} /> : null}
            {tickets.loading && !tickets.data ? <LoadingRows rows={3} /> : null}
            {tickets.data && tickets.data.items.length === 0 ? <EmptyState title="No tickets for this contact yet" /> : null}
            {tickets.data && tickets.data.items.length > 0 ? (
              <>
                <TicketList items={tickets.data.items} loading={tickets.loading} />
                <Pagination page={tickets.data.page} totalPages={tickets.data.totalPages} onPage={setPage} />
              </>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
