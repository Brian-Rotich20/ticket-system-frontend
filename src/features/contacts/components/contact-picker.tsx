'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { SearchInput } from '@/components/ui/search-input';
import { Tabs } from '@/components/ui/tabs';
import { useDebounced, useQuery } from '@/hooks/use-query';
import { LIMITS } from '@/lib/constants/tickets';
import { cx } from '@/lib/utils';
import type { Contact } from '@/types/api';
import { listContacts } from '../api';

export type ContactChoice = { mode: 'existing'; contact: Contact | null } | { mode: 'new'; name: string; phone: string; email: string };

type Props = {
  value: ContactChoice;
  onChange: (value: ContactChoice) => void;
  errors?: { contact?: string; name?: string; phone?: string; email?: string };
};

/** Pick an existing contact or describe a new one. A new contact with a known phone number is reused by the API. */
export function ContactPicker({ value, onChange, errors = {} }: Props) {
  return (
    <fieldset className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <legend className="text-sm font-semibold text-ink">Customer</legend>
        <Tabs
          label="Customer"
          value={value.mode}
          options={[
            { value: 'existing', label: 'Existing contact' },
            { value: 'new', label: 'New contact' },
          ]}
          onChange={(mode) => onChange(mode === 'existing' ? { mode, contact: null } : { mode, name: '', phone: '', email: '' })}
        />
      </div>
      {value.mode === 'existing' ? <ExistingContact selected={value.contact} onSelect={(contact) => onChange({ mode: 'existing', contact })} error={errors.contact} /> : <NewContact value={value} onChange={onChange} errors={errors} />}
    </fieldset>
  );
}

function ExistingContact({ selected, onSelect, error }: { selected: Contact | null; onSelect: (c: Contact | null) => void; error?: string }) {
  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-control border border-primary/30 bg-primary-soft px-3 py-2.5">
        <Avatar name={selected.name} size="sm" tone="primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{selected.name}</p>
          <p className="truncate text-xs text-muted">{[selected.phone, selected.email].filter(Boolean).join(' · ') || 'No phone or email'}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
          Change
        </Button>
      </div>
    );
  }
  return <ContactSearch onSelect={onSelect} error={error} />;
}

function ContactSearch({ onSelect, error }: { onSelect: (c: Contact) => void; error?: string }) {
  const [term, setTerm] = useState('');
  const q = useDebounced(term, 300);
  const results = useQuery((signal) => listContacts(q, 1, signal, 8), [q]);
  return (
    <div>
      <SearchInput label="Find a contact" value={term} onChange={setTerm} placeholder="Name, phone or email" />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      <ul className={cx('mt-2 max-h-64 divide-y divide-line overflow-y-auto rounded-control border border-line', results.loading && 'opacity-60')} aria-label="Matching contacts">
        {results.data?.items.map((c) => (
          <li key={c.contactId}>
            <button type="button" onClick={() => onSelect(c)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-hover focus-visible:bg-hover focus-visible:outline-none">
              <Avatar name={c.name} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{c.name}</span>
                <span className="block truncate text-xs text-muted">{[c.phone, c.email].filter(Boolean).join(' · ')}</span>
              </span>
            </button>
          </li>
        ))}
        {results.data && results.data.items.length === 0 ? <li className="px-3 py-3 text-sm text-muted">No contacts found. Switch to “New contact”.</li> : null}
        {!results.data && results.loading ? <li className="px-3 py-3 text-sm text-muted">Searching…</li> : null}
      </ul>
    </div>
  );
}

function NewContact({ value, onChange, errors }: { value: Extract<ContactChoice, { mode: 'new' }>; onChange: (v: ContactChoice) => void; errors: Props['errors'] & object }) {
  const set = (k: 'name' | 'phone' | 'email') => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label="Name" name="contactName" required maxLength={LIMITS.contactName} value={value.name} onChange={set('name')} error={errors.name} />
      <Field label="Phone" name="contactPhone" type="tel" required placeholder="0712 345 678" value={value.phone} onChange={set('phone')} error={errors.phone} hint={errors.phone ? undefined : 'An existing contact with this number is reused.'} />
      <Field label="Email (optional)" name="contactEmail" type="email" value={value.email} onChange={set('email')} error={errors.email} />
    </div>
  );
}
