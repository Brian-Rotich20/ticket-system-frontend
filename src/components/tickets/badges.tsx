import { PRIORITY_LABEL, STATUS_LABEL, TYPE_LABEL } from '@/lib/tickets';
import type { Priority, TicketStatus, TicketType } from '@/lib/types';
import { cx } from '@/lib/utils';

const STATUS_STYLE: Record<TicketStatus, string> = {
  OPEN: 'bg-sky-100 text-sky-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-200 text-slate-600',
};

const PRIORITY_STYLE: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

function Pill({ className, children }: { className: string; children: string }) {
  return <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>{children}</span>;
}

export const StatusBadge = ({ status }: { status: TicketStatus }) => <Pill className={STATUS_STYLE[status]}>{STATUS_LABEL[status]}</Pill>;

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <Pill className={PRIORITY_STYLE[priority]}>{PRIORITY_LABEL[priority]}</Pill>
);

export const TypeBadge = ({ type }: { type: TicketType }) => <Pill className="bg-violet-100 text-violet-700">{TYPE_LABEL[type]}</Pill>;