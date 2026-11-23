'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { useAuth } from '@/context/auth-context';
import { errorMessage } from '@/lib/api/client';
import { DEFAULT_AFTER_LOGIN } from '@/lib/utils';
import { PasswordField } from './password-field';

/** The business owner creates their account and business; they become its admin. */
export function RegisterForm() {
  const { register, status } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ organizationName: '', name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && !busy) router.replace(DEFAULT_AFTER_LOGIN);
  }, [status, busy, router]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({
        organizationName: form.organizationName.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      setDone(true);
      router.replace(DEFAULT_AFTER_LOGIN);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-center text-3xl font-semibold tracking-tight">Create your business account</h1>
      <p className="mt-2 text-center text-sm text-muted">Set up your support workspace in a minute. You can invite your team next.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && <Alert>{error}</Alert>}
        <Field label="Business name" name="organizationName" required minLength={2} maxLength={120} autoComplete="organization" placeholder="e.g. ABC Internet" value={form.organizationName} onChange={set('organizationName')} />
        <Field label="Your full name" name="name" required maxLength={120} autoComplete="name" value={form.name} onChange={set('name')} />
        <Field label="Work email" name="email" type="email" required autoComplete="email" placeholder="you@business.co.ke" value={form.email} onChange={set('email')} />
        <PasswordField label="Password" name="password" required minLength={8} maxLength={128} autoComplete="new-password" hint="At least 8 characters" value={form.password} onChange={set('password')} />
        <Button type="submit" size="lg" loading={busy} className="w-full">
          {done ? 'Opening your workspace…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
