'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState, ErrorState, LoadingRows } from '@/components/shared/states';
import { Card, CardHeader } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/context/auth-context';
import { useOrganization } from '@/context/organization-context';
import { fetchAudit } from '@/features/audit/api';
import { describeAction } from '@/features/audit/describe';
import { StatusBadge, ticketRef } from '@/features/tickets/components/badges';
import { useQuery } from '@/hooks/use-query';
import { STATUS_LABEL, STATUSES } from '@/lib/constants/tickets';
import { cx, firstName, timeAgo } from '@/lib/utils';
import type { TicketStatus } from '@/types/api';
import { getOverview } from './api';

const STAT_ACCENT: Record<TicketStatus | 'total', string> = {
  total: 'bg-primary',
  OPEN: 'bg-info',
  IN_PROGRESS: 'bg-primary',
  WAITING_ON_CUSTOMER: 'bg-warning',
  RESOLVED: 'bg-secondary',
  CLOSED: 'bg-subtle',
};

function Stat({ label, value, href, accent }: { label: string; value: number | undefined; href: string; accent: string }) {
  return (
    <Link href={href} className="group rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-primary">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span aria-hidden className={cx('h-2 w-2 rounded-full', accent)} />
        {label}
      </div>
      {value === undefined ? <Skeleton className="mt-2 h-8 w-12" /> : <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">{value}</p>}
    </Link>
  );
}

/** Recent activity comes from the audit log, which only admins can read. */
function RecentActivity() {
  const activity = useQuery((signal) => fetchAudit({ page: 1, pageSize: 8 }, signal), []);
  return (
    <Card>
      <CardHeader title="Recent activity" action={<LinkButton href="/app/audit-logs" variant="ghost" size="sm">View all</LinkButton>} />
      {activity.error ? <ErrorState error={activity.error} onRetry={activity.refetch} /> : null}
      {activity.loading && !activity.data ? <LoadingRows rows={4} className="h-9" /> : null}
      {activity.data && activity.data.items.length === 0 ? <p className="text-sm text-muted">No activity yet.</p> : null}
      {activity.data && activity.data.items.length > 0 ? (
        <ol className="space-y-3">
          {activity.data.items.map((e) => (
            <li key={e.auditId} className="text-sm">
              <span className="font-medium text-ink">{e.actorName ?? (e.action === 'COMMENT_ADDED' ? 'Customer' : 'System')}</span>{' '}
              <span className="text-muted">{describeAction(e)}</span>
              <span className="block text-xs text-subtle">{timeAgo(e.createdAt)}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </Card>
  );
}

export function DashboardView() {
  const user = useUser();
  const { current, role } = useOrganization();
  const overview = useQuery((signal) => getOverview(signal), []);
  const d = overview.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={current.name}
        title={`Welcome back, ${firstName(user.name)}`}
        description="Here is what is happening with your customers' requests."
        actions={
          <LinkButton href="/app/tickets/new">
            <Icon name="plus" className="h-4 w-4" /> New ticket
          </LinkButton>
        }
      />

      {overview.error ? <ErrorState error={overview.error} onRetry={overview.refetch} /> : null}

      <section aria-label="Ticket totals" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label="All tickets" value={d?.totals.total} href="/app/tickets" accent={STAT_ACCENT.total} />
        {STATUSES.map((s) => (
          <Stat key={s} label={STATUS_LABEL[s]} value={d?.totals[s]} href={`/app/tickets?status=${s}`} accent={STAT_ACCENT[s]} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader title="Recent tickets" action={<LinkButton href="/app/tickets" variant="ghost" size="sm">Open queue</LinkButton>} />
          {overview.loading && !d ? <LoadingRows rows={5} /> : null}
          {d && d.recentTickets.length === 0 ? (
            <EmptyState title="No tickets yet" description="Record your first customer issue: a WhatsApp message, a call or a walk-in." action={<LinkButton href="/app/tickets/new">Record a ticket</LinkButton>} />
          ) : null}
          {d && d.recentTickets.length > 0 ? (
            <ul className="-mx-5 divide-y divide-line sm:-mx-6">
              {d.recentTickets.map((t) => (
                <li key={t.ticketId}>
                  <Link href={`/app/tickets/${t.ticketId}`} className="flex items-center gap-3 px-5 py-3 hover:bg-hover sm:px-6">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                      <p className="truncate text-xs text-muted">
                        {ticketRef(t.ticketNumber)} · {t.contactName} · {timeAgo(t.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Open work" description="Tickets not yet resolved" />
            {!d ? (
              <LoadingRows rows={3} className="h-8" />
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Assigned to you</dt>
                  <dd>
                    <Link href="/app/tickets?assignee=me" className="font-semibold text-primary hover:underline">
                      {d.assigned.mine}
                    </Link>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Unassigned</dt>
                  <dd>
                    <Link href="/app/tickets?assignee=unassigned" className={cx('font-semibold hover:underline', d.assigned.unassigned > 0 ? 'text-warning' : 'text-primary')}>
                      {d.assigned.unassigned}
                    </Link>
                  </dd>
                </div>
                {d.assigned.byAssignee.length > 0 ? <hr className="border-line" /> : null}
                {d.assigned.byAssignee.map((a) => (
                  <div key={a.userId} className="flex items-center justify-between">
                    <dt className="truncate text-ink">{a.name}</dt>
                    <dd className="font-medium text-ink">{a.open}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>
          {role === 'ADMIN' ? <RecentActivity /> : null}
        </div>
      </div>
    </div>
  );
}
