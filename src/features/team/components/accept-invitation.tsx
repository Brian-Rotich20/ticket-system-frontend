'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ErrorState, NotFoundCard } from '@/components/shared/states';
import { Alert } from '@/components/ui/alert';
import { Button, LinkButton } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FullPageSpinner } from '@/components/ui/spinner';
import { useAuth } from '@/context/auth-context';
import { PasswordField } from '@/features/auth/components/password-field';
import { useQuery } from '@/hooks/use-query';
import { errorMessage, isApiError } from '@/lib/api/client';
import { ROLE_LABEL } from '@/lib/constants/roles';
import { setLastOrganization } from '@/lib/session';
import { DEFAULT_AFTER_LOGIN, formatDate } from '@/lib/utils';
import { acceptInvitation, getPublicInvitation } from '../api';

export function AcceptInvitation({ token }: { token: string }) {
  const router = useRouter();
  const { user, status, adoptToken, signOut } = useAuth();
  const invitation = useQuery((signal) => getPublicInvitation(token, signal), [token]);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join(e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const signedIn = status === 'authenticated';
      const { organization, sessionToken } = await acceptInvitation(token, signedIn ? {} : { name: name.trim(), password }, signedIn);
      setLastOrganization(organization.id);
      if (!signedIn && sessionToken) await adoptToken(sessionToken);
      router.replace(DEFAULT_AFTER_LOGIN);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (invitation.loading || status === 'loading') return <FullPageSpinner />;
  if (isApiError(invitation.error, 404)) {
    return <NotFoundCard title="This invitation can't be used" description="It is invalid, has expired or was already accepted. Ask your admin to send a new one." backHref="/login" backLabel="Go to sign in" />;
  }
  if (invitation.error || !invitation.data) return <ErrorState error={invitation.error} onRetry={invitation.refetch} />;

  const inv = invitation.data;
  const sameAccount = user && user.email.toLowerCase() === inv.email.toLowerCase();
  const next = encodeURIComponent(`/accept-invitation/${token}`);

  return (
    <div>
      <p className="text-center text-sm font-semibold uppercase tracking-wider text-secondary">Team invitation</p>
      <h1 className="mt-2 text-center text-3xl font-semibold tracking-tight">Join {inv.organization.name}</h1>
      <p className="mt-2 text-center text-sm text-muted">
        You have been invited as <strong className="text-ink">{ROLE_LABEL[inv.role]}</strong> ({inv.email}). The invitation expires {formatDate(inv.expiresAt)}.
      </p>

      <div className="mt-8 space-y-5">
        {error && <Alert>{error}</Alert>}

        {status === 'authenticated' && sameAccount ? (
          <Button size="lg" className="w-full" loading={busy} onClick={() => join()}>
            Join {inv.organization.name}
          </Button>
        ) : status === 'authenticated' ? (
          <Alert kind="warning">
            You are signed in as {user?.email}, but this invitation is for {inv.email}.{' '}
            <button type="button" className="font-semibold underline" onClick={() => void signOut()}>
              Sign out
            </button>{' '}
            and open the link again.
          </Alert>
        ) : inv.accountExists ? (
          <>
            <p className="text-sm text-muted">You already have an account with {inv.email}. Sign in, and you will come back here to join.</p>
            <LinkButton href={`/login?next=${next}`} size="lg" className="w-full">
              Sign in to accept
            </LinkButton>
          </>
        ) : (
          <form onSubmit={join} className="space-y-5">
            <Field label="Email" name="email" value={inv.email} disabled readOnly />
            <Field label="Your full name" name="name" required maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <PasswordField label="Choose a password" name="password" required minLength={8} maxLength={128} autoComplete="new-password" hint="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" size="lg" className="w-full" loading={busy}>
              Create account and join
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
