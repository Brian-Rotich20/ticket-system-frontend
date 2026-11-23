import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icons';
import { HERO_IMAGE } from '@/lib/constants/site';
import { cx } from '@/lib/utils';

/** Floating note card that sits over the edge of a visual. */
function Chip({ title, detail, className, tone = 'secondary' }: { title: string; detail: string; className?: string; tone?: 'secondary' | 'primary' }) {
  return (
    <div className={cx('absolute z-10 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-ink shadow-[0_12px_32px_-12px_rgb(14_24_56/0.35)]', className)}>
      <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-on-primary', tone === 'secondary' ? 'bg-secondary' : 'bg-primary')}>
        <Icon name={tone === 'secondary' ? 'check' : 'message'} className="h-4.5 w-4.5" />
      </span>
      <span>
        <span className="block text-sm font-semibold leading-tight">{title}</span>
        <span className="block text-xs text-muted">{detail}</span>
      </span>
    </div>
  );
}

/** Hero picture (configured in lib/constants/site.ts) on a white panel, with two status notes over its edges. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:ml-auto">
      {/* dashed orbit accent */}
      <div aria-hidden className="absolute -left-8 -top-8 h-28 w-28 rounded-full border-2 border-dashed border-secondary/60" />
      <div className="relative aspect-square overflow-hidden rounded-[2rem] rounded-tl-[6rem] bg-surface ring-1 ring-on-primary/10">
        <Image src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} fill preload sizes="(min-width: 1024px) 520px, 90vw" className="object-contain p-4" />
      </div>
      <Chip title="Ticket #1042 resolved" detail="Delivery · closed in 2 h" className="-left-4 top-[18%] sm:-left-10" />
      <Chip title="Customer replied" detail="via tracking link · just now" tone="primary" className="-right-2 bottom-[12%] sm:-right-8" />
    </div>
  );
}

const QUEUE = [
  { n: 1042, title: 'Order #1042 not delivered', who: 'Amina Hassan', ch: 'WhatsApp', priority: 'High', status: <Badge tone="primary">In progress</Badge> },
  { n: 1043, title: 'Charged twice via M-Pesa', who: 'Peter Kamau', ch: 'Phone call', priority: 'Urgent', status: <Badge tone="warning">Waiting on customer</Badge> },
  { n: 1044, title: 'Return: wrong size shoes', who: 'Grace Njeri', ch: 'Instagram', priority: 'Normal', status: <Badge tone="secondary">Resolved</Badge> },
  { n: 1045, title: 'Router keeps disconnecting', who: 'Brian Otieno', ch: 'Email', priority: 'Normal', status: <Badge tone="neutral">Open</Badge> },
];

/** Illustrative ticket queue (static marketing content). */
export function QueueMock({ className }: { className?: string }) {
  return (
    <div className={cx('overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-28px_rgb(14_24_56/0.35)]', className)}>
      <div className="flex items-center gap-2 border-b border-line bg-canvas px-5 py-3">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <p className="ml-3 text-xs font-medium text-muted">Tickets · All open</p>
      </div>
      <ul className="divide-y divide-line">
        {QUEUE.map((r) => (
          <li key={r.n} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{r.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted">
                #{r.n} · {r.who} · {r.ch} · {r.priority}
              </p>
            </div>
            {r.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Illustrative customer tracking page (static marketing content). */
export function TrackingMock({ className }: { className?: string }) {
  return (
    <div className={cx('rounded-2xl bg-surface p-6 text-ink shadow-[0_24px_60px_-28px_rgb(0_0_0/0.5)]', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted">ABC Store · Request #1042</p>
        <Badge tone="primary">In progress</Badge>
      </div>
      <p className="mt-2 text-xl font-semibold">Order #1042 not delivered</p>
      <ol className="mt-5 grid grid-cols-3 gap-2 text-[11px] font-medium">
        {['Received', 'In progress', 'Resolved'].map((s, i) => (
          <li key={s}>
            <span className={cx('block h-1.5 rounded-full', i < 2 ? 'bg-secondary' : 'bg-line')} />
            <span className={cx('mt-1.5 block', i < 2 ? 'text-ink' : 'text-subtle')}>{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 space-y-3 text-sm">
        <p className="max-w-[85%] rounded-2xl rounded-tl-sm border border-line px-4 py-2.5">
          <span className="block text-xs text-muted">Wanjiru · ABC Store</span>The courier has your parcel and will deliver today before 5pm.
        </p>
        <p className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-on-primary">Thank you! I&apos;ll be home after 3pm.</p>
      </div>
    </div>
  );
}
