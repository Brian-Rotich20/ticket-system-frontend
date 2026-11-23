'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { LogoMark } from '@/components/ui/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicBusiness } from '@/features/organizations/api';
import { extractTrackingToken } from '@/features/tracking/api';
import { BusinessBrand } from '@/features/tracking/components/business-brand';
import { useQuery } from '@/hooks/use-query';
import { isApiError } from '@/lib/api/client';
import { APP_NAME } from '@/lib/constants/brand';

const STEPS = [
  { title: 'Contact us as usual', text: 'WhatsApp, Instagram, TikTok, a call, email or in person.' },
  { title: 'We record your request', text: 'Our team logs it, assigns it and gets to work.' },
  { title: 'Follow it here', text: 'We send you a private tracking link to see progress and reply.' },
];

/** A business's public support portal: branding, how support works, and a way to open a tracking link. */
export function PortalView({ slug }: { slug: string }) {
  const router = useRouter();
  const business = useQuery((signal) => getPublicBusiness(slug, signal), [slug]);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();

  function open(e: FormEvent) {
    e.preventDefault();
    const token = extractTrackingToken(value);
    if (!token) return setError('Paste the full tracking link you received, e.g. …/track/AbC123…');
    setError(undefined);
    router.push(`/track/${token}`);
  }

  if (isApiError(business.error, 404)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <Card className="max-w-md text-center">
          <h1 className="text-lg font-semibold">Support portal not found</h1>
          <p className="mt-2 text-sm text-muted">Check the address with the business you are contacting.</p>
        </Card>
      </div>
    );
  }

  const b = business.data;
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-4">{b ? <BusinessBrand name={b.name} logo={b.logo} /> : <Skeleton className="h-10 w-56" />}</div>
      </header>
      <main className="mx-auto max-w-4xl space-y-10 px-4 py-12">
        {business.error ? <ErrorState error={business.error} onRetry={business.refetch} /> : null}
        <section className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Customer support</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">{b ? `How can ${b.name} help?` : 'Customer support'}</h1>
          <p className="mt-3 text-muted">Every request you send us is recorded and followed up until it is resolved.</p>
        </section>

        <Card className="max-w-2xl">
          <h2 className="text-base font-semibold">Track a request</h2>
          <p className="mt-1 text-sm text-muted">Open the tracking link we sent you, or paste it here.</p>
          <form onSubmit={open} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <Field label="Tracking link" hideLabel name="tracking" placeholder="Paste your tracking link" value={value} onChange={(e) => setValue(e.target.value)} error={error} autoComplete="off" />
            </div>
            <Button type="submit" className="sm:mt-1.5">
              Open
            </Button>
          </form>
        </Card>

        <section aria-label="How support works" className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-card border border-line bg-surface p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-soft text-sm font-semibold text-success">{i + 1}</span>
              <h3 className="mt-3 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="pb-10 text-center text-xs text-subtle">
        <span className="inline-flex items-center gap-1.5">
          <LogoMark className="h-4 w-4" /> Powered by {APP_NAME}
        </span>
      </footer>
    </div>
  );
}
