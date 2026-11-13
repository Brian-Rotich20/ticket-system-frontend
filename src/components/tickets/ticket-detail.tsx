'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Alert, Button, Card, LinkButton, Skeleton } from '@/components/ui';
import { ApiError, errorMessage } from '@/lib/api';
import { getTicket } from '@/lib/tickets';
import { useQuery } from '@/lib/use-query';
import { formatDate } from '@/lib/utils';
import { PriorityBadge, StatusBadge, TypeBadge } from './badges';
import { StatusProgress } from './status-progress';

export function TicketDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const valid = Number.isInteger(id) && id > 0;

  const { data: ticket, error, loading, refetch } = useQuery((signal) => getTicket(id, signal), [id], valid);

  // a ticket that does not exist and one that belongs to someone else look the same (backend returns 404)
  if (!valid || (error instanceof ApiError && error.status === 404)) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h1 className="text-lg font-semibold">Ticket not found</h1>
        <p className="mt-2 text-sm text-slate-600">It may have been removed, or it is not one of your tickets.</p>
        <div className="mt-4 flex justify-center">
          <LinkButton href="/tickets" variant="secondary">
            Back to my tickets
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/tickets" className="text-sm text-slate-500 hover:text-slate-700">
        ← My tickets
      </Link>

      {error && !ticket ? (
        <Alert>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{errorMessage(error)}</span>
            <Button variant="secondary" onClick={refetch}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      {loading && !ticket ? (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : null}

      {ticket ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Ticket #{ticket.ticketId}</p>
              <h1 className="mt-1 text-2xl font-semibold break-words">{ticket.title}</h1>
            </div>
            <Button variant="secondary" onClick={refetch} loading={loading}>
              Refresh
            </Button>
          </div>

          <Card className="space-y-4">
            <StatusProgress status={ticket.status} />
            <p className="text-sm text-slate-600">
              {ticket.status === 'CLOSED'
                ? 'This ticket is closed.'
                : ticket.status === 'RESOLVED'
                  ? 'An agent marked this ticket as resolved.'
                  : ticket.assigneeId
                    ? 'An agent is working on your ticket.'
                    : 'Waiting for an agent to pick this up.'}
            </p>
          </Card>

          <Card className="space-y-6">
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="mb-1 text-slate-500">Status</dt>
                <dd>
                  <StatusBadge status={ticket.status} />
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-slate-500">Priority</dt>
                <dd>
                  <PriorityBadge priority={ticket.priority} />
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-slate-500">Type</dt>
                <dd>
                  <TypeBadge type={ticket.type} />
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="font-medium">{formatDate(ticket.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Last updated</dt>
                <dd className="font-medium">{formatDate(ticket.updatedAt)}</dd>
              </div>
            </dl>

            <div>
              <h2 className="text-sm font-medium text-slate-500">Description</h2>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">{ticket.description}</p>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}