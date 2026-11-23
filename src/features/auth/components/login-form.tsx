'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { useAuth } from '@/context/auth-context';
import { errorMessage } from '@/lib/api/client';
import { safeNext } from '@/lib/utils';
import { PasswordField } from './password-field';

export function LoginForm() {
  const { signIn, status } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // a returning user with a valid session goes straight in
  useEffect(() => {
    if (status === 'authenticated') router.replace(next);
  }, [status, next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
    // on success the effect above redirects
  }

  return (
    <div>
      <h1 className="text-center text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-center text-sm text-muted">Welcome back. Sign in to your support workspace.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && <Alert>{error}</Alert>}
        <Field label="Email" name="email" type="email" autoComplete="email" required placeholder="you@business.co.ke" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="Password" name="password" autoComplete="current-password" required placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" size="lg" loading={busy} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New here?{' '}
        <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
          Create a business account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-subtle">Invited by your team? Open the link in your invitation email.</p>
    </div>
  );
}
