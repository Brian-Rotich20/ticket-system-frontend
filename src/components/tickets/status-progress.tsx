import { cx } from '@/lib/utils';
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/tickets';
import type { TicketStatus } from '@/lib/types';

/** Shows where the ticket is in Open > In progress > Resolved > Closed. */
export function StatusProgress({ status }: { status: TicketStatus }) {
  const current = STATUS_ORDER.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Ticket progress">
      {STATUS_ORDER.map((s, i) => (
        <li key={s} aria-current={i === current ? 'step' : undefined}>
          <div className={cx('h-1.5 rounded-full', i <= current ? 'bg-indigo-600' : 'bg-slate-200')} />
          <div className={cx('mt-2 text-xs', i === current ? 'font-semibold text-slate-900' : 'text-slate-500')}>{STATUS_LABEL[s]}</div>
        </li>
      ))}
    </ol>
  );
}