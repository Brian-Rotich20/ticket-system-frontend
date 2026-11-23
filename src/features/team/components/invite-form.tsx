'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { Field } from '@/components/ui/field';
import { SelectField } from '@/components/ui/select-field';
import { errorMessage } from '@/lib/api/client';
import { ROLE_HINT, ROLE_LABEL } from '@/lib/constants/roles';
import type { MemberRole } from '@/types/api';
import { absoluteLink, createInvitation } from '../api';

/** Invite by email. The acceptance link is shown once so it can also be shared directly (e.g. on WhatsApp). */
export function InviteForm({ onInvited }: { onInvited: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('AGENT');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ email: string; link: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await createInvitation({ email: email.trim().toLowerCase(), role });
      setSent({ email: res.invitation.email, link: absoluteLink(res.url, res.path) });
      setEmail('');
      onInvited();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="text-base font-semibold">Invite a team member</h2>
      <p className="mt-0.5 text-sm text-muted">They get an email with a link to join. Inviting the same email again replaces the old link.</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-[1fr_200px_auto] sm:items-end">
        <Field label="Email" name="email" type="email" required placeholder="agent@business.co.ke" value={email} onChange={(e) => setEmail(e.target.value)} />
        <SelectField label="Role" name="role" value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
          <option value="AGENT">{ROLE_LABEL.AGENT}</option>
          <option value="ADMIN">{ROLE_LABEL.ADMIN}</option>
        </SelectField>
        <Button type="submit" loading={busy}>
          Send invitation
        </Button>
      </form>
      <p className="mt-2 text-xs text-muted">{ROLE_HINT[role]}</p>
      {error ? <Alert className="mt-4">{error}</Alert> : null}
      {sent ? (
        <div className="mt-4 space-y-2 rounded-control border border-secondary/40 bg-secondary-soft p-3" role="status">
          <p className="text-sm font-medium text-success">Invitation sent to {sent.email}.</p>
          <p className="text-xs text-muted">You can also share this link with them directly. It is shown only now.</p>
          <p className="break-all rounded bg-surface px-2 py-1.5 font-mono text-xs">{sent.link}</p>
          <div className="flex gap-2">
            <CopyButton value={sent.link} label="Copy link" size="sm" />
            <Button variant="ghost" size="sm" onClick={() => setSent(null)}>
              Done
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
