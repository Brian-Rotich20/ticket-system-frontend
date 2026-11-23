import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icons';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants/brand';
import { CHANNEL_LABEL } from '@/lib/constants/tickets';
import type { Channel } from '@/types/api';

export const metadata: Metadata = { title: { absolute: `${APP_NAME} · Customer support ticketing for growing businesses` }, description: APP_TAGLINE };

const CHANNELS: Channel[] = ['WHATSAPP', 'INSTAGRAM', 'TIKTOK', 'PHONE', 'EMAIL', 'WALK_IN'];

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'tickets', title: 'One queue for every channel', text: 'Record issues from WhatsApp, Instagram, TikTok, calls, email and walk-ins in one place, with the channel noted on each ticket.' },
  { icon: 'team', title: 'Clear ownership', text: 'Assign each ticket to an agent, hand it over when needed, and see who is working on what at a glance.' },
  { icon: 'contacts', title: 'Customer history', text: 'Every customer is a contact with their full ticket history, so nobody has to explain their problem twice.' },
  { icon: 'lock', title: 'Internal notes', text: 'Discuss courier references, refunds and next steps privately. Notes never reach the customer.' },
  { icon: 'link', title: 'Secure tracking links', text: 'Customers follow progress and reply through a private link. No app to install, no account to create.' },
  { icon: 'audit', title: 'Accountability built in', text: 'An audit trail records who changed what and when, from assignments to resolutions.' },
];

const STEPS = [
  { title: 'Record', text: 'A customer messages you about a late delivery. Your agent records it in seconds: customer, channel, order reference.' },
  { title: 'Assign', text: 'The ticket goes to the right person. Everyone sees the queue, nobody wonders who is handling it.' },
  { title: 'Resolve', text: 'Work it through: in progress, waiting on the customer, resolved. Notes and files stay with the ticket.' },
  { title: 'Keep the customer informed', text: 'Share the tracking link on WhatsApp. The customer sees the status and your replies, and can answer back.' },
];

const BENEFITS = ['No more issues lost in chat threads', 'Know your open, waiting and resolved work at any time', 'Fewer “any update?” messages from customers', 'A branded support portal for your business'];

/** Illustrative preview of the product (static marketing content). */
function ProductPreview() {
  const rows = [
    { n: 1042, title: 'Order #1042 not delivered', who: 'Amina H.', ch: 'WhatsApp', status: <Badge tone="primary">In progress</Badge> },
    { n: 1043, title: 'Charged twice via M-Pesa', who: 'Peter K.', ch: 'Phone call', status: <Badge tone="warning">Waiting on customer</Badge> },
    { n: 1044, title: 'Return: wrong size shoes', who: 'Grace N.', ch: 'Instagram', status: <Badge tone="secondary">Resolved</Badge> },
  ];
  return (
    <div className="relative">
      <div className="rounded-card border border-line bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="text-sm font-semibold">Tickets</p>
          <span className="text-xs text-muted">3 open</span>
        </div>
        <ul className="divide-y divide-line">
          {rows.map((r) => (
            <li key={r.n} className="flex items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted">
                  #{r.n} · {r.who} · {r.ch}
                </p>
              </div>
              {r.status}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute -bottom-6 -left-4 hidden w-64 rounded-card border border-line bg-surface p-4 shadow-sm sm:block">
        <p className="flex items-center gap-2 text-xs font-medium text-success">
          <Icon name="check" className="h-4 w-4" /> Customer replied via tracking link
        </p>
        <p className="mt-1 text-sm text-ink">“Thanks! The rider has arrived.”</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main>
      {/* hero */}
      <section className="border-b border-line bg-canvas">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Customer support for growing businesses</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-6xl">Every customer issue, tracked to resolution.</h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Complaints, delivery problems and payment disputes arrive on WhatsApp, Instagram, TikTok, calls and in person. {APP_NAME} gives your team one place to record them, assign them,
              resolve them and keep customers informed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/register" size="lg">
                Start for free <Icon name="arrowRight" className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/#how-it-works" size="lg" variant="outline">
                See how it works
              </LinkButton>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {['Set up in minutes', 'Customers need no account', 'Built for teams of any size'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon name="check" className="h-4 w-4 text-secondary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <ProductPreview />
        </div>
      </section>

      {/* channels */}
      <section aria-label="Channels" className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-8 text-sm sm:px-6">
          <span className="text-muted">Record issues from</span>
          {CHANNELS.map((c) => (
            <span key={c} className="font-semibold text-ink">
              {CHANNEL_LABEL[c]}
            </span>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Everything your support team needs, nothing it doesn&apos;t</h2>
          <p className="mt-3 text-muted">Simple enough to start today, structured enough to grow with you.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-card border border-line p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary-soft text-primary">
                <Icon name={f.icon} />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-canvas">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-primary">How it works</h2>
          <p className="mt-3 max-w-2xl text-muted">Your team keeps talking to customers where they already are. {APP_NAME} keeps the record and the follow-up.</p>
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-card border border-line bg-surface p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary">{i + 1}</span>
                <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* customer tracking */}
      <section id="tracking" className="scroll-mt-20 bg-primary text-on-primary">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Customer tracking</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Your customers always know where things stand</h2>
            <p className="mt-4 text-on-primary/75">
              Send a private tracking link with one tap. Customers see your business name and logo, the current status and your replies, and can add details. Internal notes stay internal,
              always.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-on-primary/85">
              {['No sign-up or password for customers', 'Links expire and can be revoked at any time', 'Branded with your business name and logo'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <Icon name="check" className="h-4 w-4 text-secondary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card bg-surface p-6 text-ink">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Request #1042 · Delivery</p>
              <Badge tone="primary">In progress</Badge>
            </div>
            <p className="mt-2 text-xl font-semibold">Order #1042 not delivered</p>
            <p className="mt-4 rounded-control bg-primary-soft px-4 py-3 text-sm text-primary">Our team is working on your request.</p>
            <div className="mt-5 space-y-3 text-sm">
              <p className="rounded-card border border-line px-4 py-2.5">
                <span className="block text-xs text-muted">Wanjiru · ABC Store</span>The courier has your parcel and will deliver today.
              </p>
              <p className="ml-auto max-w-[80%] rounded-card bg-primary px-4 py-2.5 text-on-primary">Thank you! I&apos;ll be home after 3pm.</p>
            </div>
          </div>
        </div>
      </section>

      {/* why */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-primary">Why businesses switch</h2>
            <p className="mt-3 text-muted">When support lives in personal chats and notebooks, issues slip. A shared, structured record fixes that.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex gap-3 rounded-card border border-line p-5 text-sm font-medium text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-success">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* call to action */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 rounded-card bg-primary px-8 py-12 text-on-primary sm:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Start tracking customer issues today</h2>
            <p className="mt-2 text-on-primary/75">Create your business account, invite your team and record your first ticket in minutes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/register" variant="secondary" size="lg">
              Create your account
            </LinkButton>
            <LinkButton href="/login" size="lg" className="border border-on-primary/30">
              Sign in
            </LinkButton>
          </div>
        </div>
      </section>
    </main>
  );
}
