'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { listMyOrganizations } from '@/features/organizations/api';
import { useQuery } from '@/hooks/use-query';
import { setActiveOrganization } from '@/lib/api/client';
import { getLastOrganization, setLastOrganization } from '@/lib/session';
import type { MemberRole, OrganizationMembership } from '@/types/api';

/** The remembered organization if the user still belongs to it, else the first one. */
export function chooseOrganization(list: OrganizationMembership[], preferred: string | null): OrganizationMembership | null {
  return list.find((o) => o.id === preferred) ?? list[0] ?? null;
}

interface OrganizationContextValue {
  organizations: OrganizationMembership[];
  current: OrganizationMembership;
  /** The user's role in the CURRENT organization (never a global role). */
  role: MemberRole;
  select(id: string): void;
  refresh(): void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

type Loaded = { status: 'ready'; value: OrganizationContextValue } | { status: 'loading' } | { status: 'error'; error: unknown; retry: () => void } | { status: 'none'; retry: () => void };

/**
 * Loads the user's organizations, picks the active one (remembered across visits) and makes every org-scoped
 * API request carry its id in X-Organization-Id. `children` is a render function so the shell can show the
 * loading / error / no-organization states itself.
 */
export function OrganizationProvider({ children }: { children: (state: Loaded) => ReactNode }) {
  const { data, error, loading, refetch } = useQuery((signal) => listMyOrganizations(signal), []);
  const [selected, setSelected] = useState<string | null>(() => getLastOrganization());

  const select = useCallback((id: string) => {
    setLastOrganization(id);
    setSelected(id);
  }, []);

  const current = data ? chooseOrganization(data, selected) : null;
  // set synchronously before children render, so their first requests already carry the header
  setActiveOrganization(current?.id ?? null);

  const value = useMemo<OrganizationContextValue | null>(
    () => (current && data ? { organizations: data, current, role: current.role, select, refresh: refetch } : null),
    [current, data, select, refetch],
  );

  let state: Loaded;
  if (value) state = { status: 'ready', value };
  else if (error) state = { status: 'error', error, retry: refetch };
  else if (loading || !data) state = { status: 'loading' };
  else state = { status: 'none', retry: refetch };

  return <OrganizationContext.Provider value={value}>{children(state)}</OrganizationContext.Provider>;
}

export function useOrganization(): OrganizationContextValue {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error('useOrganization must be used inside an organization-scoped page');
  return ctx;
}
