'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState, ErrorState, LoadingRows } from '@/components/shared/states';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { useDebounced, useQuery } from '@/hooks/use-query';
import { cx, formatDay, plural } from '@/lib/utils';
import { listContacts } from '../api';
import { ContactForm } from './contact-form';

export function ContactsView() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const q = useDebounced(term);
  const [page, setPage] = useState({ q: '', n: 1 });
  const currentPage = page.q === q ? page.n : 1; // a new search starts at page 1
  const [adding, setAdding] = useState(false);
  const contacts = useQuery((signal) => listContacts(q, currentPage, signal), [q, currentPage]);
  const data = contacts.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Your customers. Search before adding someone, so each person has one ticket history."
        actions={
          !adding ? (
            <Button onClick={() => setAdding(true)}>
              <Icon name="plus" className="h-4 w-4" /> New contact
            </Button>
          ) : null
        }
      />

      {adding ? <ContactForm onCancel={() => setAdding(false)} onCreated={(c) => router.push(`/app/contacts/${c.contactId}`)} /> : null}

      <div className="max-w-md">
        <SearchInput label="Search contacts" hideLabel value={term} onChange={setTerm} placeholder="Search by name, phone or email" />
      </div>

      {contacts.error ? <ErrorState error={contacts.error} onRetry={contacts.refetch} /> : null}
      {contacts.loading && !data ? <LoadingRows rows={5} /> : null}
      {data && data.items.length === 0 ? (
        <EmptyState title={q ? 'No contacts match your search' : 'No contacts yet'} description={q ? 'Try another name or number.' : 'Contacts are added when you record a ticket, or here.'} />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <p className="text-sm text-muted">{plural(data.total, 'contact')}</p>
          <ul className={cx('divide-y divide-line overflow-hidden rounded-card border border-line bg-surface', contacts.loading && 'opacity-60')}>
            {data.items.map((c) => (
              <li key={c.contactId}>
                <Link href={`/app/contacts/${c.contactId}`} className="flex items-center gap-3 px-4 py-3 hover:bg-hover">
                  <Avatar name={c.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{c.name}</p>
                    <p className="truncate text-xs text-muted">{[c.phone, c.email].filter(Boolean).join(' · ') || 'No phone or email'}</p>
                  </div>
                  <span className="hidden text-xs text-subtle sm:block">Added {formatDay(c.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} onPage={(n) => setPage({ q, n })} />
        </>
      ) : null}
    </div>
  );
}
