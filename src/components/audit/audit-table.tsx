import Link from "next/link";
import { RoleBadge } from "@/components/team/role-badge";
import { describeAction, type AuditEntry } from "@/lib/audit";
import { cx, formatDate } from "@/lib/utils";

type AuditTableProps = {
  items: AuditEntry[];
  loading: boolean;
};

export function AuditTable({ items, loading }: AuditTableProps) {
  return (
    <div
      className={cx(
        "overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-opacity",
        loading && "opacity-60"
      )}
    >
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <caption className="sr-only">Audit log</caption>
        <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            {["When", "Who", "What", "On"].map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((e) => (
            <tr key={e.auditId} className="align-top">
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(e.createdAt)}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <span className="font-medium text-slate-900">{e.actorName ?? "System"}</span>
                {e.actorRole ? (
                  <span className="ml-2">
                    <RoleBadge role={e.actorRole} />
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-slate-700">{describeAction(e)}</td>
              <td className="whitespace-nowrap px-4 py-3">
                {e.entityType === "TICKET" ? (
                  <Link href={`/queue/${e.entityId}`} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Ticket #{e.entityId}
                  </Link>
                ) : (
                  <span className="text-slate-500">User account</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}