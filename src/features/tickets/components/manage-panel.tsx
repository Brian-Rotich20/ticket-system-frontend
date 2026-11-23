'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SelectField } from '@/components/ui/select-field';
import { useUser } from '@/context/auth-context';
import { useOrganization } from '@/context/organization-context';
import { CHANNEL_LABEL, CHANNELS, NEEDS_ASSIGNEE, PRIORITIES, PRIORITY_LABEL, STATUS_LABEL, TYPE_LABEL, TYPES, transitionLabel } from '@/lib/constants/tickets';
import { ROLE_LABEL } from '@/lib/constants/roles';
import type { Channel, Member, Priority, Ticket, TicketStatus, TicketType } from '@/types/api';
import type { TicketPatch } from '../api';
import { assigneeHint, canAssign, canWork, nextStatuses } from '../permissions';
import { useTicketMutation } from '../use-ticket-mutation';
import { MutationErrorAlert } from './mutation-error';

type Props = { ticket: Ticket; members: Member[]; onUpdated: (t: Ticket) => void; onReload: () => void };

/** Status (any allowed transition, incl. waiting and reopen) and triage fields. */
export function ManagePanel({ ticket, members, onUpdated, onReload }: Props) {
  const user = useUser();
  const { role } = useOrganization();
  const actor = { id: user.id, role };
  const { apply, busy, error, clearError } = useTicketMutation(ticket, onUpdated);

  const working = canWork(actor, ticket);
  const assigning = canAssign(actor, ticket);
  const options = nextStatuses(ticket.status);
  const [nextStatus, setNextStatus] = useState<TicketStatus | ''>('');
  const hint = nextStatus ? assigneeHint(actor, ticket, nextStatus) : null;

  // triage draft (the panel remounts on every new version, so drafts start from the saved ticket)
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [type, setType] = useState<TicketType>(ticket.type);
  const [channel, setChannel] = useState<Channel>(ticket.channel);
  const [assignee, setAssignee] = useState(ticket.assigneeId ?? '');

  const patch: TicketPatch = {};
  if (priority !== ticket.priority) patch.priority = priority;
  if (type !== ticket.type) patch.type = type;
  if (channel !== ticket.channel) patch.channel = channel;
  if (assigning && assignee !== (ticket.assigneeId ?? '')) patch.assigneeId = assignee || null;
  const dirty = Object.keys(patch).length > 0;

  const knownAssignee = !ticket.assigneeId || members.some((m) => m.userId === ticket.assigneeId);
  const mustStayAssigned = NEEDS_ASSIGNEE.includes(ticket.status);

  function save(e: FormEvent) {
    e.preventDefault();
    if (dirty) void apply(patch);
  }

  if (ticket.status === 'CLOSED') {
    return (
      <Card>
        <h2 className="text-base font-semibold">Manage</h2>
        <p className="mt-2 text-sm text-muted">This ticket is closed and can no longer be changed.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <h2 className="text-base font-semibold">Manage</h2>
      <MutationErrorAlert
        error={error}
        onReload={() => {
          clearError();
          onReload();
        }}
      />

      {/* status */}
      {working ? (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (nextStatus) void apply({ status: nextStatus }).then((ok) => ok && setNextStatus(''));
          }}
        >
          <SelectField label="Change status" name="status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value as TicketStatus | '')} hint={hint ?? `Currently ${STATUS_LABEL[ticket.status].toLowerCase()}.`}>
            <option value="">Choose a new status…</option>
            {options.map((s) => (
              <option key={s} value={s}>
                {transitionLabel(ticket.status, s)}
              </option>
            ))}
          </SelectField>
          <Button type="submit" className="w-full" disabled={!nextStatus} loading={busy && Boolean(nextStatus)}>
            {nextStatus === 'CLOSED' ? 'Close ticket' : 'Update status'}
          </Button>
          {nextStatus === 'CLOSED' ? <p className="text-xs text-muted">Closing is permanent: the customer can no longer reply.</p> : null}
        </form>
      ) : (
        <p className="text-sm text-muted">Only {ticket.assigneeName ?? 'the assigned agent'} or an admin can update this ticket.</p>
      )}

      <hr className="border-line" />

      {/* triage */}
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <SelectField label="Priority" name="priority" value={priority} disabled={!working} onChange={(e) => setPriority(e.target.value as Priority)}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </SelectField>
          <SelectField label="Type" name="type" value={type} disabled={!working} onChange={(e) => setType(e.target.value as TicketType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </SelectField>
          <SelectField label="Channel" name="channel" value={channel} disabled={!working} onChange={(e) => setChannel(e.target.value as Channel)}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {CHANNEL_LABEL[c]}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Assignee"
            name="assignee"
            value={assignee}
            disabled={!assigning}
            onChange={(e) => setAssignee(e.target.value)}
            hint={mustStayAssigned ? 'A ticket being worked on can be handed over but not left unassigned.' : undefined}
          >
            <option value="" disabled={mustStayAssigned}>
              Unassigned
            </option>
            {!knownAssignee && ticket.assigneeId ? <option value={ticket.assigneeId}>{ticket.assigneeName ?? 'Current assignee'}</option> : null}
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.userId === user.id ? `${m.name} (you)` : m.name} · {ROLE_LABEL[m.role]}
              </option>
            ))}
          </SelectField>
        </div>
        {working || assigning ? (
          <Button type="submit" variant="outline" disabled={!dirty} loading={busy && dirty} className="w-full">
            Save changes
          </Button>
        ) : null}
      </form>
    </Card>
  );
}
