'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { Field } from '@/components/ui/field';
import { SelectField } from '@/components/ui/select-field';
import { errorMessage } from '@/lib/api/client';
import type { Member, MemberRole } from '@/types/api';
import { createMember } from '../api';

/** Random temporary password without look-alike characters (0/O, 1/l/I). */
export function generatePassword(length = 14): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => alphabet.charAt(n % alphabet.length)).join('');
}

/** Alternative to an invitation: create the account directly with a temporary password. */
export function CreateMemberForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('AGENT');
  const [password, setPassword] = useState(() => generatePassword());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ member: Member; password: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const member = await createMember({ name: name.trim(), email: email.trim().toLowerCase(), password, role });
      setCreated({ member, password });
      onCreated();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <div role="status" className="space-y-3 rounded-card border border-secondary/40 bg-secondary-soft p-5">
        <p className="font-medium text-success">{created.member.name} can now sign in</p>
        <p className="text-sm text-muted">Share these details privately. The password is shown only now.</p>
        <dl className="grid gap-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
          <dt className="text-muted">Email</dt>
          <dd className="font-mono">{created.member.email}</dd>
          <dt className="text-muted">Password</dt>
          <dd className="font-mono">{created.password}</dd>
        </dl>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={`Email: ${created.member.email}\nPassword: ${created.password}`} label="Copy both" size="sm" />
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <h2 className="text-base font-semibold">Create an account directly</h2>
      <p className="mt-0.5 text-sm text-muted">For someone without email access. Prefer invitations: they choose their own password.</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        {error ? <Alert>{error}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Email" name="memberEmail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <SelectField label="Role" name="memberRole" value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </SelectField>
          <div>
            <Field label="Temporary password" name="password" required minLength={8} className="font-mono" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setPassword(generatePassword())} className="mt-1 text-xs font-medium text-primary hover:underline">
              Generate a new one
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Create account
          </Button>
        </div>
      </form>
    </Card>
  );
}
