'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState, ErrorState, LoadingRows } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { Pagination } from '@/components/ui/pagination';
import { Tabs } from '@/components/ui/tabs';
import { useUser } from '@/context/auth-context';
import { useQuery } from '@/hooks/use-query';
import { errorMessage } from '@/lib/api/client';
import { MEMBER_STATUS_LABEL, ROLE_LABEL, ROLE_TONE } from '@/lib/constants/roles';
import { formatDate, formatDay } from '@/lib/utils';
import type { InvitationStatus, Member, MemberRole } from '@/types/api';
import { listInvitations, listMembers, revokeInvitation, updateMember } from '../api';
import { CreateMemberForm } from './create-member-form';
import { InviteForm } from './invite-form';

type Tab = 'members' | 'invitations';
const INVITATION_TONE: Record<InvitationStatus, 'info' | 'secondary' | 'neutral' | 'warning'> = { PENDING: 'info', ACCEPTED: 'secondary', REVOKED: 'neutral', EXPIRED: 'warning' };

function MemberRow({ member, isMe, onChanged }: { member: Member; isMe: boolean; onChanged: (m: Member) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(patch: { role?: MemberRole; status?: Member['status'] }) {
    setBusy(true);
    setError(null);
    try {
      onChanged(await updateMember(member.userId, patch));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const active = member.status === 'ACTIVE';
  return (
    <tr className={active ? undefined : 'bg-canvas'}>
      <td className="px-4 py-3">
        <p className="font-medium text-ink">
          {member.name} {isMe ? <span className="text-xs font-normal text-muted">(you)</span> : null}
        </p>
        <p className="text-xs text-muted">{member.email}</p>
        {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <label className="sr-only" htmlFor={`role-${member.userId}`}>
          Role of {member.name}
        </label>
        <select
          id={`role-${member.userId}`}
          value={member.role}
          disabled={busy || !active}
          onChange={(e) => void change({ role: e.target.value as MemberRole })}
          className="rounded-control border border-line-strong bg-surface px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-hover"
        >
          <option value="AGENT">{ROLE_LABEL.AGENT}</option>
          <option value="ADMIN">{ROLE_LABEL.ADMIN}</option>
        </select>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <Badge tone={active ? 'secondary' : 'neutral'}>{MEMBER_STATUS_LABEL[member.status]}</Badge>
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3 text-muted md:table-cell">{formatDay(member.createdAt)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        {active ? (
          <ConfirmButton size="sm" variant="danger" confirmLabel="Deactivate" loading={busy} onConfirm={() => void change({ status: 'DEACTIVATED' })}>
            Deactivate
          </ConfirmButton>
        ) : (
          <Button size="sm" variant="outline" loading={busy} onClick={() => void change({ status: 'ACTIVE' })}>
            Reactivate
          </Button>
        )}
      </td>
    </tr>
  );
}

function Members({ reloadKey }: { reloadKey: number }) {
  const user = useUser();
  const [page, setPage] = useState(1);
  const members = useQuery((signal) => listMembers({ page }, signal), [page, reloadKey]);
  if (members.error) return <ErrorState error={members.error} onRetry={members.refetch} />;
  if (!members.data) return <LoadingRows rows={4} />;
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <caption className="sr-only">Team members</caption>
          <thead className="bg-canvas text-xs font-medium uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 md:table-cell">Joined</th>
              <th className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {members.data.items.map((m) => (
              <MemberRow
                key={m.userId}
                member={m}
                isMe={m.userId === user.id}
                onChanged={(updated) => members.setData((p) => (p ? { ...p, items: p.items.map((x) => (x.userId === updated.userId ? updated : x)) } : p))}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">Deactivated members lose access immediately. Their tickets stay assigned until you reassign them.</p>
      <Pagination page={members.data.page} totalPages={members.data.totalPages} onPage={setPage} />
    </div>
  );
}

function Invitations({ reloadKey }: { reloadKey: number }) {
  const [page, setPage] = useState(1);
  const invitations = useQuery((signal) => listInvitations(page, signal), [page, reloadKey]);
  const [error, setError] = useState<string | null>(null);

  async function revoke(id: number) {
    setError(null);
    try {
      await revokeInvitation(id);
      invitations.refetch();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (invitations.error) return <ErrorState error={invitations.error} onRetry={invitations.refetch} />;
  if (!invitations.data) return <LoadingRows rows={3} />;
  if (invitations.data.items.length === 0) return <EmptyState title="No invitations yet" description="Invite agents by email above." />;
  return (
    <div className="space-y-3">
      {error ? <ErrorState error={new Error(error)} /> : null}
      <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        {invitations.data.items.map((i) => (
          <li key={i.invitationId} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{i.email}</p>
              <p className="text-xs text-muted">
                {ROLE_LABEL[i.role]} · invited by {i.invitedByName} on {formatDay(i.createdAt)}
                {i.status === 'PENDING' ? ` · expires ${formatDate(i.expiresAt)}` : ''}
                {i.acceptedAt ? ` · joined ${formatDay(i.acceptedAt)}` : ''}
              </p>
            </div>
            <Badge tone={INVITATION_TONE[i.status]}>{i.status.charAt(0) + i.status.slice(1).toLowerCase()}</Badge>
            {i.status === 'PENDING' ? (
              <ConfirmButton size="sm" variant="danger" confirmLabel="Revoke" onConfirm={() => void revoke(i.invitationId)}>
                Revoke
              </ConfirmButton>
            ) : null}
          </li>
        ))}
      </ul>
      <Pagination page={invitations.data.page} totalPages={invitations.data.totalPages} onPage={setPage} />
    </div>
  );
}

export function TeamView() {
  const [tab, setTab] = useState<Tab>('members');
  const [direct, setDirect] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Who can work on your customers' tickets, and what they can do."
        actions={
          !direct ? (
            <Button variant="ghost" onClick={() => setDirect(true)}>
              Create account directly
            </Button>
          ) : null
        }
      />
      <InviteForm
        onInvited={() => {
          reload();
          setTab('invitations');
        }}
      />
      {direct ? <CreateMemberForm onCreated={reload} onCancel={() => setDirect(false)} /> : null}
      <Tabs
        label="Show"
        value={tab}
        options={[
          { value: 'members', label: 'Members' },
          { value: 'invitations', label: 'Invitations' },
        ]}
        onChange={setTab}
      />
      {tab === 'members' ? <Members reloadKey={reloadKey} /> : <Invitations reloadKey={reloadKey} />}
      <p className="text-xs text-muted">
        Roles: <Badge tone={ROLE_TONE.ADMIN}>Admin</Badge> manages the team, settings and audit log; <Badge tone={ROLE_TONE.AGENT}>Agent</Badge> handles tickets.
      </p>
    </div>
  );
}
