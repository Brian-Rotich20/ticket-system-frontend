import { cx, formatDate } from "@/lib/utils";
import type { TeamMember } from "@/lib/team";
import { RoleBadge } from "./role-badge";

type TeamTableProps = {
  items: TeamMember[];
  meId: string;
  loading: boolean;
};

export function TeamTable({ items, meId, loading }: TeamTableProps) {
  return (
    <div
      className={cx(
        "overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-opacity",
        loading && "opacity-60"
      )}
    >
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <caption className="sr-only">Members</caption>
        <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            {["Name", "Email", "Role", "Joined"].map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((m) => (
            <tr key={m.userId}>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                {m.name}
                {m.userId === meId ? <span className="ml-2 text-xs font-normal text-slate-500">(you)</span> : null}
              </td>
              <td className="px-4 py-3 text-slate-700">{m.email}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <RoleBadge role={m.role} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(m.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}