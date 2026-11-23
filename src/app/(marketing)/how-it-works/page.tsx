import type { Metadata } from 'next';
import { Highlight, PageHero, SectionHeading } from '@/components/marketing/section';
import { QueueMock, TrackingMock } from '@/components/marketing/visuals';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icons';
import { APP_NAME } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'How it works',
  description: `How ${APP_NAME} takes a customer issue from first message to resolution, and how to set up your team in minutes.`,
};

const SETUP = [
  { title: 'Create your organization', text: 'Sign up, name your business and add your logo. Your support portal is live straight away.' },
  { title: 'Invite your team', text: 'Add agents and admins by email. Each person signs in with their own account and role.' },
  { title: 'Record your first ticket', text: 'Log the next customer issue that arrives and send the customer their tracking link.' },
];

const FLOW = [
  {
    title: 'A customer gets in touch',
    text: 'Amina messages your WhatsApp: her order #1042 has not arrived. Your agent records a ticket in seconds, choosing Amina as the contact, WhatsApp as the channel and adding the order reference.',
    points: ['Existing customers are found by name, phone or email', 'New customers are added right from the ticket form'],
  },
  {
    title: 'The right person takes it',
    text: 'The ticket lands in the shared queue. A supervisor assigns it to Wanjiru, who handles deliveries, and sets the priority to high.',
    points: ['Everyone sees who owns each ticket', 'Filter the queue by status, priority, owner or channel'],
  },
  {
    title: 'The team works it through',
    text: 'Wanjiru calls the courier and keeps an internal note with the waybill number. She moves the ticket to in progress and replies to Amina.',
    points: ['Internal notes are never shown to the customer', 'Receipts and photos stay attached to the ticket'],
  },
  {
    title: 'The customer follows along',
    text: 'Wanjiru shares the tracking link on WhatsApp. Amina sees the status and the reply, and answers from the same page. Once delivered, the ticket is resolved.',
    points: ['No account or app needed for the customer', 'Customer replies appear on the ticket instantly'],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title={
          <>
            From first message to <Highlight>resolved</Highlight>, without the chaos.
          </>
        }
        lead="Your team keeps talking to customers where they already are. We keep the record, the ownership and the follow-up in one place."
      />

      {/* setup */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <SectionHeading eyebrow="Getting started" title="Up and running in three steps" lead="No installation and no integration work. If you can use WhatsApp, you can use this." />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {SETUP.map((s, i) => (
            <li key={s.title} className="bg-surface p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary text-sm font-bold text-primary">{i + 1}</span>
              <h3 className="mt-5 text-lg font-semibold text-primary">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* the life of a ticket */}
      <section className="relative overflow-hidden border-y border-line bg-canvas">
        <div aria-hidden className="grid-lines-light fade-edges pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
          <SectionHeading eyebrow="The life of a ticket" title="One delivery complaint, start to finish" />
          <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <ol className="relative space-y-12 border-l-2 border-line pl-10">
              {FLOW.map((f, i) => (
                <li key={f.title} className="relative">
                  <span className="absolute -left-[3.35rem] flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary ring-4 ring-canvas">{i + 1}</span>
                  <h3 className="text-xl font-semibold text-primary">{f.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{f.text}</p>
                  <ul className="mt-4 space-y-2 text-sm text-ink">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {p}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
              <QueueMock />
              <div className="rounded-2xl bg-primary p-4 sm:p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">What the customer sees</p>
                <TrackingMock />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <SectionHeading align="center" title="See it with your own team" lead="Create a free account and record your first ticket in under five minutes." />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/register" size="lg" className="font-semibold">
            Get started free <Icon name="arrowRight" className="h-4 w-4" />
          </LinkButton>
          <LinkButton href="/features" variant="outline" size="lg">
            Explore features
          </LinkButton>
        </div>
      </section>
    </>
  );
}
