import type { Metadata } from 'next';
import Link from 'next/link';
import { Highlight, PageHero, SectionHeading } from '@/components/marketing/section';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icons';
import { FAQ, PLANS } from '@/lib/constants/site';
import { cx } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free during early access: unlimited tickets, contacts and team members. Assisted setup available for businesses that want help getting started.',
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Simple pricing. <Highlight>Free while we grow together.</Highlight>
          </>
        }
        lead="Every feature is free during early access. If you would like a hand getting started, we offer an assisted setup."
      />

      <section className="relative -mt-px bg-canvas">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-20 sm:px-6 md:grid-cols-2">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={cx('flex flex-col rounded-2xl border bg-surface p-8', p.featured ? 'border-primary shadow-[0_24px_60px_-28px_rgb(14_24_56/0.45)] ring-1 ring-primary' : 'border-line')}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-primary">{p.name}</h2>
                {p.featured && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-on-secondary">Start here</span>}
              </div>
              <p className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-ink">{p.price}</span>
                <span className="text-sm text-muted">{p.period}</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">{p.description}</p>
              <LinkButton href={p.cta.href} variant={p.featured ? 'primary' : 'outline'} size="lg" className="mt-7 w-full font-semibold">
                {p.cta.label}
              </LinkButton>
              <ul className="mt-8 space-y-3 border-t border-line pt-8 text-sm text-ink">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:py-24">
          <div>
            <SectionHeading eyebrow="FAQ" title="Questions, answered" />
            <p className="mt-4 text-sm leading-6 text-muted">
              Something else on your mind?{' '}
              <Link href="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
                Get in touch
              </Link>
              .
            </p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Icon name="plus" className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
