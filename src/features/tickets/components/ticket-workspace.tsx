'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ErrorState, NotFoundCard } from '@/components/shared/states';
import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrganization } from '@/context/organization-context';
import { AttachmentPanel } from '@/features/attachments/components/attachment-panel';
import { CommentThread } from '@/features/comments/components/comment-thread';
import { listAssignableMembers } from '@/features/team/api';
import { TrackingLinkPanel } from '@/features/tracking/components/tracking-link-panel';
import { useQuery } from '@/hooks/use-query';
import { isApiError } from '@/lib/api/client';
import { CHANNEL_LABEL } from '@/lib/constants/tickets';
import { formatDate } from '@/lib/utils';
import { getTicket } from '../api';
import { ChannelBadge, PriorityBadge, StatusBadge, TypeBadge, ticketRef } from './badges';
import { DetailsCard } from './details-card';
import { ManagePanel } from './manage-panel';

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}

export function TicketWorkspace({ id }: { id: number }) {
  const { role } = useOrganization();
  const valid = Number.isInteger(id) && id > 0;
  const [reloadKey, setReloadKey] = useState(0);
  const { data: ticket, error, loading, refetch, setData } = useQuery((signal) => getTicket(id, signal), [id], valid);
  const members = useQuery((signal) => listAssignableMembers(signal), []);

  function reload() {
    refetch();
    setReloadKey((k) => k + 1); // remounts the conversation, files and tracking panels
  }

  if (!valid || isApiError(error, 404)) {
    return <NotFoundCard title="Ticket not found" description="It may have been removed, or it belongs to another organization." backHref="/app/tickets" backLabel="Back to tickets" />;
  }

  return (
    <div className="space-y-6">
      <Link href="/app/tickets" className="text-sm text-muted hover:text-ink">
        ← Tickets
      </Link>

      {error && !ticket ? <ErrorState error={error} onRetry={refetch} /> : null}
      {loading && !ticket ? (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : null}

      {ticket ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-muted">
                Ticket {ticketRef(ticket.ticketNumber)} · {ticket.contactName} · via {CHANNEL_LABEL[ticket.channel]}
              </p>
              <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight">{ticket.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <TypeBadge type={ticket.type} />
                <ChannelBadge channel={ticket.channel} />
              </div>
            </div>
            <div className="flex gap-2">
              {role === 'ADMIN' ? (
                <LinkButton href={`/app/audit-logs?entityType=TICKET&entityId=${ticket.ticketId}`} variant="outline">
                  History
                </LinkButton>
              ) : null}
              <Button variant="outline" onClick={reload} loading={loading}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="order-2 min-w-0 space-y-6 lg:order-1">
              <DetailsCard key={`d${ticket.version}`} ticket={ticket} onUpdated={(t) => setData(() => t)} onReload={reload} />
              <CommentThread key={`c${reloadKey}`} ticketId={ticket.ticketId} closed={ticket.status === 'CLOSED'} />
              <AttachmentPanel key={`a${reloadKey}`} ticketId={ticket.ticketId} closed={ticket.status === 'CLOSED'} />
            </div>

            <aside className="order-1 space-y-6 lg:order-2">
              {/* remounts on every new version, so drafts always start from the saved ticket */}
              <ManagePanel key={`m${ticket.version}`} ticket={ticket} members={members.data ?? []} onUpdated={(t) => setData(() => t)} onReload={reload} />
              <Card>
                <h2 className="text-base font-semibold">Customer</h2>
                <dl className="mt-3 space-y-3 text-sm">
                  <Meta label="Name">
                    <Link href={`/app/contacts/${ticket.contactId}`} className="text-primary hover:underline">
                      {ticket.contactName}
                    </Link>
                  </Meta>
                  {ticket.contactPhone ? <Meta label="Phone">{ticket.contactPhone}</Meta> : null}
                  {ticket.contactEmail ? <Meta label="Email">{ticket.contactEmail}</Meta> : null}
                </dl>
              </Card>
              <TrackingLinkPanel key={`t${reloadKey}`} ticketId={ticket.ticketId} />
              <Card>
                <dl className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-1">
                  <Meta label="Recorded by">{ticket.createdByName}</Meta>
                  <Meta label="Created">{formatDate(ticket.createdAt)}</Meta>
                  <Meta label="Last updated">{formatDate(ticket.updatedAt)}</Meta>
                  {ticket.resolvedAt ? <Meta label="Resolved">{formatDate(ticket.resolvedAt)}</Meta> : null}
                  {ticket.closedAt ? <Meta label="Closed">{formatDate(ticket.closedAt)}</Meta> : null}
                </dl>
              </Card>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
