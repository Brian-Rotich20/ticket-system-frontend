import type { Metadata } from 'next';
import { Highlight, PageHero, SectionHeading } from '@/components/marketing/section';
import { QueueMock, TrackingMock } from '@/components/marketing/visuals';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icons';
import { INDUSTRIES } from '@/lib/constants/site';
import { cx } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Features',
  description: 'A shared ticket queue, clear ownership, customer history, internal notes, tracking links, a branded support portal, roles and an audit log.',
};

const GROUPS = [
  {
    id: 'capture',
    eyebrow: 'Capture',
    title: 'Every issue recorded, whatever the channel',
    lead: 'Your team keeps chatting on WhatsApp, Instagram, TikTok, phone and email. Each issue becomes a ticket in one shared queue.',
    items: [
      { title: 'Six channels, one queue', text: 'WhatsApp, Instagram, TikTok, phone, email and walk-ins, with the channel noted on each ticket.' },
      { title: 'Order references', text: 'Attach the order or account number so anyone can pick the issue up without asking again.' },
      { title: 'Contacts with history', text: 'Customers are saved once and every past ticket is one click away.' },
      { title: 'Ticket numbers', text: 'Each organization gets its own running sequence that customers can quote back to you.' },
    ],
    visual: <QueueMock />,
  },
  {
    id: 'organise',
    eyebrow: 'Organise',
    title: 'Clear owners, clear priorities, clear status',
    lead: 'Work moves through simple stages, so your team and your customers always know where things stand.',
    items: [
      { title: 'Assignment', text: 'Give each ticket an owner and reassign it in one step when shifts change.' },
      { title: 'Priorities', text: 'Low, normal, high and urgent, so the queue shows what matters first.' },
      { title: 'Flexible stages', text: 'Open, in progress, waiting on customer, resolved and closed, with reopening when needed.' },
      { title: 'Notes and files', text: 'Internal notes and attachments stay with the ticket. Mark any file internal or shared.' },
    ],
    visual: null,
  },
  {
    id: 'inform',
    eyebrow: 'Inform',
    title: 'Customers stay in the loop without chasing you',
    lead: 'A private link shows the customer their request, its status and your replies. They can answer back from the same page.',
    items: [
      { title: 'Tracking links', text: 'Generate a link per ticket and share it on WhatsApp or SMS. No account or app needed.' },
      { title: 'Expiry and revocation', text: 'Links expire on their own, and an admin can revoke one instantly.' },
      { title: 'Branded support portal', text: 'A public page with your name and logo that explains how you handle support and opens tracking links.' },
      { title: 'Your own domain', text: 'Serve the portal from an address like support.yourbusiness.co.ke, set up with our help.' },
    ],
    visual: <TrackingMock />,
  },
  {
    id: 'control',
    eyebrow: 'Control',
    title: 'The right access for every person',
    lead: 'Admins run the workspace; agents handle tickets. Every important change is recorded.',
    items: [
      { title: 'Roles', text: 'Admins manage the team, settings and audit log. Agents record and work tickets.' },
      { title: 'Team invitations', text: 'Invite people by email, or add them directly, and deactivate access when someone leaves.' },
      { title: 'Audit log', text: 'See who created, assigned, changed or resolved what, and when.' },
      { title: 'Several organizations', text: 'Run more than one business from one login, with data kept completely separate.' },
    ],
    visual: null,
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title={
          <>
            Everything your support team needs. <Highlight>Nothing it doesn&apos;t.</Highlight>
          </>
        }
        lead="Simple enough to start today, structured enough to grow with you. Here is what your team gets from day one."
      >
        <nav aria-label="Feature groups" className="mt-10 flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="rounded-full border border-on-primary/25 px-4 py-2 text-sm font-medium text-on-primary/85 transition-colors hover:border-secondary hover:text-on-primary">
              {g.eyebrow}
            </a>
          ))}
        </nav>
      </PageHero>

      {GROUPS.map((g, gi) => (
        <section key={g.id} id={g.id} className={cx('scroll-mt-20 border-b border-line', gi % 2 === 1 && 'bg-canvas')}>
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
            <div className={cx('grid gap-12', g.visual && 'items-center lg:grid-cols-2')}>
              <div className={cx(g.visual && gi % 4 === 2 && 'lg:order-2')}>
                <SectionHeading eyebrow={`${String(gi + 1).padStart(2, '0')} · ${g.eyebrow}`} title={g.title} lead={g.lead} />
                <dl className={cx('mt-10 grid gap-x-10 gap-y-8', g.visual ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4')}>
                  {g.items.map((it) => (
                    <div key={it.title} className="border-l-2 border-secondary pl-4">
                      <dt className="font-semibold text-ink">{it.title}</dt>
                      <dd className="mt-1.5 text-sm leading-6 text-muted">{it.text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {g.visual}
            </div>
          </div>
        </section>
      ))}

      <section id="industries" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <SectionHeading eyebrow="Industries" title="Fits the way your business already works" />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind) => (
            <div key={ind.id} id={ind.id} className="scroll-mt-24 bg-surface p-8 target:bg-secondary-soft">
              <h3 className="text-lg font-semibold text-primary">{ind.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{ind.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href="/register" size="lg" className="font-semibold">
            Start for free <Icon name="arrowRight" className="h-4 w-4" />
          </LinkButton>
          <LinkButton href="/pricing" variant="outline" size="lg">
            See pricing
          </LinkButton>
        </div>
      </section>
    </>
  );
}
