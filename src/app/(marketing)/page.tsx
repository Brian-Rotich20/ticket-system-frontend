import type { Metadata } from 'next';
import Link from 'next/link';
import { Highlight, SectionHeading } from '@/components/marketing/section';
import { HeroVisual, QueueMock, TrackingMock } from '@/components/marketing/visuals';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icons';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants/brand';
import { INDUSTRIES } from '@/lib/constants/site';
import { CHANNEL_LABEL } from '@/lib/constants/tickets';
import type { Channel } from '@/types/api';

export const metadata: Metadata = { title: { absolute: `${APP_NAME} · Customer support ticketing for growing businesses` }, description: APP_TAGLINE };

const CHANNELS: Channel[] = ['WHATSAPP', 'INSTAGRAM', 'TIKTOK', 'PHONE', 'EMAIL', 'WALK_IN'];

/** Facts about the product, not invented metrics. */
const FACTS = [
  { value: '6', label: 'Channels in one queue' },
  { value: '0', label: 'Accounts customers need' },
  { value: '5', label: 'Clear ticket stages' },
  { value: '24/7', label: 'Self-service tracking' },
];

const CAPABILITIES = [
  { title: 'One shared queue', text: 'Issues from every channel land in one list, with the channel, customer and order reference on each ticket.' },
  { title: 'Clear ownership', text: 'Assign each ticket to an agent and hand it over when needed. Everyone sees who is on what.' },
  { title: 'Customer history', text: 'Every customer is a contact with their full ticket history, so nobody explains their problem twice.' },
  { title: 'Internal notes', text: 'Discuss refunds, courier references and next steps privately. Notes never reach the customer.' },
  { title: 'Files where they belong', text: 'Receipts, photos and screenshots stay attached to the ticket, shared or kept internal.' },
  { title: 'Accountability', text: 'An audit trail records who assigned, changed or resolved what, and when.' },
];

const STEPS = [
  { title: 'Record', text: 'A customer messages you about a late delivery. Your agent logs it in seconds: customer, channel, order reference.' },
  { title: 'Assign', text: 'The ticket goes to the right person. The whole team sees the queue, so nothing waits unnoticed.' },
  { title: 'Resolve', text: 'Work it through from open to resolved. Notes, files and replies stay with the ticket.' },
  { title: 'Inform', text: 'Share the tracking link on WhatsApp. The customer follows progress and replies, without an account.' },
];

export default function LandingPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-primary text-on-primary">
        <div aria-hidden className="grid-lines-dark fade-edges pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:pb-20 lg:pt-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Customer support ticketing for growing businesses</p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
              Every customer issue, <Highlight>tracked to resolution.</Highlight>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-on-primary/80">
              Complaints, delivery problems and payment disputes arrive on WhatsApp, Instagram, TikTok, calls and in person. Give your team one place to record them, own them,
              resolve them and <strong className="font-semibold text-on-primary">keep every customer informed.</strong>
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton href="/register" variant="secondary" size="lg" className="font-semibold">
                Get started free <Icon name="arrowRight" className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/how-it-works" size="lg" className="border border-on-primary/40 bg-transparent font-semibold hover:bg-on-primary/10">
                See how it works
              </LinkButton>
            </div>
            <ul className="mt-8 grid max-w-lg gap-x-6 gap-y-2.5 text-sm text-on-primary/80 sm:grid-cols-2">
              {['Set up in minutes', 'Customers need no account', 'Free during early access', 'Built for teams of any size'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon name="check" className="h-4 w-4 text-secondary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroVisual />
        </div>

        {/* facts strip */}
        <div className="relative border-t border-on-primary/10">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
            {FACTS.map((f, i) => (
              <div key={f.label} className={`py-8 text-center ${i > 0 ? 'border-on-primary/10' : ''} ${i % 2 ? 'border-l' : ''} ${i === 2 ? 'lg:border-l' : ''} ${i > 1 ? 'border-t lg:border-t-0' : ''}`}>
                <dt className="sr-only">{f.label}</dt>
                <dd className="text-3xl font-bold text-secondary sm:text-4xl">{f.value}</dd>
                <dd className="mt-1.5 text-xs font-medium uppercase tracking-[0.14em] text-on-primary/60">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* channels */}
      <section aria-label="Channels" className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-7 sm:px-6">
          <span className="text-sm text-muted">Record issues from</span>
          {CHANNELS.map((c) => (
            <span key={c} className="text-base font-semibold text-primary/80">
              {CHANNEL_LABEL[c]}
            </span>
          ))}
        </div>
      </section>

      {/* product */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="The shared queue"
              title={
                <>
                  Stop running support from <Highlight>personal chats</Highlight> and notebooks.
                </>
              }
              lead="When issues live in someone's phone, they slip. A shared, structured queue means every complaint has an owner, a status and a history the whole team can see."
            />
            <Link href="/features" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover">
              Explore all features <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>
          <QueueMock />
        </div>

        {/* capabilities: bordered grid, no icon tiles */}
        <div className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c, i) => (
            <div key={c.title} className="bg-surface p-8">
              <span className="text-sm font-semibold text-secondary">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-lg font-semibold text-ink">{c.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="relative overflow-hidden border-y border-line bg-canvas">
        <div aria-hidden className="grid-lines-light fade-edges pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="How it works" title="From first message to resolved, in four steps" lead={`Your team keeps talking to customers where they already are. ${APP_NAME} keeps the record and the follow-up.`} />
            <LinkButton href="/how-it-works" variant="outline" className="self-start lg:self-auto">
              The full walkthrough <Icon name="arrowRight" className="h-4 w-4" />
            </LinkButton>
          </div>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-surface p-8">
                <span className="text-5xl font-bold text-primary/10">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* tracking */}
      <section className="relative overflow-hidden bg-primary text-on-primary">
        <div aria-hidden className="grid-lines-dark pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Customer tracking</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Fewer &ldquo;any update?&rdquo; messages. <Highlight>Happier customers.</Highlight>
            </h2>
            <p className="mt-5 text-base leading-7 text-on-primary/75">
              Send a private tracking link with one tap. Customers see your business name and logo, the current status and your replies, and can add details. Internal notes stay
              internal, always.
            </p>
            <ul className="mt-7 space-y-3.5 text-sm text-on-primary/85">
              {['No sign-up or password for customers', 'Links expire and can be revoked at any time', 'Branded with your business name and logo'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <TrackingMock className="lg:ml-auto lg:max-w-md" />
        </div>
      </section>

      {/* industries */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <SectionHeading eyebrow="Who it's for" title="Built for businesses that talk to customers all day" align="center" />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind) => (
            <Link key={ind.id} href={`/features#${ind.id}`} className="group bg-surface p-8 transition-colors hover:bg-canvas">
              <h3 className="flex items-center justify-between text-lg font-semibold text-primary">
                {ind.title}
                <Icon name="arrowRight" className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-1 group-hover:text-secondary" />
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">{ind.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
