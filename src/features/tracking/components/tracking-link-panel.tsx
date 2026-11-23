'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { CopyButton } from '@/components/ui/copy-button';
import { Skeleton } from '@/components/ui/skeleton';
import { absoluteLink } from '@/features/team/api';
import { useQuery } from '@/hooks/use-query';
import { errorMessage } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import { createTrackingLink, getTrackingLinkStatus, revokeTrackingLink } from '../api';

/** Generate, share and revoke the customer's tracking link. The link is shown once, right after creation. */
export function TrackingLinkPanel({ ticketId }: { ticketId: number }) {
  const status = useQuery((signal) => getTrackingLinkStatus(ticketId, signal), [ticketId]);
  const [fresh, setFresh] = useState<{ link: string; expiresAt: string } | null>(null);
  const [busy, setBusy] = useState<'create' | 'revoke' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: 'create' | 'revoke') {
    setBusy(kind);
    setError(null);
    try {
      if (kind === 'create') {
        const created = await createTrackingLink(ticketId);
        setFresh({ link: absoluteLink(created.url, created.path), expiresAt: created.expiresAt });
      } else {
        await revokeTrackingLink(ticketId);
        setFresh(null);
      }
      status.refetch();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const s = status.data;
  return (
    <Card>
      <CardHeader title="Customer tracking link" description="The customer follows progress and replies here, without an account." />
      {error ? <Alert className="mb-3">{error}</Alert> : null}

      {fresh ? (
        <div className="mb-4 space-y-2 rounded-control border border-secondary/40 bg-secondary-soft p-3">
          <p className="text-xs font-medium text-success">New link: copy it now, it will not be shown again.</p>
          <p className="break-all rounded bg-surface px-2 py-1.5 font-mono text-xs text-ink">{fresh.link}</p>
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton value={fresh.link} label="Copy link" size="sm" />
            <span className="text-xs text-muted">Expires {formatDate(fresh.expiresAt)}</span>
          </div>
          <p className="text-xs text-muted">Send it on the channel you are talking on (WhatsApp, SMS, email…).</p>
        </div>
      ) : null}

      {!s ? (
        <Skeleton className="h-9 w-full" />
      ) : (
        <div className="space-y-3 text-sm">
          <p className="flex items-center gap-2">
            {s.active ? <Badge tone="secondary">Active</Badge> : <Badge tone="neutral">No active link</Badge>}
            {s.active && s.expiresAt ? <span className="text-muted">until {formatDate(s.expiresAt)}</span> : null}
          </p>
          <div className="flex flex-wrap gap-2">
            {s.active ? (
              <ConfirmButton size="sm" variant="outline" confirmLabel="Replace link" loading={busy === 'create'} onConfirm={() => run('create')}>
                New link
              </ConfirmButton>
            ) : (
              <Button size="sm" variant="secondary" loading={busy === 'create'} onClick={() => run('create')}>
                Create link
              </Button>
            )}
            {s.active ? (
              <ConfirmButton size="sm" variant="danger" confirmLabel="Revoke" loading={busy === 'revoke'} onConfirm={() => run('revoke')}>
                Revoke
              </ConfirmButton>
            ) : null}
          </div>
          {s.active ? <p className="text-xs text-muted">A new link stops the old one from working.</p> : null}
        </div>
      )}
    </Card>
  );
}
