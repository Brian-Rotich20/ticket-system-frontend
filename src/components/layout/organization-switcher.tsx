'use client';

import { useRouter } from 'next/navigation';
import { useId } from 'react';
import { useOrganization } from '@/context/organization-context';
import { ROLE_LABEL } from '@/lib/constants/roles';

/** Shows the active organization; lets members of several organizations switch. */
export function OrganizationSwitcher() {
  const { organizations, current, select } = useOrganization();
  const router = useRouter();
  const id = useId();

  if (organizations.length <= 1) {
    return (
      <div className="min-w-0 rounded-control bg-on-primary/5 px-3 py-2">
        <p className="truncate text-sm font-semibold text-on-primary">{current.name}</p>
        <p className="text-xs text-on-primary/60">{ROLE_LABEL[current.role]}</p>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        Organization
      </label>
      <select
        id={id}
        value={current.id}
        onChange={(e) => {
          select(e.target.value);
          router.push('/app/dashboard'); // the previous page may belong to the other organization
        }}
        className="w-full cursor-pointer truncate rounded-control border border-on-primary/15 bg-on-primary/5 px-3 py-2 text-sm font-semibold text-on-primary focus:outline-none focus:ring-2 focus:ring-secondary [&>option]:text-ink"
      >
        {organizations.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} · {ROLE_LABEL[o.role]}
          </option>
        ))}
      </select>
    </div>
  );
}
