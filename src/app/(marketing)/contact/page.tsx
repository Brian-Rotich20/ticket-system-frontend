import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ContactForm } from '@/components/marketing/contact-form';
import { Highlight, PageHero } from '@/components/marketing/section';
import { LinkButton } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icons';
import { whatsappLink } from '@/lib/contact';
import { CONTACT } from '@/lib/constants/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Talk to us about getting your team set up, a custom support portal domain, or anything else.',
};

function Channel({ icon, label, children, href }: { icon: IconName; label: string; children: ReactNode; href?: string }) {
  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-success">
        <Icon name={icon} />
      </span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
        <span className="mt-1 block font-semibold text-ink">{children}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="flex items-center gap-4 bg-surface p-6 transition-colors hover:bg-canvas" target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          {body}
        </a>
      ) : (
        <div className="flex items-center gap-4 bg-surface p-6">{body}</div>
      )}
    </li>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s talk about <Highlight>your support team.</Highlight>
          </>
        }
        lead="Questions about setup, a portal on your own domain, or how other businesses use the product? Send us a message and we will get back to you."
      />

      <section className="bg-canvas">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:py-24">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary">Reach us directly</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Prefer to talk? Use whichever channel suits you.</p>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {CONTACT.email && (
                <Channel icon="mail" label="Email" href={`mailto:${CONTACT.email}`}>
                  {CONTACT.email}
                </Channel>
              )}
              {CONTACT.phone && (
                <Channel icon="phone" label="Phone" href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>
                  {CONTACT.phone}
                </Channel>
              )}
              {CONTACT.whatsapp && (
                <Channel icon="message" label="WhatsApp" href={whatsappLink(CONTACT.whatsapp, 'Hello, I would like to know more about your support ticketing.')}>
                  Chat with us
                </Channel>
              )}
              {CONTACT.location && (
                <Channel icon="pin" label="Location">
                  {CONTACT.location}
                </Channel>
              )}
              <Channel icon="clock" label="Hours">
                {CONTACT.hours}
              </Channel>
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Send us a message</h2>
            {CONTACT.email ? (
              <>
                <p className="mt-2 mb-8 text-sm text-muted">Tell us a little about your business and what you need.</p>
                <ContactForm to={CONTACT.email} />
              </>
            ) : (
              <div className="mt-4 text-sm leading-6 text-muted">
                <p>The fastest way to see if it fits your team is to try it: creating an account is free and takes a minute.</p>
                <LinkButton href="/register" size="lg" className="mt-6 font-semibold">
                  Create your free account <Icon name="arrowRight" className="h-4 w-4" />
                </LinkButton>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
