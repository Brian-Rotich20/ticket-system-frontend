'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Card, Field } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { ApiError, errorMessage } from '@/lib/api';
import { lookupStore } from '@/lib/auth';

type StoreState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'found'; slug: string; name: string }
  | { kind: 'missing'; slug: string }
  | { kind: 'error'; slug: string };

type StoreLookupResult = Exclude<StoreState, { kind: 'checking' }>;

export function SignupForm() {
  const { signUp, status } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [store, setStore] = useState(params.get('store') ?? ''); // sharable link: /signup?store=acme-store
  const [storeLookup, setStoreLookup] = useState<StoreLookupResult>({ kind: 'idle' });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const slug = store.trim().toLowerCase();
  const storeState: StoreState = !slug
    ? { kind: 'idle' }
    : storeLookup.kind !== 'idle' && storeLookup.slug === slug
      ? storeLookup
      : { kind: 'checking' };

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  // debounced store lookup
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const info = await lookupStore(slug, controller.signal);
        setStoreLookup({ kind: 'found', slug, name: info.name });
      } catch (err) {
        if (controller.signal.aborted) return;
        setStoreLookup(err instanceof ApiError && err.status === 404 ? { kind: 'missing', slug } : { kind: 'error', slug });
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [slug]);

  const storeHint =
    storeState.kind === 'checking' ? 'Checking...'
    : storeState.kind === 'found' ? <span className="text-emerald-600">{storeState.name}</span>
    : storeState.kind === 'error' ? 'Could not check the store right now.'
    : 'The store ID you were given, e.g. acme-store';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signUp({ name: name.trim(), email: email.trim().toLowerCase(), password, tenantId: store.trim().toLowerCase() });
      router.replace('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Get help from a store's support team.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field
          label="Store ID"
          name="store"
          required
          autoCapitalize="none"
          value={store}
          onChange={(e) => setStore(e.target.value)}
          error={storeState.kind === 'missing' ? 'Store not found. Check the ID with the store.' : undefined}
          hint={storeHint}
        />
        <Field label="Full name" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          hint="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" loading={busy} disabled={storeState.kind !== 'found'} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </Card>
  );
}