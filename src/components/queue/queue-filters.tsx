import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { SelectField } from "@/components/ui/select-field";
import { SORT_LABEL, SORT_ORDER, type QueueFilters, type QueueSort } from "@/lib/queue";
import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  STATUS_LABEL,
  STATUS_ORDER,
  TYPE_LABEL,
  TYPE_ORDER,
} from "@/lib/tickets";
import type { Priority, StaffUser, TicketStatus, TicketType } from "@/lib/types";

type QueueFiltersProps = {
  filters: QueueFilters;
  search: string;
  onSearch: (value: string) => void;
  onChange: (patch: Partial<QueueFilters>) => void;
  onClear: () => void;
  hasActive: boolean;
  agents: StaffUser[];
  meId: string;
  /** "Me" only makes sense for agents: admins cannot be assignees. */
  showMe: boolean;
};

export function QueueFilterBar({
  filters,
  search,
  onSearch,
  onChange,
  onClear,
  hasActive,
  agents,
  meId,
  showMe,
}: QueueFiltersProps) {
  const otherAgents = agents.filter((a) => a.userId !== meId);

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <SearchInput label="Search" value={search} onChange={onSearch} placeholder="Title or description" />
        <SelectField
          label="Sort by"
          name="sort"
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as QueueSort })}
        >
          {SORT_ORDER.map((s) => (
            <option key={s} value={s}>
              {SORT_LABEL[s]}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Status"
          name="status"
          value={filters.status ?? ""}
          onChange={(e) => onChange({ status: (e.target.value || undefined) as TicketStatus | undefined })}
        >
          <option value="">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Type"
          name="type"
          value={filters.type ?? ""}
          onChange={(e) => onChange({ type: (e.target.value || undefined) as TicketType | undefined })}
        >
          <option value="">All types</option>
          {TYPE_ORDER.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Priority"
          name="priority"
          value={filters.priority ?? ""}
          onChange={(e) => onChange({ priority: (e.target.value || undefined) as Priority | undefined })}
        >
          <option value="">All priorities</option>
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Assignee"
          name="assignee"
          value={filters.assignee}
          onChange={(e) => onChange({ assignee: e.target.value })}
        >
          <option value="any">Anyone</option>
          {showMe ? <option value="me">Me</option> : null}
          <option value="unassigned">Unassigned</option>
          {otherAgents.length > 0 ? (
            <optgroup label="Agents">
              {otherAgents.map((a) => (
                <option key={a.userId} value={a.userId}>
                  {a.name}
                </option>
              ))}
            </optgroup>
          ) : null}
        </SelectField>
      </div>

      {hasActive ? (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClear}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}