'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { errorMessage } from '@/lib/api/client';
import { LIMITS } from '@/lib/constants/tickets';
import type { Contact } from '@/types/api';
import { createContact, existingContactFrom, isValidPhone, normalizePhone } from '../api';

/** New contact. A phone number that already exists points the agent to the existing contact instead. */
export function ContactForm({ onCreated, onCancel }: { onCreated: (c: Contact) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<{ contactId: number; name: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setExisting(null);
    if (!isValidPhone(phone)) return setPhoneError('Enter a phone number of 7 to 15 digits.');
    setPhoneError(undefined);
    setBusy(true);
    try {
      onCreated(await createContact({ name: name.trim(), phone: normalizePhone(phone), email: email.trim() || null }));
    } catch (err) {
      const found = existingContactFrom(err);
      if (found) setExisting(found);
      else setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="text-base font-semibold">New contact</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        {error && <Alert>{error}</Alert>}
        {existing ? (
          <Alert kind="info">
            This phone number already belongs to{' '}
            <Link href={`/app/contacts/${existing.contactId}`} className="font-semibold underline">
              {existing.name}
            </Link>
            . Use that contact instead of creating a duplicate.
          </Alert>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" name="name" required maxLength={LIMITS.contactName} value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Phone" name="phone" type="tel" required placeholder="0712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} error={phoneError} />
          <Field label="Email (optional)" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Save contact
          </Button>
        </div>
      </form>
    </Card>
  );
}
