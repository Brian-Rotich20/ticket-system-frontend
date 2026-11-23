'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { TextAreaField } from '@/components/ui/textarea-field';
import { useUser } from '@/context/auth-context';
import { useOrganization } from '@/context/organization-context';
import { LIMITS } from '@/lib/constants/tickets';
import type { Ticket } from '@/types/api';
import type { TicketPatch } from '../api';
import { canWork } from '../permissions';
import { useTicketMutation } from '../use-ticket-mutation';
import { MutationErrorAlert } from './mutation-error';

/** Description, with in-place editing of subject, description and order reference. */
export function DetailsCard({ ticket, onUpdated, onReload }: { ticket: Ticket; onUpdated: (t: Ticket) => void; onReload: () => void }) {
  const user = useUser();
  const { role } = useOrganization();
  const editable = canWork({ id: user.id, role }, ticket);
  const [editing, setEditing] = useState(false);
  const { apply, busy, error, clearError } = useTicketMutation(ticket, (t) => {
    setEditing(false);
    onUpdated(t);
  });
  const [draft, setDraft] = useState({ title: ticket.title, description: ticket.description, orderRef: ticket.orderRef ?? '' });

  function submit(e: FormEvent) {
    e.preventDefault();
    const patch: TicketPatch = {};
    if (draft.title.trim() !== ticket.title) patch.title = draft.title.trim();
    if (draft.description.trim() !== ticket.description) patch.description = draft.description.trim();
    if ((draft.orderRef.trim() || null) !== ticket.orderRef) patch.orderRef = draft.orderRef.trim() || null;
    if (Object.keys(patch).length === 0) return setEditing(false);
    void apply(patch);
  }

  if (editing) {
    return (
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <h2 className="text-base font-semibold">Edit details</h2>
          <MutationErrorAlert error={error} onReload={() => {
              clearError();
              onReload();
            }}
          />
          <Field label="Subject" name="title" required maxLength={LIMITS.title} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          <Field label="Order reference" name="orderRef" maxLength={LIMITS.orderRef} placeholder="Optional" value={draft.orderRef} onChange={(e) => setDraft((d) => ({ ...d, orderRef: e.target.value }))} />
          <TextAreaField label="Description" name="description" required rows={6} maxLength={LIMITS.description} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Save details
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-medium text-muted">Description</h2>
        {editable ? (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        ) : null}
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{ticket.description}</p>
      {ticket.orderRef ? (
        <p className="mt-4 text-sm">
          <span className="text-muted">Order reference:</span> <span className="font-medium">{ticket.orderRef}</span>
        </p>
      ) : null}
    </Card>
  );
}
