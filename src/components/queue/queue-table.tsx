import Link from "next/link";
import { PriorityBadge, StatusBadge, TypeBadge } from "@/components/tickets/badges";
import type { TicketListItem } from "@/lib/types";
import { cx, formatDate } from "@/lib/utils";

type QueueTableProps = {
  items: TicketListItem[];
  loading: boolean;
};

const HEADERS = ["Ticket", "Requester", "Type", "Priority", "Status", "Assignee", "Updated"];

export function QueueTable({ items, loading }: QueueTableProps) {
  return (
    <div
      className={cx(
        "overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-opacity",
        loading && "opacity-60"
      )}
    >
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <caption className="sr-only">Support tickets</caption>
        <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            {HEADERS.map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((t) => (
            <tr key={t.ticketId} className="hover:bg-slate-50">
              <td className="max-w-[18rem] px-4 py-3">
                <Link
                  href={`/queue/${t.ticketId}`}
                  className="block truncate font-medium text-slate-900 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
                  title={t.title}
                >
                  {t.title}
                </Link>
                <span className="text-xs text-slate-500">#{t.ticketId}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{t.requesterName}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <TypeBadge type={t.type} />
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <PriorityBadge priority={t.priority} />
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge status={t.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                {t.assigneeName ? (
                  <span className="text-slate-700">{t.assigneeName}</span>
                ) : (
                  <span className="font-medium text-amber-700">Unassigned</span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(t.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}