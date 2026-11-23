import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/logo';

const POINTS = [
  'Record issues from WhatsApp, Instagram, TikTok, calls, email and walk-ins',
  'Assign every ticket to someone and see it through to resolution',
  'Share a secure tracking link: customers follow progress without an account',
];

/** Split screen: brand panel on the left (large screens), form on the right. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden overflow-hidden bg-primary px-12 py-10 text-on-primary lg:flex lg:flex-col">
        <Link href="/" aria-label="Home">
          <Logo inverted />
        </Link>
        <div className="my-auto max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Customer support, organised</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">Every customer issue, recorded, owned and resolved.</h2>
          <ul className="mt-8 space-y-4 text-sm text-on-primary/80">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        {/* subtle grid texture, tokens only */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--color-on-primary)_1px,transparent_1px),linear-gradient(90deg,var(--color-on-primary)_1px,transparent_1px)] [background-size:32px_32px]" />
      </aside>

      <main className="flex flex-col bg-surface px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
            <span aria-hidden>←</span> Home
          </Link>
          <Link href="/" className="lg:hidden" aria-label="Home">
            <Logo />
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
