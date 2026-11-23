'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/logo';
import { useAuth, useUser } from '@/context/auth-context';
import { useOrganization } from '@/context/organization-context';
import { cx } from '@/lib/utils';
import { isActive, navFor } from './nav';
import { OrganizationSwitcher } from './organization-switcher';

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const user = useUser();
  const { signOut } = useAuth();
  const { role } = useOrganization();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col bg-primary text-on-primary">
      <div className="px-5 pb-4 pt-5">
        <Link href="/app/dashboard" onClick={onNavigate} aria-label="Dashboard">
          <Logo inverted />
        </Link>
      </div>
      <div className="px-3">
        <OrganizationSwitcher />
      </div>

      <nav aria-label="Main" className="mt-6 flex-1 space-y-1 px-3">
        {navFor(role).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-on-primary/10 text-on-primary' : 'text-on-primary/70 hover:bg-on-primary/5 hover:text-on-primary',
              )}
            >
              <Icon name={item.icon} className={cx('h-5 w-5', active && 'text-secondary')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-on-primary/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={user.name} tone="secondary" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-on-primary/60">{user.email}</p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={async () => {
              await signOut();
              router.replace('/login');
            }}
            className="rounded-control p-2 text-on-primary/70 hover:bg-on-primary/10 hover:text-on-primary focus-visible:outline-2 focus-visible:outline-secondary"
          >
            <Icon name="logout" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Authenticated workspace: sidebar on large screens, a drawer on small ones. */
export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { current } = useOrganization();

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* mobile top bar + drawer */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
        <button type="button" aria-label="Open navigation" onClick={() => setOpen(true)} className="rounded-control p-2 text-ink hover:bg-hover">
          <Icon name="menu" />
        </button>
        <p className="truncate font-semibold">{current.name}</p>
      </header>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 max-w-[85%]">
            <Sidebar onNavigate={() => setOpen(false)} />
            <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="absolute right-2 top-4 rounded-control p-2 text-on-primary/80 hover:bg-on-primary/10">
              <Icon name="close" />
            </button>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
