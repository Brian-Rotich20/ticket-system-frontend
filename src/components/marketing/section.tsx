import type { ReactNode } from 'react';
import { cx } from '@/lib/utils';

/** Small uppercase label above a heading. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-xs font-semibold uppercase tracking-[0.18em] text-secondary', className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={cx('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">{title}</h2>
      {lead && <p className="mt-4 text-base leading-7 text-muted">{lead}</p>}
    </div>
  );
}

/** Navy page header with grid lines, used at the top of every inner marketing page. */
export function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: ReactNode; lead: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-primary text-on-primary">
      <div aria-hidden className="grid-lines-dark fade-edges pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-on-primary/75">{lead}</p>
        {children}
      </div>
    </section>
  );
}

/** A green highlight inside a heading. */
export const Highlight = ({ children }: { children: ReactNode }) => <span className="text-secondary">{children}</span>;
