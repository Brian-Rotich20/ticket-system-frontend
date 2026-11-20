"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AttachmentList } from "@/components/tickets/attachment-list";
import { PriorityBadge, StatusBadge, TypeBadge } from "@/components/tickets/badges";
import { CommentThread } from "@/components/tickets/comment-thread";
import { StatusProgress } from "@/components/tickets/status-progress";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/auth-context";
import { ApiError, errorMessage } from "@/lib/api";
import { listAgents } from "@/lib/queue";
import { getTicket } from "@/lib/tickets";
import { useQuery } from "@/lib/use-query";
import { formatDate } from "@/lib/utils";
import { ManagePanel } from "./manage-panel";

export function TicketWorkspace() {
  const user = useUser();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const valid = Number.isInteger(id) && id > 0;
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: ticket, error, loading, refetch, setData } = useQuery((signal) => getTicket(id, signal), [id], valid);
  // only admins assign, so only admins need the agent list
  const agents = useQuery((signal) => listAgents(signal), [], user.role === "ADMIN");

  function reload() {
    refetch();
    setRefreshKey((k) => k + 1);
  }

  if (!valid || (error instanceof ApiError && error.status === 404)) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h1 className="text-lg font-semibold">Ticket not found</h1>
        <p className="mt-2 text-sm text-slate-600">It may have been removed, or it belongs to another store.</p>
        <div className="mt-4 flex justify-center">
          <LinkButton href="/queue" variant="secondary">
            Back to the queue
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/queue" className="text-sm text-slate-500 hover:text-slate-700">
        ← Queue
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
          <Skeleton className="h-48 w-full" />
        </div>
      ) : null}

      {ticket ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-slate-500">
                Ticket #{ticket.ticketId} · from {ticket.requesterName}
              </p>
              <h1 className="mt-1 break-words text-2xl font-semibold">{ticket.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <TypeBadge type={ticket.type} />
              </div>
            </div>
            <div className="flex gap-2">
              {user.role === "ADMIN" ? (
                <LinkButton href={`/audit?entityType=TICKET&entityId=${ticket.ticketId}`} variant="secondary">
                  History
                </LinkButton>
              ) : null}
              <Button variant="secondary" onClick={reload} loading={loading}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="order-2 min-w-0 space-y-6 lg:order-1">
              <Card>
                <h2 className="text-sm font-medium text-slate-500">Description</h2>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{ticket.description}</p>
              </Card>
              <AttachmentList
                ticketId={ticket.ticketId}
                closed={ticket.status === "CLOSED"}
                refreshKey={refreshKey}
                viewer="staff"
                requesterId={ticket.requesterId}
              />
              <CommentThread ticketId={ticket.ticketId} closed={ticket.status === "CLOSED"} refreshKey={refreshKey} viewer="staff" />
            </div>

            <aside className="order-1 space-y-6 lg:order-2">
              <ManagePanel ticket={ticket} agents={agents.data ?? []} onUpdated={(t) => setData(() => t)} onReload={reload} />
              <Card className="space-y-4">
                <StatusProgress status={ticket.status} />
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Requester</dt>
                    <dd className="font-medium">{ticket.requesterName}</dd>
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
              </Card>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}