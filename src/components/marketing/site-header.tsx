'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/logo';
import { APP_NAME } from '@/lib/constants/brand';
import { MAIN_NAV } from '@/lib/constants/site';
import { cx } from '@/lib/utils';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-10 px-4 sm:px-6">
        <Link href="/" aria-label={`${APP_NAME} home`} className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {MAIN_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? 'page' : undefined}
              className={cx(
                'rounded-control px-3 py-2 text-sm font-medium transition-colors',
                active(n.href) ? 'bg-primary-soft text-primary' : 'text-ink/80 hover:bg-hover hover:text-ink',
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className="hidden rounded-control px-3 py-2 text-sm font-medium text-ink/80 hover:text-ink sm:block">
            Sign in
          </Link>
          <LinkButton href="/register" className="hidden font-semibold sm:inline-flex">
            Get started
          </LinkButton>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-control text-ink hover:bg-hover md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {open && (
        // any click on a link inside closes the menu
        <nav id="mobile-nav" aria-label="Mobile" onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)} className="border-t border-line bg-surface px-4 pb-6 pt-2 md:hidden">
          <ul className="divide-y divide-line">
            {MAIN_NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={cx('block py-3 text-base font-medium', active(n.href) ? 'text-primary' : 'text-ink')}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <LinkButton href="/login" variant="outline">
              Sign in
            </LinkButton>
            <LinkButton href="/register">Get started</LinkButton>
          </div>
        </nav>
      )}
    </header>
  );
}
