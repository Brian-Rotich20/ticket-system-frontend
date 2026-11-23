'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Alert } from '@/components/ui/alert';
import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { SelectField } from '@/components/ui/select-field';
import { TextAreaField } from '@/components/ui/textarea-field';
import { useUser } from '@/context/auth-context';
import { getContact } from '@/features/contacts/api';
import { ContactPicker } from '@/features/contacts/components/contact-picker';
import { listAssignableMembers } from '@/features/team/api';
import { useQuery } from '@/hooks/use-query';
import { errorMessage } from '@/lib/api/client';
import { CHANNEL_LABEL, CHANNELS, LIMITS, PRIORITIES, PRIORITY_LABEL, TYPE_LABEL, TYPES } from '@/lib/constants/tickets';
import type { Channel, Priority, TicketType } from '@/types/api';
import { createTicket } from '../api';
import { buildTicketRequest, emptyTicketForm, type NewTicketErrors, type NewTicketForm as Form } from '../new-ticket';

/** Staff record an issue a customer raised on any channel. */
export function NewTicketForm() {
  const router = useRouter();
  const user = useUser();
  const presetId = Number(useSearchParams().get('contactId')) || 0;
  const preset = useQuery((signal) => getContact(presetId, signal), [presetId], presetId > 0);
  const members = useQuery((signal) => listAssignableMembers(signal), []);

  const [form, setForm] = useState<Form>(emptyTicketForm);
  const [errors, setErrors] = useState<NewTicketErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [presetDismissed, setPresetDismissed] = useState(false);

  // a contact passed in the URL (from a contact page) is used until the agent picks another
  const contactValue = form.contact.mode === 'existing' && !form.contact.contact && preset.data && !presetDismissed ? { mode: 'existing' as const, contact: preset.data } : form.contact;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const built = buildTicketRequest({ ...form, contact: contactValue });
    if (built.errors) {
      setErrors(built.errors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const ticket = await createTicket(built.input);
      router.push(`/app/tickets/${ticket.ticketId}`); // busy stays on while navigating
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/app/tickets" className="text-sm text-muted hover:text-ink">
        ← Tickets
      </Link>
      <PageHeader title="New ticket" description="Record an issue a customer raised on WhatsApp, Instagram, TikTok, a call, email or in person." />

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {error && <Alert>{error}</Alert>}

        <Card>
          <ContactPicker
            value={contactValue}
            onChange={(contact) => {
              setPresetDismissed(true);
              setForm((f) => ({ ...f, contact }));
            }}
            errors={{ contact: errors.contact, name: errors.name, phone: errors.phone, email: errors.email }}
          />
        </Card>

        <Card className="space-y-5">
          <h2 className="text-sm font-semibold">Issue</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField label="Channel" name="channel" required value={form.channel} onChange={(e) => set('channel', e.target.value as Channel | '')} error={errors.channel}>
              <option value="">Where did they reach you?</option>
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABEL[c]}
                </option>
              ))}
            </SelectField>
            <SelectField label="Type" name="type" value={form.type} onChange={(e) => set('type', e.target.value as TicketType)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]}
                </option>
              ))}
            </SelectField>
            <SelectField label="Priority" name="priority" value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </SelectField>
          </div>
          <Field label="Subject" name="title" required maxLength={LIMITS.title} placeholder="e.g. Order #1042 not delivered" value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} />
          <TextAreaField
            label="Description"
            name="description"
            required
            rows={6}
            maxLength={LIMITS.description}
            placeholder="What happened, what the customer needs, anything already tried."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            error={errors.description}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Order reference (optional)" name="orderRef" maxLength={LIMITS.orderRef} placeholder="e.g. 1042 or M-Pesa code" value={form.orderRef} onChange={(e) => set('orderRef', e.target.value)} error={errors.orderRef} />
            <SelectField label="Assign to (optional)" name="assignee" value={form.assigneeId} onChange={(e) => set('assigneeId', e.target.value)}>
              <option value="">Leave unassigned</option>
              {(members.data ?? []).map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.userId === user.id ? `${m.name} (you)` : m.name}
                </option>
              ))}
            </SelectField>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <LinkButton href="/app/tickets" variant="ghost">
            Cancel
          </LinkButton>
          <Button type="submit" loading={busy}>
            Create ticket
          </Button>
        </div>
      </form>
    </div>
  );
}
