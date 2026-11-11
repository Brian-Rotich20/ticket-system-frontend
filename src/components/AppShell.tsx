'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth, useUser } from '@/context/auth-context';
import { NAV_ITEMS } from '@/lib/nav';
import { Button } from './ui/button';
import {cx} from '@/lib/utils';


const ROLE_STYLE = {
  CUSTOMER: 'bg-sky-100 text-sky-700',
  AGENT: 'bg-emerald-100 text-emerald-700',
  ADMIN: 'bg-violet-100 text-violet-700',
} as const;

export function AppShell({ children }: { children: ReactNode }) {
  const user = useUser();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  if (!user) return null;

  const items = NAV_ITEMS.filter((i) => i.roles.includes(user.role));

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/dashboard" className="font-semibold text-slate-900">
            Support Desk
          </Link>

          <nav className="flex flex-1 flex-wrap gap-1">
            {items.map((i) => {
              const active = pathname === i.href || pathname.startsWith(`${i.href}/`);
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  className={cx(
                    'rounded-lg px-3 py-1.5 text-sm font-medium',
                    active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {i.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <div className="text-right leading-tight">
              <div className="font-medium text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500">{user.tenantId}</div>
            </div>
            <span className={cx('rounded-full px-2 py-0.5 text-xs font-medium', ROLE_STYLE[user.role])}>{user.role}</span>
            <Button
              variant="secondary"
              onClick={async () => {
                await signOut();
                router.replace('/login');
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}