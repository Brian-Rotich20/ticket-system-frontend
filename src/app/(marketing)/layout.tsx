import Link from 'next/link';
import type { ReactNode } from 'react';
import { LinkButton } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { APP_NAME } from '@/lib/constants/brand';

const NAV = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#tracking', label: 'Customer tracking' },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-4 sm:px-6">
          <Link href="/" aria-label={`${APP_NAME} home`}>
            <Logo />
          </Link>
          <nav aria-label="Main" className="hidden flex-1 items-center gap-7 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-sm font-medium text-muted hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className="hidden px-3 text-sm font-medium text-muted hover:text-ink sm:block">
              Sign in
            </Link>
            <LinkButton href="/register">Get started</LinkButton>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Logo />
            <p className="mt-2 max-w-sm text-sm text-muted">Customer support ticketing for businesses that sell on WhatsApp, Instagram, TikTok and in store.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-6 text-sm text-muted">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-ink">
                {n.label}
              </Link>
            ))}
            <Link href="/login" className="hover:text-ink">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-ink">
              Register
            </Link>
          </nav>
        </div>
        <p className="border-t border-line py-5 text-center text-xs text-subtle">© {new Date().getFullYear()} {APP_NAME}</p>
      </footer>
    </div>
  );
}
