import Link from 'next/link';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/logo';
import { APP_NAME } from '@/lib/constants/brand';
import { CONTACT, FOOTER_COLUMNS } from '@/lib/constants/site';

/** Closing call to action, shown above the footer on every marketing page. */
function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-primary text-on-primary">
      <div aria-hidden className="grid-lines-dark pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Ready to stop losing customer issues in chat threads?
          </h2>
          <p className="mt-4 text-base leading-7 text-on-primary/75">
            Create your free account today. Invite your team, record your first ticket and send your first tracking link in minutes.
          </p>
        </div>
        <div className="shrink-0">
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/register" variant="secondary" size="lg" className="font-semibold">
              Create your free account <Icon name="arrowRight" className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="/contact" size="lg" className="border border-on-primary/40 bg-transparent font-semibold hover:bg-on-primary/10">
              Talk to us
            </LinkButton>
          </div>
          <p className="mt-4 text-sm text-on-primary/60">No credit card · Free during early access · Customers need no account</p>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <>
      <ClosingCta />
      <footer className="bg-ink-deep text-on-primary">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div>
            <Link href="/" aria-label={`${APP_NAME} home`}>
              <Logo inverted />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-on-primary/65">
              Customer support ticketing for businesses that sell on WhatsApp, Instagram, TikTok, by phone and in store: record every issue, assign it, resolve it and keep
              customers informed.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-on-primary/85">
              {CONTACT.email && (
                <li>
                  <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2.5 hover:text-on-primary">
                    <Icon name="mail" className="h-4 w-4 text-secondary" /> {CONTACT.email}
                  </a>
                </li>
              )}
              {CONTACT.phone && (
                <li>
                  <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2.5 hover:text-on-primary">
                    <Icon name="phone" className="h-4 w-4 text-secondary" /> {CONTACT.phone}
                  </a>
                </li>
              )}
              {CONTACT.location && (
                <li className="inline-flex items-center gap-2.5">
                  <Icon name="pin" className="h-4 w-4 text-secondary" /> {CONTACT.location}
                </li>
              )}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={`${l.href}-${l.label}`}>
                      <Link href={l.href} className="text-sm text-on-primary/65 transition-colors hover:text-on-primary">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="border-t border-on-primary/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-on-primary/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p>Built for growing businesses in Kenya and beyond.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
