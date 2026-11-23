import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { SelectField } from '@/components/ui/select-field';
import { CHANNEL_LABEL, CHANNELS, PRIORITIES, PRIORITY_LABEL, STATUS_LABEL, STATUSES, TYPE_LABEL, TYPES } from '@/lib/constants/tickets';
import type { Channel, Member, Priority, TicketStatus, TicketType } from '@/types/api';
import { SORT_LABEL, SORT_ORDER, type QueueFilters, type QueueSort } from '../queue-params';

type Props = {
  filters: QueueFilters;
  search: string;
  onSearch: (value: string) => void;
  onChange: (patch: Partial<QueueFilters>) => void;
  onClear: () => void;
  hasActive: boolean;
  members: Member[];
  meId: string;
};

export function QueueFilterBar({ filters, search, onSearch, onChange, onClear, hasActive, members, meId }: Props) {
  const others = members.filter((m) => m.userId !== meId);
  return (
    <div className="space-y-4 rounded-card border border-line bg-surface p-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <SearchInput label="Search" value={search} onChange={onSearch} placeholder="Subject, order ref, customer name or phone, #number" />
        <SelectField label="Sort by" name="sort" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as QueueSort })}>
          {SORT_ORDER.map((s) => (
            <option key={s} value={s}>
              {SORT_LABEL[s]}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SelectField label="Status" name="status" value={filters.status ?? ''} onChange={(e) => onChange({ status: (e.target.value || undefined) as TicketStatus | undefined })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Priority" name="priority" value={filters.priority ?? ''} onChange={(e) => onChange({ priority: (e.target.value || undefined) as Priority | undefined })}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Channel" name="channel" value={filters.channel ?? ''} onChange={(e) => onChange({ channel: (e.target.value || undefined) as Channel | undefined })}>
          <option value="">All channels</option>
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {CHANNEL_LABEL[c]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Type" name="type" value={filters.type ?? ''} onChange={(e) => onChange({ type: (e.target.value || undefined) as TicketType | undefined })}>
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </SelectField>
        <div className="col-span-2 lg:col-span-1">
        <SelectField label="Assignee" name="assignee" value={filters.assignee} onChange={(e) => onChange({ assignee: e.target.value })}>
          <option value="any">Anyone</option>
          <option value="me">Me</option>
          <option value="unassigned">Unassigned</option>
          {others.length > 0 ? (
            <optgroup label="Team">
              {others.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
            </optgroup>
          ) : null}
        </SelectField>
        </div>
      </div>

      {hasActive ? (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
