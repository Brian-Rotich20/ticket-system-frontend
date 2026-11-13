'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Alert, Button, Card, Field, SelectField, TextAreaField } from '@/components/ui';
import { errorMessage } from '@/lib/api';
import { PRIORITY_LABEL, PRIORITY_ORDER, TYPE_HINT, TYPE_LABEL, TYPE_ORDER, createTicket } from '@/lib/tickets';
import type { Priority, TicketType } from '@/lib/types';

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 10_000;

export function NewTicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TicketType>('INQUIRY');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const errors = {
    title: !title.trim() ? 'Give your ticket a short title.' : title.trim().length > TITLE_MAX ? `Keep the title under ${TITLE_MAX} characters.` : undefined,
    description: !description.trim()
      ? 'Describe what you need help with.'
      : description.trim().length > DESCRIPTION_MAX
        ? `Keep the description under ${DESCRIPTION_MAX} characters.`
        : undefined,
  };
  const show = (field: keyof typeof errors) => (submitted ? errors[field] : undefined);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError(null);
    if (errors.title || errors.description) return;

    setBusy(true);
    try {
      const ticket = await createTicket({ title: title.trim(), description: description.trim(), type, priority });
      router.push(`/tickets/${ticket.ticketId}`); // busy stays on while navigating
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/tickets" className="text-sm text-slate-500 hover:text-slate-700">
          ← My tickets
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">New ticket</h1>
      </div>

      <Card>
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {error && <Alert>{error}</Alert>}

          <Field
            label="Title"
            name="title"
            required
            maxLength={TITLE_MAX}
            placeholder="e.g. Where is my order #1042?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={show('title')}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Type" name="type" value={type} onChange={(e) => setType(e.target.value as TicketType)} hint={TYPE_HINT[type]}>
              {TYPE_ORDER.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Priority"
              name="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              hint="How urgent is this for you?"
            >
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </SelectField>
          </div>

          <TextAreaField
            label="Description"
            name="description"
            required
            rows={7}
            maxLength={DESCRIPTION_MAX}
            placeholder="Include order numbers, dates and anything we should know."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={show('description')}
          />

          <div className="flex justify-end gap-3">
            <Link
              href="/tickets"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <Button type="submit" loading={busy}>
              Create ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}