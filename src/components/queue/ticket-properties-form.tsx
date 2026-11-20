"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { PRIORITY_LABEL, PRIORITY_ORDER, TYPE_LABEL, TYPE_ORDER, type TicketPatch } from "@/lib/tickets";
import type { Priority, StaffUser, TicketListItem, TicketType } from "@/lib/types";

type TicketPropertiesFormProps = {
  ticket: TicketListItem;
  agents: StaffUser[];
  /** May change priority and type. */
  editable: boolean;
  /** May change the assignee (admins). */
  assignable: boolean;
  busy: boolean;
  onSave: (patch: TicketPatch) => void;
};

export function TicketPropertiesForm({ ticket, agents, editable, assignable, busy, onSave }: TicketPropertiesFormProps) {
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [type, setType] = useState<TicketType>(ticket.type);
  const [assignee, setAssignee] = useState(ticket.assigneeId ?? "");

  const patch: TicketPatch = {};
  if (priority !== ticket.priority) patch.priority = priority;
  if (type !== ticket.type) patch.type = type;
  if (assignable && assignee !== (ticket.assigneeId ?? "")) patch.assigneeId = assignee || null;
  const dirty = Object.keys(patch).length > 0;

  const knownAssignee = ticket.assigneeId ? agents.some((a) => a.userId === ticket.assigneeId) : true;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (dirty) onSave(patch);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <SelectField
        label="Priority"
        name="priority"
        value={priority}
        disabled={!editable}
        onChange={(e) => setPriority(e.target.value as Priority)}
      >
        {PRIORITY_ORDER.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABEL[p]}
          </option>
        ))}
      </SelectField>

      <SelectField label="Type" name="type" value={type} disabled={!editable} onChange={(e) => setType(e.target.value as TicketType)}>
        {TYPE_ORDER.map((t) => (
          <option key={t} value={t}>
            {TYPE_LABEL[t]}
          </option>
        ))}
      </SelectField>

      {assignable ? (
        <SelectField
          label="Assignee"
          name="assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          hint={ticket.status === "IN_PROGRESS" ? "An in-progress ticket can be reassigned but not left unassigned." : undefined}
        >
          <option value="" disabled={ticket.status === "IN_PROGRESS"}>
            Unassigned
          </option>
          {!knownAssignee && ticket.assigneeId ? <option value={ticket.assigneeId}>{ticket.assigneeName ?? "Current assignee"}</option> : null}
          {agents.map((a) => (
            <option key={a.userId} value={a.userId}>
              {a.name}
            </option>
          ))}
        </SelectField>
      ) : (
        <div className="text-sm">
          <div className="text-slate-500">Assignee</div>
          <div className="mt-1 font-medium">{ticket.assigneeName ?? <span className="text-amber-700">Unassigned</span>}</div>
        </div>
      )}

      {editable || assignable ? (
        <Button type="submit" disabled={!dirty} loading={busy} className="w-full">
          Save changes
        </Button>
      ) : null}
    </form>
  );
}