import Link from 'next/link';
import { CHANNEL_LABEL } from '@/lib/constants/tickets';
import { cx, timeAgo } from '@/lib/utils';
import type { Ticket } from '@/types/api';
import { PriorityBadge, StatusBadge, ticketRef } from './badges';

const HEADERS = ['Ticket', 'Customer', 'Channel', 'Priority', 'Status', 'Assignee', 'Updated'];

function Assignee({ t }: { t: Ticket }) {
  return t.assigneeName ? <span className="text-ink">{t.assigneeName}</span> : <span className="font-medium text-warning">Unassigned</span>;
}

/** A table on wide screens, cards on phones. */
export function TicketList({ items, loading }: { items: Ticket[]; loading: boolean }) {
  return (
    <div className={cx('transition-opacity', loading && 'opacity-60')}>
      <div className="hidden overflow-x-auto rounded-card border border-line bg-surface md:block">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <caption className="sr-only">Tickets</caption>
          <thead className="bg-canvas text-xs font-medium uppercase tracking-wide text-muted">
            <tr>
              {HEADERS.map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((t) => (
              <tr key={t.ticketId} className="hover:bg-hover">
                <td className="max-w-[20rem] px-4 py-3">
                  <Link href={`/app/tickets/${t.ticketId}`} className="block truncate font-medium text-ink hover:text-primary focus-visible:outline-2 focus-visible:outline-primary" title={t.title}>
                    {t.title}
                  </Link>
                  <span className="text-xs text-muted">
                    {ticketRef(t.ticketNumber)}
                    {t.orderRef ? ` · Order ${t.orderRef}` : ''}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="text-ink">{t.contactName}</span>
                  {t.contactPhone ? <span className="block text-xs text-muted">{t.contactPhone}</span> : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{CHANNEL_LABEL[t.channel]}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Assignee t={t} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{timeAgo(t.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {items.map((t) => (
          <li key={t.ticketId}>
            <Link href={`/app/tickets/${t.ticketId}`} className="block rounded-card border border-line bg-surface p-4 hover:border-line-strong focus-visible:outline-2 focus-visible:outline-primary">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-medium text-ink">{t.title}</p>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 text-xs text-muted">
                {ticketRef(t.ticketNumber)} · {t.contactName} · {CHANNEL_LABEL[t.channel]}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <PriorityBadge priority={t.priority} />
                <span>
                  <Assignee t={t} /> · <span className="text-muted">{timeAgo(t.updatedAt)}</span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
